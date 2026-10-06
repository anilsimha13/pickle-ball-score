import { NotFoundCard } from '@/components/ui/NotFoundCard'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <NotFoundCard entity="player" />
    </div>
  )
}
