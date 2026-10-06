'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { makeIdbStorage, PERSIST_KEYS } from '@/lib/storage'
import { assertSession } from '@/lib/auth'
import type { ContactMessage, CreateContactMessageInput } from '@/lib/schemas/contact'

interface ContactState {
  messages: ContactMessage[]
  addMessage: (input: CreateContactMessageInput) => ContactMessage
  markRead: (id: string, read: boolean) => void
  deleteMessage: (id: string) => void
  getUnreadCount: () => number
  setMessages: (messages: ContactMessage[]) => void
  clearMessages: () => void
}

export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      messages: [],

      addMessage: (input) => {
        // No assertSession — public contact form works while logged out
        const message: ContactMessage = {
          ...input,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ messages: [message, ...s.messages] }))
        return message
      },

      markRead: (id, read) => {
        assertSession()
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, read } : m)),
        }))
      },

      deleteMessage: (id) => {
        assertSession()
        set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }))
      },

      getUnreadCount: () => {
        return get().messages.filter((m) => !m.read).length
      },

      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: PERSIST_KEYS.contacts,
      storage: makeIdbStorage<ContactState>(),
    },
  ),
)
