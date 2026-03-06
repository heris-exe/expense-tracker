/**
 * Provides expense list state and actions to the whole app so the layout (modals, "Add expense")
 * and all pages (Dashboard, Expenses) share one source of truth.
 * Avoids duplicate API calls and keeps add/edit/delete in sync everywhere.
 */

import { createContext, useContext } from 'react'
import { useExpenses } from '@/hooks/useExpenses'

const ExpenseContext = createContext(null)

export function ExpenseProvider({ children }) {
  const value = useExpenses()
  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenseContext() {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpenseContext must be used within ExpenseProvider')
  return ctx
}
