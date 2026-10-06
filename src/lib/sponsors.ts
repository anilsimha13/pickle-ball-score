import type { Tournament, SponsorTier } from '@/types'

export function normaliseName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

interface AggregatedSponsor {
  name: string
  logo?: string
  website?: string
  tournaments: { id: string; name: string }[]
}

interface TierGroup {
  tier: SponsorTier
  sponsors: AggregatedSponsor[]
}

export function aggregateSponsors(tournaments: Tournament[]): TierGroup[] {
  const tiers: SponsorTier[] = ['Title', 'Gold', 'Silver']

  // Sort tournaments by startDate desc so latest wins on conflict
  const sorted = [...tournaments].sort((a, b) => b.startDate.localeCompare(a.startDate))

  const result: TierGroup[] = tiers.map((tier) => {
    // Map: normalisedName → AggregatedSponsor
    const map = new Map<string, AggregatedSponsor>()

    for (const t of sorted) {
      for (const s of t.sponsors) {
        if (s.tier !== tier) continue
        const key = normaliseName(s.name)
        if (!map.has(key)) {
          // First encounter (latest tournament wins because sorted desc)
          map.set(key, {
            name: s.name,
            logo: s.logo,
            website: s.website,
            tournaments: [{ id: t.id, name: t.name }],
          })
        } else {
          // Add tournament to existing entry (logo/website already set from latest)
          const existing = map.get(key)!
          if (!existing.tournaments.find((x) => x.id === t.id)) {
            existing.tournaments.push({ id: t.id, name: t.name })
          }
        }
      }
    }

    return { tier, sponsors: Array.from(map.values()) }
  })

  return result
}
