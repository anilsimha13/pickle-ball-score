import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { assertSession } from '@/lib/auth'
import { makeIdbStorage, PERSIST_KEYS } from '@/lib/storage'
import { hasDuplicatePair } from '@/lib/validation'
import type { Team, CreateTeamInput } from '@/lib/schemas/team'
import { useTournamentStore } from '@/store/useTournamentStore'

interface TeamState {
  teams: Team[]
  addTeam: (input: CreateTeamInput) => Team
  updateTeam: (id: string, patch: Partial<Omit<Team, 'id' | 'createdAt'>>) => void
  deleteTeam: (id: string) => void
  getTeam: (id: string) => Team | undefined
  searchTeams: (q: string) => Team[]
  setTeams: (teams: Team[]) => void
  clearTeams: () => void
}

function normaliseName(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: [],

      addTeam: (input) => {
        assertSession()
        const { teams } = get()
        const [p1, p2] = input.playerIds
        if (p1 === p2) throw new Error('Pick two different players')
        const normNew = normaliseName(input.name)
        if (teams.some((t) => normaliseName(t.name) === normNew)) {
          throw new Error('A team with this name already exists')
        }
        const dup = hasDuplicatePair(p1, p2, teams)
        if (dup) {
          throw new Error(`${p1} & ${p2} are already team ${dup.name}`)
        }
        const team: Team = {
          ...input,
          name: input.name.trim(),
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ teams: [...s.teams, team] }))
        return team
      },

      updateTeam: (id, patch) => {
        assertSession()
        const { teams } = get()
        const existing = teams.find((t) => t.id === id)
        if (!existing) throw new Error('Team not found')

        if (patch.playerIds) {
          const tournaments = useTournamentStore.getState().tournaments
          const lockedTournament = tournaments.find(
            (t) => t.teamIds.includes(id) && t.status !== 'Draft',
          )
          if (lockedTournament) {
            throw new Error('Players are locked because this team is in a drawn tournament.')
          }
          const [p1, p2] = patch.playerIds
          if (p1 === p2) throw new Error('Pick two different players')
          const dup = hasDuplicatePair(p1, p2, teams, id)
          if (dup) throw new Error(`${p1} & ${p2} are already team ${dup.name}`)
        }

        if (patch.name) {
          const normNew = normaliseName(patch.name)
          if (teams.some((t) => t.id !== id && normaliseName(t.name) === normNew)) {
            throw new Error('A team with this name already exists')
          }
        }

        set((s) => ({
          teams: s.teams.map((t) =>
            t.id === id
              ? { ...t, ...patch, ...(patch.name ? { name: patch.name.trim() } : {}) }
              : t,
          ),
        }))
      },

      deleteTeam: (id) => {
        assertSession()
        const tournaments = useTournamentStore.getState().tournaments
        const count = tournaments.filter((t) => t.teamIds.includes(id)).length
        if (count > 0) {
          throw new Error(`This team is part of ${count} tournament(s) and can't be deleted.`)
        }
        set((s) => ({ teams: s.teams.filter((t) => t.id !== id) }))
      },

      getTeam: (id) => get().teams.find((t) => t.id === id),

      searchTeams: (q) => {
        const lower = q.toLowerCase()
        return get().teams.filter((t) => t.name.toLowerCase().includes(lower))
      },

      setTeams: (teams) => set({ teams }),
      clearTeams: () => set({ teams: [] }),
    }),
    {
      name: PERSIST_KEYS.teams,
      storage: makeIdbStorage<TeamState>(),
    },
  ),
)
