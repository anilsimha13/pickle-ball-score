export type GameScore = { teamA: number; teamB: number }

// Returns null if valid, error string if invalid (uses 1-based game index in message)
export function validateGameScore(
  teamA: number,
  teamB: number,
  pointsPerGame: number,
  gameIndex: number,
): string | null {
  const n = gameIndex + 1
  const T = pointsPerGame
  if (teamA === teamB) return `Game ${n}: scores can't be tied.`
  const W = Math.max(teamA, teamB)
  const L = Math.min(teamA, teamB)
  if (W === pointsPerGame && L <= pointsPerGame - 2) return null
  if (W > pointsPerGame && W - L === 2) return null
  return `Game ${n}: the winner must reach ${T} points and win by 2.`
}

export function validateGames(
  games: GameScore[],
  pointsPerGame: number,
  bestOf: 1 | 3,
): string[] {
  const errors: string[] = []
  // Check each game score
  for (let i = 0; i < games.length; i++) {
    const err = validateGameScore(games[i].teamA, games[i].teamB, pointsPerGame, i)
    if (err) errors.push(err)
  }

  // Check bestOf limits
  if (bestOf === 1) {
    if (games.length > 1) {
      errors.push('This match is already decided — remove the extra game.')
    }
    return errors
  }

  // bestOf === 3
  if (games.length > 3) {
    errors.push('This match is already decided — remove the extra game.')
    return errors
  }

  // Check if we have more games than needed
  if (games.length >= 2) {
    let aWins = 0
    let bWins = 0
    for (let i = 0; i < games.length - 1; i++) {
      if (games[i].teamA > games[i].teamB) aWins++
      else if (games[i].teamB > games[i].teamA) bWins++
    }
    if (aWins === 2 || bWins === 2) {
      errors.push('This match is already decided — remove the extra game.')
    }
  }

  return errors
}

export function determineWinner(
  games: GameScore[],
  teamAId: string,
  teamBId: string,
  bestOf: 1 | 3,
): string | null {
  if (games.length === 0) return null
  const needed = bestOf === 1 ? 1 : 2
  let aWins = 0
  let bWins = 0
  for (const g of games) {
    if (g.teamA > g.teamB) aWins++
    else if (g.teamB > g.teamA) bWins++
  }
  if (aWins >= needed) return teamAId
  if (bWins >= needed) return teamBId
  return null
}

export function matchStatus(
  games: GameScore[],
  bestOf: 1 | 3,
): 'Scheduled' | 'Live' | 'Completed' {
  if (games.length === 0) return 'Scheduled'
  const needed = bestOf === 1 ? 1 : 2
  let aWins = 0
  let bWins = 0
  for (const g of games) {
    if (g.teamA > g.teamB) aWins++
    else if (g.teamB > g.teamA) bWins++
  }
  if (aWins >= needed || bWins >= needed) return 'Completed'
  return 'Live'
}
