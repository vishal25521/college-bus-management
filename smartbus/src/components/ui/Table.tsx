import React from 'react'

interface TableColumn {
  key: string
  label: string
  className?: string
}

interface TableProps {
  data: any[]
  columns: TableColumn[]
  className?: string
  loading?: boolean
  emptyState?: string
  onDelete?: (id: string) => void
}

export const Table: React.FC<TableProps> = ({
  data,
  columns,
  className,
  loading,
  emptyState = 'No records found',
  onDelete
}) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 ${className}`}>
      {!loading && data.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>{emptyState}</p>
        </div>
      )}

      {loading && (
        <div className="p-8 text-center text-gray-500">
          <p>Loading...</p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1_auto_auto] border-b border-gray-300 bg-gray-50">
            <div className="px-6 py-3 font-medium text-gray-900 select-none">
              {columns.map((col) => (
                <span key={col.key} className={col.className || ''}>
                  {col.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[auto_1_auto-auto] bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <div key={row.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                {columns.map((col) => {
                  const value = col.key ? row[col.key] : ''
                  return (
                    <span key={col.key} className="text-sm text-gray-700">
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}