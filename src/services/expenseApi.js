/**
 * Expense API: reads/writes expenses in Supabase (cloud).
 * Replaces localStorage so data syncs across devices for the logged-in user.
 * Each function requires a valid Supabase client and auth; returns data in the
 * same shape the app already uses (id, date, category, description, amount, paymentMethod, notes, createdAt).
 */

import { supabase } from '../lib/supabase'

// Map DB snake_case to app camelCase and ensure id is a string for consistency
function rowToExpense(row) {
  if (!row) return null
  return {
    id: row.id,
    date: row.date,
    category: row.category,
    description: row.description,
    amount: row.amount,
    paymentMethod: row.payment_method ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at ?? null,
  }
}

/**
 * Fetch all expenses for the current user (from Supabase auth).
 * @returns {Promise<{ data: Array, error: Error | null }>}
 */
export async function fetchExpenses() {
  if (!supabase) {
    return { data: [], error: new Error('Supabase not configured') }
  }
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: [], error: authError || new Error('Not signed in') }
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('id, date, category, description, amount, payment_method, notes, created_at')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { data: [], error }
  return { data: (data || []).map(rowToExpense), error: null }
}

/**
 * Insert one expense for the current user.
 * @param {{ date: string, category: string, description: string, amount: string, paymentMethod?: string, notes?: string }} payload
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function createExpense(payload) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: authError || new Error('Not signed in') }
  }

  const row = {
    user_id: user.id,
    date: payload.date,
    category: payload.category,
    description: payload.description,
    amount: String(payload.amount),
    payment_method: payload.paymentMethod ?? null,
    notes: payload.notes ?? null,
  }

  const { data, error } = await supabase.from('expenses').insert(row).select().single()
  if (error) return { data: null, error }
  return { data: rowToExpense(data), error: null }
}

/**
 * Update an existing expense (only if it belongs to the current user, enforced by RLS).
 * @param {string} id - expense uuid
 * @param {{ date?: string, category?: string, description?: string, amount?: string, paymentMethod?: string, notes?: string }} payload
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function updateExpense(id, payload) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: authError || new Error('Not signed in') }
  }

  const row = {
    date: payload.date,
    category: payload.category,
    description: payload.description,
    amount: payload.amount != null ? String(payload.amount) : undefined,
    payment_method: payload.paymentMethod !== undefined ? payload.paymentMethod : undefined,
    notes: payload.notes !== undefined ? payload.notes : undefined,
  }
  const clean = Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined))

  const { data, error } = await supabase
    .from('expenses')
    .update(clean)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data: rowToExpense(data), error: null }
}

/**
 * Delete an expense by id (only if it belongs to the current user).
 * @param {string} id - expense uuid
 * @returns {Promise<{ error: Error | null }>}
 */
export async function deleteExpense(id) {
  if (!supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: authError || new Error('Not signed in') }
  }

  const { error } = await supabase.from('expenses').delete().eq('id', id)
  return { error: error || null }
}
