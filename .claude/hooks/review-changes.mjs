#!/usr/bin/env node
// Stop hook: when Claude finishes a turn, review what changed in the working tree
// since the last review and save the report as change-review-<date>-<slug>.md in the repo root.
//
// - Snapshots the whole working tree (tracked + untracked, respecting .gitignore) into a git
//   tree object via a temporary index, so the diff also covers new files.
// - Diffs that snapshot against the last reviewed snapshot (or HEAD the first time).
// - Asks `claude -p` (read-only tools) for a structured review and renders it to Markdown.
//
// Env: SKIP_CHANGE_REVIEW=1 disables it, CHANGE_REVIEW_MODEL overrides the model (default: sonnet).

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, rmSync, statSync, writeFileSync, appendFileSync, openSync, closeSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHILD_FLAG = "CHANGE_REVIEW_CHILD";
const MODEL = process.env.CHANGE_REVIEW_MODEL || "sonnet";
const MAX_DIFF_CHARS = 150_000;
const CLAUDE_TIMEOUT_MS = 12 * 60 * 1000;
const LOCK_STALE_MS = 15 * 60 * 1000;

// The nested `claude -p` below fires its own Stop hook — never review from inside a review.
if (process.env[CHILD_FLAG] || process.env.SKIP_CHANGE_REVIEW === "1") process.exit(0);

const input = readStdinJson();
const root = git(["rev-parse", "--show-toplevel"], { cwd: input.cwd || process.cwd() }).trim();
const gitDir = git(["rev-parse", "--absolute-git-dir"], { cwd: root }).trim();
const stateFile = join(gitDir, "claude-last-review");
const lockFile = join(gitDir, "claude-review.lock");
const logFile = join(gitDir, "claude-review.log");

if (!acquireLock()) process.exit(0);
try {
  run();
} catch (err) {
  log(`ERROR ${err instanceof Error ? err.stack : String(err)}`);
} finally {
  rmSync(lockFile, { force: true });
}

function run() {
  const tree = snapshotWorkingTree();
  const headTree = tryGit(["rev-parse", "HEAD^{tree}"]);
  const lastTree = existsSync(stateFile) ? readFileSync(stateFile, "utf8").trim() : "";
  const base = (lastTree && tryGit(["cat-file", "-t", lastTree]) === "tree" ? lastTree : headTree) || emptyTree();

  if (base === tree) return; // nothing changed since the last review

  const stat = git(["diff", "--stat", base, tree]);
  let diff = git(["diff", base, tree, "--", ".", ":(exclude)package-lock.json"]);
  const truncated = diff.length > MAX_DIFF_CHARS;
  if (truncated) diff = diff.slice(0, MAX_DIFF_CHARS);

  const review = askClaude({ stat, diff, truncated, baseLabel: base === lastTree ? "the last review" : "the last commit" });
  if (!review) return;

  const now = new Date();
  const file = uniqueName(`change-review-${stamp(now)}-${slugify(review.slug)}`);
  writeFileSync(join(root, file), render(review, { now, stat, truncated }), "utf8");
  writeFileSync(stateFile, tree + "\n", "utf8");
  log(`wrote ${file}`);
  process.stdout.write(JSON.stringify({ systemMessage: `Change review saved: ${file} (${review.verdict})` }));
}

function snapshotWorkingTree() {
  const tmpIndex = join(tmpdir(), `claude-review-index-${process.pid}`);
  const realIndex = join(gitDir, "index");
  if (existsSync(realIndex)) copyFileSync(realIndex, tmpIndex); // speeds up `add -A`
  const env = { ...process.env, GIT_INDEX_FILE: tmpIndex };
  try {
    git(["add", "-A"], { env });
    return git(["write-tree"], { env }).trim();
  } finally {
    rmSync(tmpIndex, { force: true });
  }
}

