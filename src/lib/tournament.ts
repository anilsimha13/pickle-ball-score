import type { Tournament, TournamentStatus } from '@/types'

export function canDeleteTournament(t: Tournament): boolean {
  return t.status === 'Draft' || t.status === 'Drawn'
}

export function canEditField(
  field: 'teamIds' | 'pointsPerGame' | 'bestOf' | 'draw',
  status: TournamentStatus,
): boolean {
  return status === 'Draft'
}

export function canEditMeta(
  field: 'name' | 'bannerImage' | 'venue' | 'dates' | 'prizes' | 'sponsors',
  status: TournamentStatus,
): boolean {
  void field
  return status !== 'Announced'
}

export function canReshuffle(t: Tournament): boolean {
  if (t.status !== 'Drawn') return false
  return !t.matches.some((m) => m.games.length > 0 || m.isWalkover)
}

export function isFullyReadOnly(t: Tournament): boolean {
  return t.status === 'Announced'
}
