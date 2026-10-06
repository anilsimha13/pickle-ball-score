import type { Sponsor } from '@/types'

const TIER_LABELS = { Title: 'Title Sponsors', Gold: 'Gold Sponsors', Silver: 'Silver Sponsors' }

interface SponsorStripProps {
  sponsors: Sponsor[]
}

export function SponsorStrip({ sponsors }: SponsorStripProps) {
  if (sponsors.length === 0) return null

  const tiers = (['Title', 'Gold', 'Silver'] as const).map((tier) => ({
    tier,
    items: sponsors.filter((s) => s.tier === tier),
  }))

  return (
    <div className="space-y-3" data-testid="sponsor-strip">
      {tiers
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <div key={group.tier}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
              {TIER_LABELS[group.tier]}
            </p>
            <div className="flex flex-wrap gap-3">
              {group.items.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg border border-muted bg-surface px-3 py-2"
                  data-testid={`sponsor-${s.id}`}
                >
                  {s.logo && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={s.logo} alt={s.name} className="h-6 w-6 rounded object-cover" />
                  )}
                  {s.website ? (
                    <a
                      href={s.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-court hover:underline"
                    >
                      {s.name}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-net">{s.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
