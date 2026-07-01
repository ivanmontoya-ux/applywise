import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  getCurrentSession,
  isSupabaseConfigured,
  signInWithPassword,
  signOutFromSupabase,
  signUpWithEmail,
} from '../lib/supabase'

const AuthContext = createContext(null)

const loadingStyle = {
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-bg-page)',
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      setLoading(true)
      try {
        const nextSession = await getCurrentSession()
        if (!cancelled) setSession(nextSession)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSession()

    function syncSession() {
      getCurrentSession().then(nextSession => {
        if (!cancelled) setSession(nextSession)
      })
    }

    window.addEventListener('applywise-auth-change', syncSession)
    window.addEventListener('applywise-auth-expired', syncSession)
    return () => {
      cancelled = true
      window.removeEventListener('applywise-auth-change', syncSession)
      window.removeEventListener('applywise-auth-expired', syncSession)
    }
  }, [])

  async function login(credentials) {
    const result = await signInWithPassword(credentials)
    setSession(result.session)
    return result
  }

  async function signup(details) {
    const result = await signUpWithEmail(details)
    setSession(result.session || null)
    return result
  }

  async function logout() {
    await signOutFromSupabase()
    setSession(null)
  }

  const value = useMemo(() => ({
    configured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user || null,
    login,
    signup,
    logout,
  }), [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export function GuestOnly({ children }) {
  const auth = useAuth()

  if (auth.loading) {
    return <div style={loadingStyle}>Checking your session...</div>
  }

  if (auth.session) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
