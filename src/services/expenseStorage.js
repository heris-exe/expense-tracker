/**
 * Expense data access layer.
 * All localStorage read/write for expenses lives here so the rest of the app
 * doesn't depend on storage details (easier to swap for an API later).
 */

import { STORAGE_KEY } from '../constants'

/**
 * @returns {Array<{ id: number, date: string, category: string, description: string, amount: string|number, paymentMethod?: string, notes?: string }>}
 */
export function getExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * @param {Array} expenses
 */
export function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
  } catch (e) {
    console.warn('Failed to save expenses', e)
  }
}
