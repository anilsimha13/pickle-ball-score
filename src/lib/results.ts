import type { Tournament } from '@/types'
import { getFinalMatch, getThirdPlaceMatch } from './bracket'
import { todayLocalDate, isOnOrAfter } from './dates'

export interface AnnounceEligibility {
  eligible: boolean
  reasons: string[]
}

export interface Podium {
  champion: { teamId: string; prize: number }
  runnerUp: { teamId: string; prize: number }
  thirdPlace: { teamId: string; prize: number }
}

export function announceEligibility(tournament: Tournament): AnnounceEligibility {
  const reasons: string[] = []

  const today = todayLocalDate()
  if (!isOnOrAfter(today, tournament.endDate)) {
    reasons.push(`Available from ${tournament.endDate}`)
  }

  const finalMatch = getFinalMatch(tournament.matches)
  if (!finalMatch || finalMatch.status !== 'Completed') {
    reasons.push('Final not completed')
  }

  const thirdPlace = getThirdPlaceMatch(tournament.matches)
  if (!thirdPlace || thirdPlace.status !== 'Completed') {
    reasons.push('3rd Place match not completed')
  }

  return { eligible: reasons.length === 0, reasons }
}

export function getPodium(tournament: Tournament): Podium | null {
  if (!tournament.results) return null
  return {
    champion: { teamId: tournament.results.championId, prize: tournament.prizes.champion },
    runnerUp: { teamId: tournament.results.runnerUpId, prize: tournament.prizes.runnerUp },
    thirdPlace: { teamId: tournament.results.thirdPlaceId, prize: tournament.prizes.thirdPlace },
  }
}
