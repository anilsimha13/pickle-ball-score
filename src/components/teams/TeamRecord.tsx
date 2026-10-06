interface TeamRecordProps {
  wins?: number
  losses?: number
}

export function TeamRecord({ wins = 0, losses = 0 }: TeamRecordProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-court-green font-medium">{wins}W</span>
      <span className="text-muted">·</span>
      <span className="text-danger font-medium">{losses}L</span>
    </div>
  )
}
