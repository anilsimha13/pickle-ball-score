'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { TournamentCard } from '@/components/tournaments/TournamentCard'
import { useTournamentStore } from '@/store/useTournamentStore'
import { cn } from '@/lib/utils'

function TournamentListInner() {
  const [query, setQuery] = useState('')
  const searchTournaments = useTournamentStore((s) => s.searchTournaments)
  const tournaments = searchTournaments(query)
  const sorted = [...tournaments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="space-y-4">
      <Input
        id="tournament-search"
        placeholder="Search tournaments…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        data-testid="tournament-search"
      />
      {sorted.length === 0 ? (
        <EmptyState
          title="No tournaments yet"
          description="Create your first tournament to get started."
          action={
            <Link
              href="/tournaments/new"
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base font-medium',
                'bg-ball text-net hover:bg-ball-dark transition-colors',
              )}
              data-testid="create-tournament-empty"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Tournament
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3" data-testid="tournament-list">
          {sorted.map((t) => (
            <li key={t.id}>
              <TournamentCard tournament={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function TournamentsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        title="Tournaments"
        actions={
          <Link
            href="/tournaments/new"
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium',
              'bg-ball text-net hover:bg-ball-dark transition-colors',
            )}
            data-testid="new-tournament-btn"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Tournament
          </Link>
        }
      />
      <HydrationGate fallback={<Skeleton className="h-32 rounded-xl" />}>
        <TournamentListInner />
      </HydrationGate>
    </div>
  )
}