function askClaude({ stat, diff, truncated, baseLabel }) {
  const prompt = `You are reviewing code changes in the Pickle Ball Score repo (current directory).
Claude Code just finished a task; the diff below is everything that changed since ${baseLabel}.

Apply the review checklist in .claude/agents/change-reviewer.md (Step 3) and the project rules in
CLAUDE.md and planning/Plan.md. Use Read/Grep/Glob to look at surrounding code when a hunk is not
self-explanatory. You are read-only: do not try to modify anything. Commands (lint, tests) are not
available here, so judge from the code.

Return:
- slug: 3-6 lowercase kebab-case words naming what changed (e.g. "add-player-zod-schema")
- title: one-line human title
- summary: 2-6 bullets describing what changed and why
- verdict: "ready" (fine to commit), "fix-first" (commit after fixes) or "rework"
- findings: concrete issues, most severe first (empty if none)
- looksGood: 1-3 short points
- planProgress: Plan.md tasks these changes appear to complete (empty if none)
- commitMessage: one Conventional Commits message for these changes

## Diff stat
${stat}
## Diff${truncated ? ` (truncated to ${MAX_DIFF_CHARS} chars — Read the files for the rest)` : ""}
${diff}`;

  const schema = {
    type: "object",
    required: ["slug", "title", "summary", "verdict", "findings", "commitMessage"],
    properties: {
      slug: { type: "string" },
      title: { type: "string" },
      summary: { type: "array", items: { type: "string" } },
      verdict: { type: "string", enum: ["ready", "fix-first", "rework"] },
      findings: {
        type: "array",
        items: {
          type: "object",
          required: ["severity", "location", "issue", "fix"],
          properties: {
            severity: { type: "string", enum: ["blocker", "should-fix", "nit", "suggestion"] },
            location: { type: "string", description: "path:line" },
            issue: { type: "string" },
            fix: { type: "string" },
          },
        },
      },
      looksGood: { type: "array", items: { type: "string" } },
      planProgress: { type: "array", items: { type: "string" } },
      commitMessage: { type: "string" },
    },
  };

  const res = spawnSync(
    "claude",
    [
      "-p",
      "--model", MODEL,
      "--output-format", "json",
      "--json-schema", JSON.stringify(schema),
      "--tools", "Read,Grep,Glob",
      "--allowedTools", "Read,Grep,Glob",
      "--no-session-persistence",
    ],
    {
      cwd: root,
      input: prompt,
      encoding: "utf8",
      timeout: CLAUDE_TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, [CHILD_FLAG]: "1" },
    },
  );
  if (res.error || res.status !== 0) {
    log(`claude -p failed (status ${res.status}): ${res.error ?? ""} ${res.stderr ?? ""}`);
    return null;
  }
  const out = JSON.parse(res.stdout);
  if (out.is_error || !out.structured_output) {
    log(`claude -p returned no review: ${out.subtype} ${out.result ?? ""}`);
    return null;
  }
  return out.structured_output;
}

function render(r, { now, stat, truncated }) {
  const verdict = { ready: "✅ Ready to commit", "fix-first": "⚠️ Commit after fixes", rework: "❌ Needs rework" }[r.verdict] ?? r.verdict;
  const sev = { blocker: "🔴 Blocker", "should-fix": "🟠 Should fix", nit: "🟡 Nit", suggestion: "💡 Suggestion" };
  const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  const list = (items, empty) => (items?.length ? items.map((i) => `- ${i}`).join("\n") : `_${empty}_`);
  const branch = tryGit(["rev-parse", "--abbrev-ref", "HEAD"]) || "(no commits yet)";
  const head = tryGit(["rev-parse", "--short", "HEAD"]) || "(none)";

  return `# ${r.title}

**Verdict:** ${verdict}
**Reviewed:** ${now.toLocaleString("en-IN")} · **Branch:** \`${branch}\` · **HEAD:** \`${head}\` · **Model:** ${MODEL}

## Summary
${list(r.summary, "No summary")}

## Findings
${
  r.findings.length
    ? `| # | Severity | Location | Issue | Suggested fix |\n|---|---|---|---|---|\n` +
      r.findings.map((f, i) => `| ${i + 1} | ${sev[f.severity] ?? f.severity} | \`${cell(f.location)}\` | ${cell(f.issue)} | ${cell(f.fix)} |`).join("\n")
    : "_No issues found._"
}

## What looks good
${list(r.looksGood, "—")}

## Plan.md progress
${list(r.planProgress, "No Plan.md tasks completed by these changes.")}

## Suggested commit message
\`\`\`
${r.commitMessage}
\`\`\`

## Files changed${truncated ? " (diff was truncated for review)" : ""}
\`\`\`
${stat.trimEnd()}
\`\`\`
`;
}

function acquireLock() {
  try {
    closeSync(openSync(lockFile, "wx"));
    return true;
  } catch {
    // Another review is running; take over only if its lock is stale.
    if (Date.now() - statSync(lockFile).mtimeMs < LOCK_STALE_MS) return false;
    rmSync(lockFile, { force: true });
    return acquireLock();
  }
}

function uniqueName(base) {
  let name = `${base}.md`;
  for (let i = 2; existsSync(join(root, name)); i++) name = `${base}-${i}.md`;
  return name;
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "changes";
}

function stamp(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function emptyTree() {
  return spawnSync("git", ["hash-object", "-t", "tree", "--stdin"], { cwd: root, input: "", encoding: "utf8" }).stdout.trim();
}

function git(args, opts = {}) {
  // opts.cwd first: the very first call runs before `root` is initialised.
  const res = spawnSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...opts, cwd: opts.cwd ?? root });
  if (res.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${res.stderr}`);
  return res.stdout;
}

function tryGit(args) {
  const res = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  return res.status === 0 ? res.stdout.trim() : "";
}

function readStdinJson() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

function log(msg) {
  appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
}
