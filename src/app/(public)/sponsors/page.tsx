'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { Skeleton } from '@/components/ui/Skeleton'
import { aggregateSponsors } from '@/lib/sponsors'
import { useTournamentStore } from '@/store/useTournamentStore'
import { cn } from '@/lib/utils'

const TIER_LABELS = {
  Title: 'Title Sponsors',
  Gold: 'Gold Sponsors',
  Silver: 'Silver Sponsors',
} as const

function SponsorsContent() {
  const tournaments = useTournamentStore((s) => s.tournaments)
  const groups = aggregateSponsors(tournaments)
  const hasAny = groups.some((g) => g.sponsors.length > 0)

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-heading text-2xl text-net">No sponsors yet — be the first!</p>
        <Link
          href="/contact?subject=Sponsorship"
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium',
            'bg-ball text-net hover:bg-ball-dark transition-colors',
          )}
          data-testid="become-sponsor-btn"
        >
          Become a Sponsor
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8" data-testid="sponsors-list">
      {groups
        .filter((g) => g.sponsors.length > 0)
        .map((group) => (
          <section key={group.tier} aria-labelledby={`tier-${group.tier}`}>
            <h2
              id={`tier-${group.tier}`}
              className="font-heading text-2xl text-court mb-4"
            >
              {TIER_LABELS[group.tier]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.sponsors.map((sponsor) => (
                <div
                  key={sponsor.name}
                  className="rounded-xl border border-muted bg-surface p-4 space-y-3"
                  data-testid={`sponsor-card-${sponsor.name}`}
                >
                  <div className="flex items-center gap-3">
                    {sponsor.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">
                        <span className="font-heading text-2xl text-muted">
                          {sponsor.name[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      {sponsor.website ? (
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-heading text-lg text-court hover:underline block truncate"
                          data-testid={`sponsor-link-${sponsor.name}`}
                        >
                          {sponsor.name}
                        </a>
                      ) : (
                        <p className="font-heading text-lg text-net truncate">{sponsor.name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">Tournaments:</p>
                    <ul className="space-y-0.5">
                      {sponsor.tournaments.map((t) => (
                        <li key={t.id} className="text-sm text-net">
                          {t.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

      <div className="text-center pt-4">
        <Link
          href="/contact?subject=Sponsorship"
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium',
            'bg-court text-line hover:bg-court/90 transition-colors',
          )}
          data-testid="become-sponsor-link"
        >
          Become a Sponsor
        </Link>
      </div>
    </div>
  )
}

export default function SponsorsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Sponsors" subtitle="Partners who make pickleball tournaments possible." />
      <HydrationGate fallback={<Skeleton className="h-64 rounded-xl" />}>
        <SponsorsContent />
      </HydrationGate>
    </div>
  )
}
