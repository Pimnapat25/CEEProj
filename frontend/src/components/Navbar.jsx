import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/scan',      label: 'Scanner' },
  { to: '/items',     label: 'My Fridge' },
]

export default function Navbar() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-fresh-100 dark:border-slate-700 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        <NavLink to="/dashboard" className="text-lg font-semibold text-fresh-600 dark:text-fresh-300 mr-2 shrink-0">
          🥬 FreshFridge
        </NavLink>

        <div className="flex items-center gap-1 flex-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ` +
                (isActive
                  ? 'bg-fresh-100 dark:bg-fresh-600/20 text-fresh-600 dark:text-fresh-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-fresh-50 dark:hover:bg-slate-700 hover:text-fresh-600 dark:hover:text-fresh-300')
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
