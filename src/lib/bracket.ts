import type { Match } from '@/types'

export function roundName(round: number, totalRounds: number): string {
  if (round === totalRounds) return 'Final'
  if (round === totalRounds - 1) return 'Semifinal'
  if (round === totalRounds - 2) return 'Quarterfinal'
  const remaining = Math.pow(2, totalRounds - round + 1)
  return `Round of ${remaining}`
}

export function matchesInRound(matches: Match[], round: number): Match[] {
  return matches.filter((m) => m.round === round)
}

export function nextMatch(matches: Match[], match: Match): Match | null {
  if (match.type === 'ThirdPlace') return null
  const nextRound = match.round + 1
  const nextPos = Math.floor(match.position / 2)
  return matches.find((m) => m.round === nextRound && m.position === nextPos && m.type === 'Knockout') ?? null
}

export function getThirdPlaceMatch(matches: Match[]): Match | undefined {
  return matches.find((m) => m.type === 'ThirdPlace')
}

export function getFinalMatch(matches: Match[]): Match | undefined {
  return matches.find((m) => m.type === 'Knockout' && m.position === 0 && !matches.some((x) => x.round > m.round && x.type === 'Knockout'))
}

export function advanceWinner(matches: Match[], completedMatch: Match): Match[] {
  const updated = matches.map((m) => ({ ...m }))

  if (completedMatch.type === 'ThirdPlace') return updated

  const next = nextMatch(updated, completedMatch)
  if (next && completedMatch.winnerId) {
    const idx = updated.findIndex((m) => m.id === next.id)
    if (idx >= 0) {
      if (completedMatch.position % 2 === 0) {
        updated[idx] = { ...updated[idx], teamAId: completedMatch.winnerId }
      } else {
        updated[idx] = { ...updated[idx], teamBId: completedMatch.winnerId }
      }
    }
  }

  // If this is a semi-final, fill the 3rd place match with the loser
  const finalMatch = getFinalMatch(updated)
  if (finalMatch && completedMatch.round === finalMatch.round - 1 && completedMatch.type === 'Knockout') {
    const loserId =
      completedMatch.winnerId === completedMatch.teamAId ? completedMatch.teamBId : completedMatch.teamAId

    const thirdPlace = getThirdPlaceMatch(updated)
    if (thirdPlace && loserId) {
      const tpIdx = updated.findIndex((m) => m.id === thirdPlace.id)
      if (tpIdx >= 0) {
        // Find the other semi-final
        const otherSemi = updated.find(
          (m) =>
            m.round === completedMatch.round &&
            m.type === 'Knockout' &&
            m.id !== completedMatch.id,
        )
        if (otherSemi?.winnerId) {
          // Both semi-finals done — fill 3rd place
          const otherLoserId =
            otherSemi.winnerId === otherSemi.teamAId ? otherSemi.teamBId : otherSemi.teamAId
          updated[tpIdx] = {
            ...updated[tpIdx],
            teamAId: loserId,
            teamBId: otherLoserId ?? null,
          }
        } else {
          // Fill the slot for this semi-final's loser
          if (updated[tpIdx].teamAId === null) {
            updated[tpIdx] = { ...updated[tpIdx], teamAId: loserId }
          } else {
            updated[tpIdx] = { ...updated[tpIdx], teamBId: loserId }
          }
        }
      }
    }
  }

  return updated
}

export function canEditCompletedMatch(matches: Match[], matchId: string): boolean {
  const match = matches.find((m) => m.id === matchId)
  if (!match || match.status !== 'Completed') return false

  const finalMatch = getFinalMatch(matches)
  const thirdPlace = getThirdPlaceMatch(matches)
  const isSemiFinal = finalMatch && match.round === finalMatch.round - 1 && match.type === 'Knockout'

  if (isSemiFinal) {
    // Both Final AND 3rd Place must be clear
    const finalClear = finalMatch && finalMatch.games.length === 0 && !finalMatch.isWalkover
    const thirdClear = thirdPlace && thirdPlace.games.length === 0 && !thirdPlace.isWalkover
    return !!(finalClear && thirdClear)
  }

  const next = nextMatch(matches, match)
  if (!next) return true
  return next.games.length === 0 && !next.isWalkover
}
