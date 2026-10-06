import { formatINR } from '@/lib/currency'
import type { Prizes } from '@/types'

interface PrizeTableProps {
  prizes: Prizes
}

export function PrizeTable({ prizes }: PrizeTableProps) {
  return (
    <table className="w-full text-sm" data-testid="prize-table">
      <thead>
        <tr className="bg-court text-line">
          <th className="px-4 py-2 text-left font-semibold">Place</th>
          <th className="px-4 py-2 text-right font-semibold">Prize</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-surface">
          <td className="px-4 py-2 text-net">🏆 Champion</td>
          <td className="px-4 py-2 text-right font-heading text-lg text-gold">
            {formatINR(prizes.champion)}
          </td>
        </tr>
        <tr className="bg-bg">
          <td className="px-4 py-2 text-net">🥈 Runner-up</td>
          <td className="px-4 py-2 text-right font-heading text-lg text-silver">
            {formatINR(prizes.runnerUp)}
          </td>
        </tr>
        <tr className="bg-surface">
          <td className="px-4 py-2 text-net">🥉 3rd Place</td>
          <td className="px-4 py-2 text-right font-heading text-lg text-bronze">
            {formatINR(prizes.thirdPlace)}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
