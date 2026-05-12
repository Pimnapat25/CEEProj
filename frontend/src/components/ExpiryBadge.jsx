import React from 'react'

function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(dateStr)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

export default function ExpiryBadge({ expiryDate }) {
  let classes = 'inline-block px-2 py-0.5 rounded-full text-xs font-medium '

  if (!expiryDate) {
    classes += 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
    return <span className={classes}>Non-expiring</span>
  }

  const days = daysUntil(expiryDate)
  let label = ''

  if (days < 0) {
    classes += 'bg-red-100 text-red-700'
    label = 'Expired'
  } else if (days <= 3) {
    classes += 'bg-red-100 text-red-700'
    label = days === 0 ? 'Today' : `${days}d left`
  } else if (days <= 7) {
    classes += 'bg-amber-100 text-amber-700'
    label = `${days}d left`
  } else {
    classes += 'bg-fresh-100 text-fresh-600'
    label = `${days}d left`
  }

  return <span className={classes}>{label}</span>
}
