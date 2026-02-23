/**
 * Auth context: provides current user and sign-in/up/out to the app.
 * When Supabase isn't configured, user is null and we treat as "no auth" (demo mode).
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionMessage, setSessionMessage] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signUp({ email, password })
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const resetPasswordForEmail = async (email) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.resetPasswordForEmail({ email })
  }

  /**
   * Sign in with Google (OAuth). Redirects the user to Google, then back to this app.
   * Enable Google in Supabase: Authentication → Providers → Google, and add your
   * Google OAuth client ID and secret. In production, set VITE_APP_URL to your
   * live site URL so the redirect goes there instead of localhost. Add that URL
   * to Supabase Authentication → URL Configuration → Redirect URLs.
   */
  const signInWithGoogle = async () => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    const redirectUrl =
      typeof window !== 'undefined'
        ? (import.meta.env.VITE_APP_URL || window.location.origin)
        : undefined
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
  }

  const value = {
    user,
    loading,
    isConfigured: !!supabase,
    sessionMessage,
    setSessionMessage,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPasswordForEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
