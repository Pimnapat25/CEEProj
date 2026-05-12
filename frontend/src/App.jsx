import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ScannerPage from './pages/ScannerPage'
import ItemsPage from './pages/ItemsPage'
import Spinner from './components/Spinner'

function AuthGuard({ session, children }) {
  const location = useLocation()
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // Apply saved theme on load
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark')
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <Spinner size={10} />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <AuthGuard session={session}>
              <Layout><DashboardPage session={session} /></Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/scan"
          element={
            <AuthGuard session={session}>
              <Layout><ScannerPage session={session} /></Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/items"
          element={
            <AuthGuard session={session}>
              <Layout><ItemsPage session={session} /></Layout>
            </AuthGuard>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
