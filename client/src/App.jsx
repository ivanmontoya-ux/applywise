import React from 'react'
import { BrowserRouter, Link, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, GuestOnly, useAuth } from './auth/AuthContext'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import JobFeed from './pages/JobFeed'
import Tracker from './pages/Tracker'
import Documents from './pages/Documents'
import PersonalInformation from './pages/PersonalInformation'
import Coach from './pages/Coach'
import Reminders from './pages/Reminders'
import EmailImport from './pages/EmailImport'
import Settings from './pages/Settings'
import Waitlist from './pages/Waitlist'
import Login from './pages/Login'
import Signup from './pages/Signup'

function TopAuthBar({ isPublicPage }) {
  const auth = useAuth()
  const navigate = useNavigate()

  if (isPublicPage) return null

  async function handleLogout() {
    await auth.logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{
      minHeight: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '10px',
      padding: '10px 40px',
      borderBottom: '1px solid var(--color-border)',
      background: 'rgba(248, 250, 252, 0.94)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {auth.session ? (
        <>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            {auth.user?.email || 'Signed in'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="secondary-action"
            style={{
              minHeight: 34,
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: '#ffffff',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            Demo mode
          </span>
          <Link to="/login" className="secondary-action pressable" style={{
            minHeight: 34,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: '#ffffff',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            textDecoration: 'none',
            boxShadow: 'var(--shadow-sm)',
          }}>
            Login
          </Link>
          <Link to="/signup" className="primary-action pressable" style={{
            minHeight: 34,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-applied-teal)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '800',
            textDecoration: 'none',
            boxShadow: 'var(--shadow-primary)',
          }}>
            Sign Up
          </Link>
        </>
      )}
    </div>
  )
}

function AppLayout() {
  const location = useLocation()
  const isPublicPage = ['/waitlist', '/landing', '/login', '/signup'].includes(location.pathname)

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', overflow: 'hidden' }}>
      {!isPublicPage && <Sidebar />}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-page)' }}>
        <TopAuthBar isPublicPage={isPublicPage} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/feed" element={<JobFeed />} />
          <Route path="/jobs" element={<JobFeed />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/personal-information" element={<PersonalInformation />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/email" element={<EmailImport />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/landing" element={<Waitlist />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  )
}
