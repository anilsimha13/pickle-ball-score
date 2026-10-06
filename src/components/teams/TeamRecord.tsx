interface TeamRecordProps {
  wins?: number
  losses?: number
  won?: number
  lost?: number
}

export function TeamRecord({ wins, losses, won, lost }: TeamRecordProps) {
  const w = wins ?? won ?? 0
  const l = losses ?? lost ?? 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-court-green font-medium">{w}W</span>
      <span className="text-muted">·</span>
      <span className="text-danger font-medium">{l}L</span>
    </div>
  )
}
