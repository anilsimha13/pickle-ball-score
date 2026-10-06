import Link from 'next/link'
import { MapPin, Calendar, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatINR } from '@/lib/currency'
import type { Tournament } from '@/types'

interface TournamentCardProps {
  tournament: Tournament
}

export function TournamentCard({ tournament: t }: TournamentCardProps) {
  return (
    <Link href={`/tournaments/${t.id}`} data-testid={`tournament-card-${t.id}`}>
      <Card kitchenStrip className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-heading text-lg text-net truncate">{t.name}</p>
            <StatusBadge status={t.status} />
          </div>
          {t.bannerImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={t.bannerImage}
              alt={t.name}
              className="h-12 w-20 rounded object-cover flex-shrink-0"
            />
          )}
        </div>

        <div className="mt-3 space-y-1 text-sm text-muted">
          <p className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {t.venue}
          </p>
          <p className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {t.startDate} – {t.endDate}
          </p>
          <p className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {t.teamIds.length} team{t.teamIds.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="mt-3 flex gap-3 text-xs font-medium">
          <span className="text-gold">🏆 {formatINR(t.prizes.champion)}</span>
          <span className="text-silver">🥈 {formatINR(t.prizes.runnerUp)}</span>
          <span className="text-bronze">🥉 {formatINR(t.prizes.thirdPlace)}</span>
        </div>
      </Card>
    </Link>
  )
}
