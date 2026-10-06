import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { PlayerList, PlayerListSkeleton } from '@/components/players/PlayerList'

export default function PlayersPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Players"
        actions={
          <Button variant="primary" data-testid="new-player-btn">
            <Link href="/players/new">New Player</Link>
          </Button>
        }
      />
      <HydrationGate fallback={<PlayerListSkeleton />}>
        <PlayerList />
      </HydrationGate>
    </div>
  )
}
