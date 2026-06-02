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
    <div className="ui-table-wrap">
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="ui-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={rowKey(row, index)}>
                {columns.map((column) => (
                  <td key={column.key}>
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