import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { makeIdbStorage, PERSIST_KEYS } from '@/lib/storage'
import { assertSession } from '@/lib/auth'
import { canDeleteTournament, canEditMeta, canReshuffle } from '@/lib/tournament'
import { normaliseName } from '@/lib/sponsors'
import { hasSharedPlayer } from '@/lib/validation'
import { generateDraw as libGenerateDraw, reshuffleDraw as libReshuffleDraw } from '@/lib/draw'
import { usePlayerStore } from './usePlayerStore'
import { useTeamStore } from './useTeamStore'
import type { Tournament, CreateTournamentInput } from '@/types'

interface TournamentState {
  tournaments: Tournament[]
  addTournament: (input: CreateTournamentInput) => Tournament
  updateTournament: (id: string, patch: Partial<CreateTournamentInput>) => void
  deleteTournament: (id: string) => void
  addTeamToTournament: (tournamentId: string, teamId: string) => void
  removeTeamFromTournament: (tournamentId: string, teamId: string) => void
  generateDraw: (tournamentId: string) => void
  reshuffleDraw: (tournamentId: string) => void
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

      setTournaments: (tournaments) => set({ tournaments }),
      clearTournaments: () => set({ tournaments: [] }),
    }),
    {
      name: PERSIST_KEYS.tournaments,
      storage: makeIdbStorage<TournamentState>(),
    },
  ),
)
