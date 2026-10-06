'use client'

import Link from 'next/link'
import { Users, UserCheck, Trophy, TrendingUp, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useTeamStore } from '@/store/useTeamStore'
import { useTournamentStore } from '@/store/useTournamentStore'
import { formatINR } from '@/lib/currency'

function StatCard({ icon, label, value, testId }: { icon: React.ReactNode; label: string; value: number; testId: string }) {
  return (
    <Card className="p-4 flex items-center gap-4" data-testid={testId}>
      <div className="rounded-lg bg-court p-3 text-line">{icon}</div>
      <div>
        <p className="text-3xl font-heading text-net">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </Card>
  )
}

function DashboardContent() {
  const players = usePlayerStore((s) => s.players)
  const teams = useTeamStore((s) => s.teams)
  const tournaments = useTournamentStore((s) => s.tournaments)

  const activeTournaments = tournaments.filter((t) => t.status === 'Drawn' || t.status === 'InProgress')
  const completedTournaments = tournaments.filter((t) => t.status === 'Completed' || t.status === 'Announced')
  const notStarted = tournaments
    .filter((t) => t.status === 'Draft' || t.status === 'Drawn')
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  const liveTournaments = tournaments.filter((t) => t.status === 'InProgress')
  const recentChampions = tournaments
    .filter((t) => t.status === 'Announced' && t.results)
    .sort((a, b) => (b.results!.announcedAt > a.results!.announcedAt ? 1 : -1))
    .slice(0, 5)

  const today = new Date().toISOString().slice(0, 10)

  if (players.length === 0 && teams.length === 0 && tournaments.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-2xl font-heading text-muted">No tournaments yet</p>
        <p className="text-muted">Create your first player to get started.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link href="/players/new" className="inline-flex items-center gap-2 rounded-lg bg-ball text-net px-4 py-2 font-medium hover:bg-ball-dark transition-colors" data-testid="create-player-btn">
            <Plus className="h-4 w-4" />Create Player
          </Link>
          <Link href="/teams/new" className="inline-flex items-center gap-2 rounded-lg bg-court text-line px-4 py-2 font-medium hover:bg-court/90 transition-colors" data-testid="create-team-btn">
            <Plus className="h-4 w-4" />Create Team
          </Link>
          <Link href="/tournaments/new" className="inline-flex items-center gap-2 rounded-lg bg-court text-line px-4 py-2 font-medium hover:bg-court/90 transition-colors" data-testid="create-tournament-btn">
            <Plus className="h-4 w-4" />Create Tournament
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Players" value={players.length} testId="stat-players" />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Teams" value={teams.length} testId="stat-teams" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Active Tournaments" value={activeTournaments.length} testId="stat-active" />
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Completed" value={completedTournaments.length} testId="stat-completed" />
      </div>

      {/* Live */}
      {liveTournaments.length > 0 && (
        <div>
          <h2 className="font-heading text-xl text-net mb-3">Live Now</h2>
          <div className="space-y-2">
            {liveTournaments.map((t) => (
              <Link key={t.id} href={`/tournaments/${t.id}`} className="block">
                <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-medium text-net">{t.name}</p>
                    <p className="text-sm text-muted">{t.venue}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Not started */}
      {notStarted.length > 0 && (
        <div>
          <h2 className="font-heading text-xl text-net mb-3">Upcoming</h2>
          <div className="space-y-2">
            {notStarted.map((t) => (
              <Link key={t.id} href={`/tournaments/${t.id}`} className="block">
                <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-medium text-net">{t.name}</p>
                    <p className="text-sm text-muted">{t.startDate} · {t.venue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.startDate < today && (
                      <span className="text-xs rounded-full bg-kitchen text-net px-2 py-0.5 font-medium">
                        Start date passed
                      </span>
                    )}
                    <StatusBadge status={t.status} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent champions */}
      {recentChampions.length > 0 && (
        <div>
          <h2 className="font-heading text-xl text-net mb-3">Recent Champions</h2>
          <div className="space-y-2">
            {recentChampions.map((t) => {
              const champion = teams.find((tm) => tm.id === t.results!.championId)
              return (
                <Link key={t.id} href={`/tournaments/${t.id}/results`} className="block">
                  <Card kitchenStrip className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide">{t.name}</p>
                      <p className="font-heading text-lg text-gold">{champion?.name ?? 'Unknown'}</p>
                    </div>
                    <p className="text-court-green font-medium">{formatINR(t.prizes.champion)}</p>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/players/new" className="inline-flex items-center gap-2 rounded-lg bg-ball text-net px-4 py-2 font-medium hover:bg-ball-dark transition-colors" data-testid="create-player-btn">
          <Plus className="h-4 w-4" />Player
        </Link>
        <Link href="/teams/new" className="inline-flex items-center gap-2 rounded-lg bg-court text-line px-4 py-2 font-medium hover:bg-court/90 transition-colors" data-testid="create-team-btn">
          <Plus className="h-4 w-4" />Team
        </Link>
        <Link href="/tournaments/new" className="inline-flex items-center gap-2 rounded-lg bg-court text-line px-4 py-2 font-medium hover:bg-court/90 transition-colors" data-testid="create-tournament-btn">
          <Plus className="h-4 w-4" />Tournament
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="Dashboard" subtitle="Pickle Ball Score" />
      <HydrationGate fallback={<Spinner className="py-16" />}>
        <DashboardContent />
      </HydrationGate>
    </div>
  )
}
