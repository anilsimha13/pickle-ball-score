import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { makeIdbStorage, PERSIST_KEYS } from '@/lib/storage'
import { assertSession } from '@/lib/auth'
import { canDeleteTournament, canEditMeta, canReshuffle } from '@/lib/tournament'
import { normaliseName } from '@/lib/sponsors'
import { hasSharedPlayer } from '@/lib/validation'
import { generateDraw as libGenerateDraw, reshuffleDraw as libReshuffleDraw } from '@/lib/draw'
import { advanceWinner, canEditCompletedMatch, getFinalMatch, getThirdPlaceMatch } from '@/lib/bracket'
import { validateGames, determineWinner, matchStatus } from '@/lib/scoring'
import { announceEligibility } from '@/lib/results'
import { usePlayerStore } from './usePlayerStore'
import { useTeamStore } from './useTeamStore'
import type { Tournament, CreateTournamentInput, Match } from '@/types'

type GameScore = { teamA: number; teamB: number }

interface TournamentState {
  tournaments: Tournament[]
  addTournament: (input: CreateTournamentInput) => Tournament
  updateTournament: (id: string, patch: Partial<CreateTournamentInput>) => void
  deleteTournament: (id: string) => void
  addTeamToTournament: (tournamentId: string, teamId: string) => void
  removeTeamFromTournament: (tournamentId: string, teamId: string) => void
  generateDraw: (tournamentId: string) => void
  reshuffleDraw: (tournamentId: string) => void
  saveGameScores: (tournamentId: string, matchId: string, games: GameScore[]) => void
  recordWalkover: (tournamentId: string, matchId: string, winnerId: string) => void
  editMatchScores: (tournamentId: string, matchId: string, games: GameScore[]) => void
  announceResults: (tournamentId: string) => void
  getTournament: (id: string) => Tournament | undefined
  searchTournaments: (q: string) => Tournament[]
  setTournaments: (tournaments: Tournament[]) => void
  clearTournaments: () => void
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      tournaments: [],

