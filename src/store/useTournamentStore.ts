import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { makeIdbStorage, PERSIST_KEYS } from '@/lib/storage'

export interface TournamentLike {
  id: string
  teamIds: string[]
  status: 'Draft' | 'Drawn' | 'InProgress' | 'Completed' | 'Announced'
}

interface TournamentState {
  tournaments: TournamentLike[]
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    () => ({
      tournaments: [] as TournamentLike[],
    }),
    {
      name: PERSIST_KEYS.tournaments,
      storage: makeIdbStorage<TournamentState>(),
    },
  ),
)
