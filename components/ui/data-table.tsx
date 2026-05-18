import * as React from "react";

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns, rows, onRowClick, emptyState,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}) {
  if (rows.length === 0 && emptyState) return <>{emptyState}</>;
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-card-elevated">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                className={`px-4 py-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-border transition-colors ${onRowClick ? "cursor-pointer hover:bg-card-elevated" : ""}`}
            >
              {columns.map((col) => (
                <td key={col.id} className={`px-4 py-3 ${col.className ?? ""}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
