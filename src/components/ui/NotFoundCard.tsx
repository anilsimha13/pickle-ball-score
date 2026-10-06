import Link from 'next/link'

type Entity = 'player' | 'team' | 'tournament' | 'match'

const BACK_PATHS: Record<Entity, string> = {
  player: '/players',
  team: '/teams',
  tournament: '/tournaments',
  match: '/tournaments',
}

interface NotFoundCardProps {
  entity: Entity
}

export function NotFoundCard({ entity }: NotFoundCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="text-muted"
      >
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" strokeDasharray="6 4" />
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fill="currentColor">?</text>
      </svg>
      <div>
        <p className="font-heading text-2xl text-net">
          We couldn&apos;t find that {entity}.
        </p>
        <p className="mt-1 text-sm text-muted">
          It may have been deleted or the link is wrong.
        </p>
      </div>
      <Link
        href={BACK_PATHS[entity]}
        data-testid="not-found-back"
        className="inline-flex items-center justify-center rounded-lg bg-ball px-4 py-2 font-medium text-net hover:bg-ball-dark"
      >
        Back to {entity}s
      </Link>
    </div>
  )
}
