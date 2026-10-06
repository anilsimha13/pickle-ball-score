import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Column {
  key: string
  header: string
  className?: string
}

interface TableProps {
  columns: Column[]
  data: Record<string, ReactNode>[]
  className?: string
  'data-testid'?: string
}

export function Table({ columns, data, className, 'data-testid': testId }: TableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm" data-testid={testId}>
        <thead>
          <tr className="bg-court text-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-3 text-left font-medium', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-bg'}>
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3', col.className)}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
