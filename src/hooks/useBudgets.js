/**
 * Budget state and progress: loads budgets from Supabase, combines with expenses,
 * and exposes memoized progress (spent, ratio, state) for UI and banners.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchBudgets, createBudget, updateBudget, deleteBudget } from '../services/budgetApi'

/** Monday of the ISO week for dateStr (YYYY-MM-DD). Weeks are Monday–Sunday. */
export function getWeekStart(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay() // 0 Sun .. 6 Sat
  const daysFromMonday = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - daysFromMonday)
  return d.toISOString().slice(0, 10)
}

/** First day of month for dateStr (YYYY-MM-DD) as YYYY-MM-01. */
export function getMonthStart(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 7) + '-01'
}

const NEAR_THRESHOLD = 0.8
const OVER_THRESHOLD = 1.0

function getBudgetState(progress) {
  if (progress >= OVER_THRESHOLD) return 'over'
  if (progress >= NEAR_THRESHOLD) return 'near'
  return 'ok'
}

/** True if expense falls in the budget's period (day/week/month) and matches scope. */
function expenseMatchesBudget(expense, budget) {
  const date = expense.date
  if (!date) return false

  const periodStart = budget.periodStart
  if (!periodStart) return false

  if (budget.periodType === 'day') {
    if (date !== periodStart) return false
  } else if (budget.periodType === 'week') {
    if (getWeekStart(date) !== periodStart) return false
  } else if (budget.periodType === 'month') {
    if (getMonthStart(date) !== getMonthStart(periodStart)) return false
  } else return false

  if (budget.scope === 'overall') return true
  if (budget.scope === 'category') return (expense.category || 'Other') === (budget.category || 'Other')
  return false
}

export function useBudgets(expenses = []) {
  const [budgets, setBudgets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadBudgets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: err } = await fetchBudgets()
    setIsLoading(false)
    if (err) {
      setError(err)
      setBudgets([])
      return
    }
    setBudgets(data || [])
  }, [])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const budgetProgress = useMemo(() => {
    return budgets.map((budget) => {
      const amount = Number(budget.amount) || 0
      let spent = 0
      for (const e of expenses) {
        if (expenseMatchesBudget(e, budget)) spent += Number(e.amount) || 0
      }
      const ratio = amount > 0 ? spent / amount : 0
      const progress = Math.min(1, ratio)
      const state = getBudgetState(ratio)
      return { budget, spent, progress, state }
    })
  }, [budgets, expenses])

  const addBudget = async (payload) => {
    const { data, error: err } = await createBudget(payload)
    if (err) throw err
    if (data) setBudgets((prev) => [...prev, data])
    return data
  }

  const updateBudgetById = async (id, payload) => {
    const { data, error: err } = await updateBudget(id, payload)
    if (err) throw err
    if (data) setBudgets((prev) => prev.map((b) => (b.id === id ? data : b)))
    return data
  }

  const removeBudget = async (id) => {
    const { error: err } = await deleteBudget(id)
    if (err) throw err
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  return {
    budgets,
    budgetProgress,
    isLoading,
    error,
    loadBudgets,
    addBudget,
    updateBudget: updateBudgetById,
    removeBudget,
  }
}
