import React from 'react'
import { Trash2 } from 'lucide-react'
import ExpiryBadge from './ExpiryBadge'

export default function ItemCard({ item, onDelete }) {
  const formattedDate = new Date(item.expiry_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="font-medium text-slate-800 dark:text-slate-100">{item.name}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Expires {formattedDate}</span>
      </div>
      <div className="flex items-center gap-3">
        <ExpiryBadge expiryDate={item.expiry_date} />
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          aria-label="Delete item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
