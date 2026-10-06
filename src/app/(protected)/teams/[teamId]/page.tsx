'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, User } from 'lucide-react'
import { useTeamStore } from '@/store/useTeamStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Tooltip } from '@/components/ui/Tooltip'
import { TeamRecord } from '@/components/teams/TeamRecord'
import { useToast } from '@/components/ui/Toast'
import { useTournamentStore } from '@/store/useTournamentStore'
import { teamRecord } from '@/lib/standings'

function TeamDetail({ teamId }: { teamId: string }) {
  const { getTeam, deleteTeam } = useTeamStore()
  const { getPlayer } = usePlayerStore()
  const { toast } = useToast()
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const team = getTeam(teamId)
  if (!team) return <NotFoundCard entity="team" />

  const p1 = getPlayer(team.playerIds[0])
  const p2 = getPlayer(team.playerIds[1])

  function handleDelete() {
    try {
      deleteTeam(teamId)
      toast('Team deleted.', 'success')
      router.push('/teams')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete team', 'error')
    }
  }

  const tournaments = useTournamentStore((s) => s.tournaments)
  const tournamentCount = tournaments.filter((t) => t.teamIds.includes(teamId)).length
  const deleteBlocked = tournamentCount > 0
  const deleteReason = deleteBlocked
    ? `This team is part of ${tournamentCount} tournament(s) and can't be deleted.`
    : ''

  return (
    <>
      <PageHeader
        title={team.name}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" data-testid="edit-team-btn">
              <Link href={`/teams/${teamId}/edit`}>Edit</Link>
            </Button>
            {deleteBlocked ? (
              <Tooltip content={deleteReason}>
                <Button variant="destructive" aria-disabled="true" data-testid="delete-team-btn">
                  Delete
                </Button>
              </Tooltip>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
                data-testid="delete-team-btn"
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      <Card kitchenStrip className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-bg flex items-center justify-center flex-shrink-0">
            {team.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.photo} alt={team.name} className="h-full w-full object-cover" />
            ) : (
              <Users className="h-8 w-8 text-muted" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted mb-1">W/L Record</p>
            <TeamRecord {...teamRecord(teamId, tournaments)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[p1, p2].map((player, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-bg p-3">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-surface flex items-center justify-center flex-shrink-0">
                {player?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.photo} alt={player.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-muted" aria-hidden="true" />
                )}
              </div>
              {player ? (
                <div className="min-w-0">
                  <Link href={`/players/${player.id}`} className="text-sm font-medium text-court hover:underline truncate block">
                    {player.name}
                  </Link>
                  <p className="text-xs text-muted truncate">{player.place} · {player.level}</p>
                </div>
              ) : (
                <p className="text-sm text-muted">Player {i + 1} not found</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Team"
        message={`Are you sure you want to delete "${team.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  )
}

export default function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params)
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HydrationGate>
        <TeamDetail teamId={teamId} />
      </HydrationGate>
    </div>
  )
}
