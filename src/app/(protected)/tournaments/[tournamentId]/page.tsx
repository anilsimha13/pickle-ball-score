'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Edit, Trash2, Users, Trophy, BarChart2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { Spinner } from '@/components/ui/Spinner'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Tooltip } from '@/components/ui/Tooltip'
import { Card } from '@/components/ui/Card'
import { SponsorStrip } from '@/components/tournaments/SponsorStrip'
import { PrizeTable } from '@/components/tournaments/PrizeTable'
import { TeamPicker } from '@/components/tournaments/TeamPicker'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useToast } from '@/components/ui/Toast'
import { canDeleteTournament, canEditMeta, isFullyReadOnly } from '@/lib/tournament'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

function TournamentDetail({ tournamentId }: { tournamentId: string }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const getTournament = useTournamentStore((s) => s.getTournament)
  const deleteTournament = useTournamentStore((s) => s.deleteTournament)

  const t = getTournament(tournamentId)

  if (!t) return <NotFoundCard entity="tournament" />

  const canDelete = canDeleteTournament(t)
  const canEdit = canEditMeta('name', t.status)
  const readOnly = isFullyReadOnly(t)

  function handleDelete() {
    try {
      deleteTournament(t!.id)
      toast('Tournament deleted', 'success')
      router.push('/tournaments')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-2xl text-net">{t.name}</h2>
            <StatusBadge status={t.status} />
          </div>
          <p className="text-sm text-muted mt-1">
            {t.venue} · {t.startDate} – {t.endDate}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {canEdit && !readOnly && (
            <Link
              href={`/tournaments/${t.id}/edit`}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium',
                'bg-court text-line hover:bg-court/90 transition-colors',
              )}
              data-testid="edit-tournament-btn"
            >
              <Edit className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Link>
          )}

          {canDelete ? (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium',
                'bg-danger text-line hover:bg-danger/90 transition-colors',
              )}
              data-testid="delete-tournament-btn"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
          ) : (
            <Tooltip content="Tournament cannot be deleted once scoring has started">
              <button
                type="button"
                aria-disabled="true"
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium',
                  'bg-danger text-line opacity-50 cursor-not-allowed',
                )}
                data-testid="delete-tournament-btn-disabled"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {t.bannerImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={t.bannerImage}
          alt={`${t.name} banner`}
          className="w-full max-h-48 rounded-xl object-cover"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-net">
        <div className="space-y-1">
          <p><span className="text-muted">Format:</span> Best of {t.bestOf}, {t.pointsPerGame} pts/game</p>
          <p><span className="text-muted">Teams:</span> {t.teamIds.length}</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/tournaments/${t.id}/teams`}
          className="inline-flex items-center gap-1 rounded-lg bg-bg border border-muted px-3 py-2 text-sm text-net hover:bg-court/10 transition-colors"
          data-testid="teams-link"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Manage Teams
        </Link>
        <Link
          href={`/tournaments/${t.id}/bracket`}
          className="inline-flex items-center gap-1 rounded-lg bg-bg border border-muted px-3 py-2 text-sm text-net hover:bg-court/10 transition-colors"
          data-testid="bracket-link"
        >
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Bracket
        </Link>
        <Link
          href={`/tournaments/${t.id}/standings`}
          className="inline-flex items-center gap-1 rounded-lg bg-bg border border-muted px-3 py-2 text-sm text-net hover:bg-court/10 transition-colors"
          data-testid="standings-link"
        >
          <BarChart2 className="h-4 w-4" aria-hidden="true" />
          Standings
        </Link>
        <Link
          href={`/tournaments/${t.id}/results`}
          className="inline-flex items-center gap-1 rounded-lg bg-bg border border-muted px-3 py-2 text-sm text-net hover:bg-court/10 transition-colors"
          data-testid="results-link"
        >
          🏆 Results
        </Link>
      </div>

      <Card kitchenStrip className="p-4">
        <h3 className="font-heading text-lg text-net mb-3">Prize Money</h3>
        <PrizeTable prizes={t.prizes} />
      </Card>

      {t.sponsors.length > 0 && (
        <Card className="p-4">
          <h3 className="font-heading text-lg text-net mb-3">Sponsors</h3>
          <SponsorStrip sponsors={t.sponsors} />
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-heading text-lg text-net mb-3">Teams</h3>
        <TeamPicker tournament={t} readOnly={t.status !== 'Draft'} />
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Tournament"
        message={`Are you sure you want to delete "${t.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}

export default function TournamentDetailPage() {
  const params = useParams()
  const tournamentId = params.tournamentId as string

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Tournament" />
      <HydrationGate fallback={<Spinner className="py-16" />}>
        <TournamentDetail tournamentId={tournamentId} />
      </HydrationGate>
    </div>
  )
}
