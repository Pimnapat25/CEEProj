import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getItems } from '../lib/api'
import ExpiryBadge from '../components/ExpiryBadge'
import Spinner from '../components/Spinner'

function daysUntil(dateStr) {
  if (!dateStr) return Infinity
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(dateStr)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

function emojiFor(days) {
  if (days === Infinity) return '🧊'
  if (days < 0) return '💀'
  if (days <= 1) return '🚨'
  if (days <= 3) return '⚠️'
  if (days <= 7) return '⏳'
  if (days <= 30) return '🥦'
  return '✨'
}

const PIE_COLORS = {
  Safe:       '#7dcba4',
  Soon:       '#fbbf24',
  Urgent:     '#f87171',
  Expired:    '#94a3b8',
  'Non-expiring': '#a3a3a3',
}

export default function DashboardPage({ session }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getItems(session.user.id)
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [session.user.id])

  if (loading) return <div className="py-16"><Spinner /></div>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  const nonExpired = items.filter(i => daysUntil(i.expiry_date) >= 0 || !i.expiry_date)
  const sortedNonExpired = [...nonExpired].sort(
    (a, b) => daysUntil(a.expiry_date) - daysUntil(b.expiry_date)
  )

  const total = items.length
  const expiring3 = items.filter(i => { const d = daysUntil(i.expiry_date); return d >= 0 && d <= 3 }).length
  const expiring7 = items.filter(i => { const d = daysUntil(i.expiry_date); return d >= 0 && d <= 7 }).length

  const pieData = [
    { name: 'Safe',          value: items.filter(i => { const d = daysUntil(i.expiry_date); return d > 7 && d !== Infinity }).length },
    { name: 'Soon',          value: items.filter(i => { const d = daysUntil(i.expiry_date); return d >= 4 && d <= 7 }).length },
    { name: 'Urgent',        value: items.filter(i => { const d = daysUntil(i.expiry_date); return d >= 0 && d <= 3 }).length },
    { name: 'Expired',       value: items.filter(i => { const d = daysUntil(i.expiry_date); return d < 0 }).length },
    { name: 'Non-expiring',  value: items.filter(i => !i.expiry_date).length },
  ].filter(d => d.value > 0)

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">🥗 Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="🧺 Total Items" value={total} color="text-fresh-600 dark:text-fresh-300" />
        <SummaryCard label="🚨 Expiring ≤ 3 days" value={expiring3} color="text-red-500" />
        <SummaryCard label="⏳ Expiring ≤ 7 days" value={expiring7} color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pieData.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">🥧 Expiry Overview</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: 'none', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex items-center justify-center text-slate-400 text-sm">
            No items yet 🌱
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">Your Fridge (nearest expiry first)</h2>
          {sortedNonExpired.length === 0 ? (
            <p className="text-slate-400 text-sm">Your fridge is empty</p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {sortedNonExpired.map(item => {
                const d = daysUntil(item.expiry_date)
                return (
                  <li key={item.id} className="flex items-center justify-between text-sm gap-2">
                    <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{emojiFor(d)}</span>
                      <span className="truncate">{item.name}</span>
                    </span>
                    <ExpiryBadge expiryDate={item.expiry_date} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-2xl px-6 py-5 shadow-sm">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
