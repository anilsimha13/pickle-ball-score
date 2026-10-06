import { get, set, del, createStore } from 'idb-keyval'
import type { PersistStorage, StorageValue } from 'zustand/middleware'

export const DB_NAME = 'pickle-ball-score'
export const STORE_NAMES = {
  players: 'players',
  teams: 'teams',
  tournaments: 'tournaments',
  contacts: 'contacts',
} as const

export const idbStore = createStore(DB_NAME, 'zustand')

// Zustand persist storage adapter — serialises to JSON string in IndexedDB
export function makeIdbStorage<T>(): PersistStorage<T> {
  return {
    getItem: async (name: string): Promise<StorageValue<T> | null> => {
      const raw = await get<string>(name, idbStore)
      if (raw == null) return null
      return JSON.parse(raw) as StorageValue<T>
    },
    setItem: async (name: string, value: StorageValue<T>): Promise<void> => {
      await set(name, JSON.stringify(value), idbStore)
    },
    removeItem: async (name: string): Promise<void> => {
      await del(name, idbStore)
    },
  }
}

export const PERSIST_KEYS = {
  players: 'pbs-players',
  teams: 'pbs-teams',
  tournaments: 'pbs-tournaments',
  contacts: 'pbs-contacts',
} as const
