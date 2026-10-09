import React from 'react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  className?: string;
  cell?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T>({ columns, data, keyExtractor, onRowClick, className }: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-[#F9FAFB]/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            {columns.map((col, index) => (
              <th key={index} className={cn('py-3.5 px-4', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={cn(
                'hover:bg-[#F9FAFB] transition-colors',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((col, index) => (
                <td key={index} className={cn('py-3.5 px-4', col.className)}>
                  {col.cell
                    ? col.cell(item)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? '')
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
