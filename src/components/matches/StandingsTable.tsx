import { computeStandings } from '@/lib/standings'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Match } from '@/types'
import type { Team } from '@/lib/schemas/team'

interface StandingsTableProps {
  matches: Match[]
  teamIds: string[]
  teams: Team[]
}

export function StandingsTable({ matches, teamIds, teams }: StandingsTableProps) {
  const completedMatches = matches.filter((m) => m.status === 'Completed' && !m.isBye)
  if (completedMatches.length === 0) {
    return <EmptyState title="No scores recorded yet" description="Standings will appear once matches are scored." />
  }

  const standings = computeStandings(matches, teamIds, teams)
  const teamNameMap = new Map(teams.map((t) => [t.id, t.name]))

  return (
    <div className="overflow-x-auto" data-testid="standings-table">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-court text-line">
            {['#', 'Team', 'P', 'W', 'L', 'PF', 'PA', 'Diff'].map((h) => (
              <th key={h} className="px-3 py-3 text-left font-medium first:w-8">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.teamId} className={i % 2 === 0 ? 'bg-surface' : 'bg-bg'}>
              <td className="px-3 py-3 font-heading text-lg text-muted">{i + 1}</td>
              <td className="px-3 py-3 font-medium">{teamNameMap.get(s.teamId) ?? s.teamId}</td>
              <td className="px-3 py-3 font-heading text-lg">{s.played}</td>
              <td className="px-3 py-3 font-heading text-lg text-court-green">{s.won}</td>
              <td className="px-3 py-3 font-heading text-lg text-danger">{s.lost}</td>
              <td className="px-3 py-3 font-heading text-lg">{s.pointsFor}</td>
              <td className="px-3 py-3 font-heading text-lg">{s.pointsAgainst}</td>
              <td className={`px-3 py-3 font-heading text-lg ${s.diff >= 0 ? 'text-court-green' : 'text-danger'}`}>
                {s.diff >= 0 ? `+${s.diff}` : s.diff}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
