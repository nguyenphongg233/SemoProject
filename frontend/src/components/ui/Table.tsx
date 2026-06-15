import type { ReactNode } from 'react'
import { cn } from '@/utils'

export interface TableColumn<T> {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  isNumeric?: boolean
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T, index: number) => string | number
  emptyMessage?: string
  emptyState?: ReactNode
}

export default function Table<T extends Record<string, any>>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No data available yet.',
  emptyState
}: TableProps<T>) {
  return (
    <div className="overflow-auto max-h-[500px] rounded-md border border-border bg-surface backdrop-blur-md">
      <table className="w-full border-collapse min-w-135">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "sticky top-0 z-10 p-4 border-b border-border bg-[#10172A] text-[0.78rem] font-bold uppercase tracking-[0.12em] text-text-muted",
                  column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-0 border-b border-border"
              >
                {emptyState ? emptyState : (
                  <div className="p-[1.6rem]! text-center text-text-muted">
                    {emptyMessage}
                  </div>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                className="transition-colors duration-180 ease-out hover:bg-accent/4"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "p-4 border-b border-border text-text text-sm",
                      column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left',
                      column.isNumeric ? 'font-semibold' : ''
                    )}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}