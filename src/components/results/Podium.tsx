import { cn } from '@/lib/utils'
import { formatINR } from '@/lib/currency'
import type { Team, Player } from '@/types'
import type { Podium as PodiumData } from '@/lib/results'

interface PodiumProps {
  podium: PodiumData
  teams: Team[]
  players: Player[]
}

interface PodiumSlotProps {
  label: string
  rank: 1 | 2 | 3
  team: Team | undefined
  players: Player[]
  prize: number
  testId: string
}

const rankConfig = {
  1: { accent: 'bg-gold', text: 'text-net', label: '🥇 Champion', height: 'h-32' },
  2: { accent: 'bg-silver', text: 'text-net', label: '🥈 Runner-up', height: 'h-24' },
  3: { accent: 'bg-bronze', text: 'text-net', label: '🥉 3rd Place', height: 'h-20' },
} as const

function PodiumSlot({ rank, team, players: allPlayers, prize, testId }: PodiumSlotProps) {
  const config = rankConfig[rank]
  const teamPlayers = team ? allPlayers.filter((p) => team.playerIds.includes(p.id)) : []

  return (
    <div className="flex flex-col items-center gap-2" data-testid={testId}>
      <div className="flex flex-col items-center gap-1 text-center">
        {team?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={team.photo} alt={team?.name ?? 'Team'} className="h-16 w-16 rounded-full object-cover border-4 border-surface shadow" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-bg border-4 border-surface shadow flex items-center justify-center">
            <span className="text-2xl" aria-hidden="true">🏓</span>
          </div>
        )}
        <p className="font-heading text-xl text-net">{team?.name ?? 'TBD'}</p>
        {teamPlayers.length > 0 && (
          <p className="text-xs text-muted">{teamPlayers.map((p) => p.name).join(' & ')}</p>
        )}
        <p className="font-heading text-lg text-court-green">{formatINR(prize)}</p>
      </div>
      <div className={cn('w-full rounded-t-lg flex items-end justify-center pb-2', config.accent, config.height)}>
        <span className={cn('font-heading text-sm', config.text)}>{config.label}</span>
      </div>
    </div>
  )
}

export function Podium({ podium, teams, players }: PodiumProps) {
  const champion = teams.find((t) => t.id === podium.champion.teamId)
  const runnerUp = teams.find((t) => t.id === podium.runnerUp.teamId)
  const thirdPlace = teams.find((t) => t.id === podium.thirdPlace.teamId)

  return (
    <div className="flex items-end justify-center gap-4 py-8" data-testid="podium">
      {/* Runner-up left */}
      <PodiumSlot
        label="Runner-up"
        rank={2}
        team={runnerUp}
        players={players}
        prize={podium.runnerUp.prize}
        testId="podium-runner-up"
      />
      {/* Champion center */}
      <PodiumSlot
        label="Champion"
        rank={1}
        team={champion}
        players={players}
        prize={podium.champion.prize}
        testId="podium-champion"
      />
      {/* 3rd place right */}
      <PodiumSlot
        label="3rd Place"
        rank={3}
        team={thirdPlace}
        players={players}
        prize={podium.thirdPlace.prize}
        testId="podium-third-place"
      />
    </div>
  )
}
