'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { User } from 'lucide-react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useTeamStore } from '@/store/useTeamStore'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Tooltip } from '@/components/ui/Tooltip'
import { useToast } from '@/components/ui/Toast'
import { isPlayerOnAnyTeam } from '@/lib/validation'

function PlayerDetail({ playerId }: { playerId: string }) {
  const { getPlayer, deletePlayer } = usePlayerStore()
  const { teams } = useTeamStore()
  const { toast } = useToast()
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const player = getPlayer(playerId)
  if (!player) return <NotFoundCard entity="player" />

  const onTeam = isPlayerOnAnyTeam(playerId, teams)
  const playerTeams = teams.filter((t) => t.playerIds.includes(playerId))

  function handleDelete() {
    try {
      deletePlayer(playerId)
      toast('Player deleted.', 'success')
      router.push('/players')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete player', 'error')
    }
  }

  return (
    <>
      <PageHeader
        title={player.name}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" data-testid="edit-player-btn">
              <Link href={`/players/${playerId}/edit`}>Edit</Link>
            </Button>
            {onTeam ? (
              <Tooltip content={`Remove ${player.name} from all teams before deleting.`}>
                <Button
                  variant="destructive"
                  aria-disabled="true"
                  data-testid="delete-player-btn"
                >
                  Delete
                </Button>
              </Tooltip>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
                data-testid="delete-player-btn"
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      <Card kitchenStrip className="p-6 mb-6 flex gap-6 items-start">
        <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden bg-bg flex items-center justify-center">
          {player.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.photo} alt={player.name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-12 w-12 text-muted" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Level:</span>
            <Badge variant={player.level.toLowerCase()}>{player.level}</Badge>
          </div>
          <p className="text-sm text-net"><span className="text-muted">Age:</span> {player.age}</p>
          <p className="text-sm text-net"><span className="text-muted">Place:</span> {player.place}</p>
        </div>
      </Card>

      <div>
        <h2 className="font-heading text-xl mb-3">Teams</h2>
        {playerTeams.length === 0 ? (
          <p className="text-muted text-sm">Not on any team yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {playerTeams.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/teams/${t.id}`}
                  className="block rounded-lg bg-surface px-4 py-3 hover:shadow-sm transition-shadow text-net"
                  data-testid={`player-team-link-${t.id}`}
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Player"
        message={`Are you sure you want to delete "${player.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  )
}

export default function PlayerDetailPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = use(params)
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HydrationGate>
        <PlayerDetail playerId={playerId} />
      </HydrationGate>
    </div>
  )
}
