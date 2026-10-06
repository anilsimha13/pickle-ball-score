import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { TeamList, TeamListSkeleton } from '@/components/teams/TeamList'

export default function TeamsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Teams"
        actions={
          <Button variant="primary" data-testid="new-team-btn">
            <Link href="/teams/new">New Team</Link>
          </Button>
        }
      />
      <HydrationGate fallback={<TeamListSkeleton />}>
        <TeamList />
      </HydrationGate>
    </div>
  )
}
