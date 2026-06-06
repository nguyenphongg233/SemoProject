import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T, index: number) => string | number
  emptyMessage?: string
}

export default function Table<T extends Record<string, any>>({ 
  columns, 
  rows, 
  rowKey, 
  emptyMessage = 'No data available yet.' 
}: TableProps<T>) {
  return (
    <div className="overflow-auto rounded-md border border-border bg-surface backdrop-blur-md theme-transition">
      <table className="w-full border-collapse min-w-135">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="p-4 px-5 text-left border-b border-border bg-brand-soft 
                  text-[0.78rem] font-bold uppercase tracking-[0.12em]
                  text-text-muted transition-colors duration-180"
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
                className="p-[1.6rem]! text-center text-text-muted border-b border-border bg-transparent"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr 
                key={rowKey(row, index)}
                className="transition-colors duration-180 ease-out hover:bg-surface-muted"
              >
                {columns.map((column) => (
                  <td 
                    key={column.key}
                    className="p-4 px-[1.2rem] text-left border-b border-border text-text text-sm"
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