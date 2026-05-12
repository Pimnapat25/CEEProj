import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function AllergyAlert({ matches }) {
  if (!matches || matches.length === 0) return null

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/25 border border-red-300 dark:border-red-700 rounded-xl">
      <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Allergen Warning</p>
        <p className="text-red-600 dark:text-red-300 text-sm mt-0.5">
          This product contains: <span className="font-medium">{matches.join(', ')}</span>
        </p>
      </div>
    </div>
  )
}