      addTournament(input) {
        assertSession()
        const tournament: Tournament = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: 'Draft',
          matches: [],
          teamIds: [],
          sponsors: input.sponsors ?? [],
        }
        set((s) => ({ tournaments: [...s.tournaments, tournament] }))
        return tournament
      },

      updateTournament(id, patch) {
        assertSession()
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== id) return t
            if (!canEditMeta('name', t.status)) throw new Error('Tournament is read-only')

            // Validate sponsor name uniqueness within tournament
            if (patch.sponsors) {
              const names = patch.sponsors.map((sp) => normaliseName(sp.name))
              const unique = new Set(names)
              if (unique.size !== names.length) throw new Error('Sponsor name already added')
            }

            return { ...t, ...patch }
          }),
        }))
      },

      deleteTournament(id) {
        assertSession()
        const t = get().tournaments.find((x) => x.id === id)
        if (!t) return
        if (!canDeleteTournament(t)) {
          throw new Error('Tournament cannot be deleted in its current status')
        }
        set((s) => ({ tournaments: s.tournaments.filter((x) => x.id !== id) }))
      },

      addTeamToTournament(tournamentId, teamId) {
        assertSession()
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tournamentId) return t
            if (t.status !== 'Draft') throw new Error('Teams can only be changed in Draft status')
            if (t.teamIds.includes(teamId)) return t
            if (t.teamIds.length >= 50) throw new Error('Maximum 50 teams allowed')

            const allTeams = useTeamStore.getState().teams
            const allPlayers = usePlayerStore.getState().players
            const newTeamIds = [...t.teamIds, teamId]
            const conflict = hasSharedPlayer(newTeamIds, allTeams, allPlayers)
            if (conflict) {
              throw new Error(
                `${conflict.teamA.name} and ${conflict.teamB.name} share ${conflict.player.name} — only one can enter.`,
              )
            }

            return { ...t, teamIds: newTeamIds }
          }),
        }))
      },

      removeTeamFromTournament(tournamentId, teamId) {
        assertSession()
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tournamentId) return t
            if (t.status !== 'Draft') throw new Error('Teams can only be changed in Draft status')
            return { ...t, teamIds: t.teamIds.filter((id) => id !== teamId) }
          }),
        }))
      },

      generateDraw(tournamentId) {
        assertSession()
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tournamentId) return t
            if (t.status !== 'Draft') throw new Error('Draw can only be generated in Draft status')
            if (t.teamIds.length < 4) throw new Error('Add at least 4 teams to generate the draw')
            if (t.teamIds.length > 50) throw new Error('Maximum 50 teams allowed')
            const matches = libGenerateDraw(t)
            return { ...t, status: 'Drawn', matches }
          }),
        }))
      },

      reshuffleDraw(tournamentId) {
        assertSession()
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tournamentId) return t
            if (!canReshuffle(t)) throw new Error('Re-shuffle is not available')
            const matches = libReshuffleDraw(t)
            return { ...t, matches }
          }),
        }))
      },

      getTournament(id) {
        return get().tournaments.find((t) => t.id === id)
      },

      searchTournaments(q) {
        if (!q.trim()) return get().tournaments
        const lower = q.toLowerCase()
        return get().tournaments.filter((t) => t.name.toLowerCase().includes(lower))
      },

      saveGameScores(tournamentId, matchId, games) {
        assertSession()
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tournamentId) return t
            if (t.status === 'Announced') throw new Error('Tournament is announced and read-only')
            const match = t.matches.find((m) => m.id === matchId)
            if (!match) throw new Error('Match not found')
            if (!match.teamAId || !match.teamBId) throw new Error('Both teams must be set to score this match')
            const errors = validateGames(games, t.pointsPerGame, t.bestOf)
            if (errors.length > 0) throw new Error(errors.join('\n'))

            const winnerId = determineWinner(games, match.teamAId, match.teamBId, t.bestOf) ?? undefined
            const status = matchStatus(games, t.bestOf)
            const updatedMatch: Match = { ...match, games, status, winnerId }

            let matches = t.matches.map((m) => (m.id === matchId ? updatedMatch : m))
            if (winnerId) {
              matches = advanceWinner(matches, updatedMatch)
            }

            // Status transitions (t.status !== 'Announced' already verified above)
            let newStatus: Tournament['status'] = t.status
            if (t.status === 'Drawn' && games.length > 0) newStatus = 'InProgress'
            const final = getFinalMatch(matches)
            const third = getThirdPlaceMatch(matches)
            if (final?.status === 'Completed' && third?.status === 'Completed') {
              newStatus = 'Completed'
            }

            return { ...t, matches, status: newStatus }
          }),
        }))
      },

      recordWalkover(tournamentId, matchId, winnerId) {
        assertSession()
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tournamentId) return t
            if (t.status === 'Announced') throw new Error('Tournament is announced and read-only')
            const match = t.matches.find((m) => m.id === matchId)
            if (!match) throw new Error('Match not found')
            if (!match.teamAId || !match.teamBId) throw new Error('Both teams must be known for a walkover')
            if (match.status === 'Completed' && !match.isWalkover) {
              throw new Error('Match is already completed')
            }

            const updatedMatch: Match = {
              ...match,
              isWalkover: true,
              games: [],
              winnerId,
              status: 'Completed',
            }

            let matches = t.matches.map((m) => (m.id === matchId ? updatedMatch : m))
            matches = advanceWinner(matches, updatedMatch)

            let newStatus: Tournament['status'] = t.status
            if (t.status === 'Drawn') newStatus = 'InProgress'
            const final = getFinalMatch(matches)
            const third = getThirdPlaceMatch(matches)
            if (final?.status === 'Completed' && third?.status === 'Completed') {
              newStatus = 'Completed'
            }

            return { ...t, matches, status: newStatus }
          }),
        }))
      },

      editMatchScores(tournamentId, matchId, games) {
        assertSession()
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tournamentId) return t
            if (t.status === 'Announced') throw new Error('Tournament is announced and read-only')
            if (!canEditCompletedMatch(t.matches, matchId)) {
              throw new Error('Cannot edit: a downstream match already has scores or a walkover')
            }
            const match = t.matches.find((m) => m.id === matchId)
            if (!match || !match.teamAId || !match.teamBId) throw new Error('Match not found or teams missing')
            const errors = validateGames(games, t.pointsPerGame, t.bestOf)
            if (errors.length > 0) throw new Error(errors.join('\n'))

            const winnerId = determineWinner(games, match.teamAId, match.teamBId, t.bestOf) ?? undefined
            const status = matchStatus(games, t.bestOf)
            const updatedMatch: Match = { ...match, games, status, winnerId, isWalkover: false }

            let matches = t.matches.map((m) => (m.id === matchId ? updatedMatch : m))
            if (winnerId) {
              matches = advanceWinner(matches, updatedMatch)
            }

            return { ...t, matches }
          }),
        }))
      },

      announceResults(tournamentId) {
        assertSession()
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tournamentId) return t
            const eligibility = announceEligibility(t)
            if (!eligibility.eligible) throw new Error(eligibility.reasons[0])

            const finalMatch = getFinalMatch(t.matches)
            const thirdPlace = getThirdPlaceMatch(t.matches)
            if (!finalMatch?.winnerId || !thirdPlace?.winnerId) {
              throw new Error('Final or 3rd Place match has no winner')
            }

            const runnerUpId =
              finalMatch.winnerId === finalMatch.teamAId ? finalMatch.teamBId! : finalMatch.teamAId!

            return {
              ...t,
              status: 'Announced',
              results: {
                championId: finalMatch.winnerId,
                runnerUpId,
                thirdPlaceId: thirdPlace.winnerId,
                announcedAt: new Date().toISOString(),
              },
            }
          }),
        }))
      },

      setTournaments: (tournaments) => set({ tournaments }),
      clearTournaments: () => set({ tournaments: [] }),
    }),
    {
      name: PERSIST_KEYS.tournaments,
      storage: makeIdbStorage<TournamentState>(),
    },
  ),
)
