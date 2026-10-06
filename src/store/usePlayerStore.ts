import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { assertSession } from '@/lib/auth'
import { makeIdbStorage, PERSIST_KEYS } from '@/lib/storage'
import type { Player, CreatePlayerInput } from '@/lib/schemas/player'
import { useTeamStore } from '@/store/useTeamStore'

interface PlayerState {
  players: Player[]
  addPlayer: (input: CreatePlayerInput) => Player
  updatePlayer: (id: string, patch: Partial<Omit<Player, 'id' | 'createdAt'>>) => void
  deletePlayer: (id: string) => void
  getPlayer: (id: string) => Player | undefined
  searchPlayers: (q: string) => Player[]
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      players: [],

      addPlayer: (input) => {
        assertSession()
        const player: Player = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ players: [...s.players, player] }))
        return player
      },

      updatePlayer: (id, patch) => {
        assertSession()
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }))
      },

      deletePlayer: (id) => {
        assertSession()
        const teams = useTeamStore.getState().teams
        if (teams.some((t) => t.playerIds.includes(id))) {
          const player = get().players.find((p) => p.id === id)
          throw new Error(`Remove ${player?.name ?? 'this player'} from all teams before deleting.`)
        }
        set((s) => ({ players: s.players.filter((p) => p.id !== id) }))
      },

      getPlayer: (id) => get().players.find((p) => p.id === id),

      searchPlayers: (q) => {
        const lower = q.toLowerCase()
        return get().players.filter(
          (p) =>
            p.name.toLowerCase().includes(lower) || p.place.toLowerCase().includes(lower),
        )
      },
    }),
    {
      name: PERSIST_KEYS.players,
      storage: makeIdbStorage<PlayerState>(),
    },
  ),
)
