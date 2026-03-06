import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { SetupRequired } from './components/SetupRequired'
import { ExpenseProvider } from './contexts/ExpenseContext'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'

function App() {
  const {
    user,
    loading,
    isConfigured,
    signIn,
    signUp,
    signInWithGoogle,
    resetPasswordForEmail,
    sessionMessage,
    setSessionMessage,
  } = useAuth()
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [authMessage, setAuthMessage] = useState(null)

  const handleSignIn = async (email, password) => {
    setAuthError(null)
    setAuthMessage(null)
    setSessionMessage?.(null)
    setAuthLoading(true)
    const { error } = await signIn(email, password)
    setAuthLoading(false)
    if (error) setAuthError(error)
  }

  const handleSignUp = async (email, password) => {
    setAuthError(null)
    setAuthMessage(null)
    setSessionMessage?.(null)
    setAuthLoading(true)
    const { data, error } = await signUp(email, password)
    setAuthLoading(false)
    if (error) {
      setAuthError(error)
      return
    }
    if (data?.user && !data?.session) {
      setAuthMessage(
        'Account created. Check your email and click the confirmation link, then sign in below.'
      )
    }
  }

  const handleSignInWithGoogle = async () => {
    setAuthError(null)
    setAuthMessage(null)
    setSessionMessage?.(null)
    setAuthLoading(true)
    const { error } = await signInWithGoogle()
    setAuthLoading(false)
    if (error) setAuthError(error)
  }

  if (!isConfigured) return <SetupRequired />
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Loading…
      </div>
    )
  }
  if (!user) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignInWithGoogle={handleSignInWithGoogle}
        onForgotPassword={resetPasswordForEmail}
        isLoading={authLoading}
        error={authError}
        message={authMessage}
        sessionMessage={sessionMessage}
      />
    )
  }

  return (
    <BrowserRouter>
      <ExpenseProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
          </Route>
        </Routes>
      </ExpenseProvider>
    </BrowserRouter>
  )
}

export default App
