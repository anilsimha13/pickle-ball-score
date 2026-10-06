'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { PlayerCard } from './PlayerCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'

interface PlayerListProps {
  initialSearch?: string
}

export function PlayerList({ initialSearch = '' }: PlayerListProps) {
  const [query, setQuery] = useState(initialSearch)
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const { players, searchPlayers } = usePlayerStore()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(t)
  }, [query])

  const displayed = debouncedQuery ? searchPlayers(debouncedQuery) : players

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search by name or place…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-muted bg-surface text-net focus:outline-none focus:ring-2 focus:ring-court"
          aria-label="Search players"
          data-testid="player-search"
        />
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          title={query ? 'No players found' : 'No players yet'}
          description={query ? 'Try a different search term.' : 'Create your first player to get started.'}
        />
      ) : (
        <ul className="flex flex-col gap-3" data-testid="player-list">
          {displayed.map((player) => (
            <li key={player.id}>
              <PlayerCard player={player} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PlayerListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}
