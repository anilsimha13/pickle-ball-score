import { create } from 'zustand'
import type { Session } from '@/types'
import { getSession } from '@/lib/auth'

interface AuthState {
  session: Session | null
  setSession: (s: Session | null) => void
  init: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  setSession: (s) => set({ session: s }),
  init: () => set({ session: getSession() }),
}))
