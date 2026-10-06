'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useTeamStore } from '@/store/useTeamStore'
import { TeamCard } from './TeamCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'

export function TeamList() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const { teams, searchTeams } = useTeamStore()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(t)
  }, [query])

  const displayed = debouncedQuery ? searchTeams(debouncedQuery) : teams

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search teams…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-muted bg-surface text-net focus:outline-none focus:ring-2 focus:ring-court"
          aria-label="Search teams"
          data-testid="team-search"
        />
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          title={query ? 'No teams found' : 'No teams yet'}
          description={query ? 'Try a different search term.' : 'Create your first team to get started.'}
        />
      ) : (
        <ul className="flex flex-col gap-3" data-testid="team-list">
          {displayed.map((team) => (
            <li key={team.id}>
              <TeamCard team={team} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function TeamListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}
