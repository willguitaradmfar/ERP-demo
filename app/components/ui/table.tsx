import { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
  className?: string
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '' }: TableProps) {
  return (
    <thead className={`bg-gray-50 dark:bg-gray-700/50 ${className}`}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '' }: TableProps) {
  return (
    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className = '' }: TableProps) {
  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${className}`}>
      {children}
    </tr>
  )
}

export function TableHead({ children, className = '', ...props }: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', ...props }: TableCellProps) {
  return (
    <td
      className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}
