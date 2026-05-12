import React, { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import ExpiryBadge from './ExpiryBadge'

export default function ItemCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const formattedDate = item.expiry_date
    ? new Date(item.expiry_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-fresh-50/40 dark:hover:bg-slate-700/40 transition-colors"
      >
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-medium text-slate-800 dark:text-slate-100 truncate">{item.name}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formattedDate ? `Expires ${formattedDate}` : 'No expiry date'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExpiryBadge expiryDate={item.expiry_date} />
          <span className="p-1.5 text-slate-400">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onDelete(item.id) }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onDelete(item.id) } }}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
            aria-label="Delete item"
          >
            <Trash2 size={16} />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-700">
          <span className="text-slate-400 text-xs uppercase tracking-wide">Ingredients</span>
          {item.ingredients ? (
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {item.ingredients}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-400 italic">No ingredients recorded for this item.</p>
          )}
        </div>
      )}
    </div>
  )
}
