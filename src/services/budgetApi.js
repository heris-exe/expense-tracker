/**
 * Budget API: CRUD for user budgets in Supabase.
 * Budgets define spending limits per period (day/week/month) and scope (overall or per category).
 * Mirrors expenseApi patterns: auth check, snake_case → camelCase mapping.
 */

import { supabase } from '../lib/supabase'

function rowToBudget(row) {
  if (!row) return null
  return {
    id: row.id,
    scope: row.scope ?? 'overall',
    category: row.category ?? null,
    periodType: row.period_type ?? 'month',
    periodStart: row.period_start ?? '',
    amount: Number(row.amount) ?? 0,
    createdAt: row.created_at ?? null,
  }
}

/**
 * Fetch all budgets for the current user.
 * @returns {Promise<{ data: Array, error: Error | null }>}
 */
export async function fetchBudgets() {
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
    .from('budgets')
    .select('id, scope, category, period_type, period_start, amount, created_at')
    .order('period_type')
    .order('period_start', { ascending: false })

  if (error) return { data: [], error }
  return { data: (data || []).map(rowToBudget), error: null }
}

/**
 * Create a budget for the current user.
 * @param {{ scope: string, category?: string, periodType: string, periodStart: string, amount: number }} payload
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function createBudget(payload) {
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
    scope: payload.scope,
    category: payload.scope === 'category' ? payload.category : null,
    period_type: payload.periodType,
    period_start: payload.periodStart,
    amount: Number(payload.amount) || 0,
  }

  const { data, error } = await supabase.from('budgets').insert(row).select().single()
  if (error) return { data: null, error }
  return { data: rowToBudget(data), error: null }
}

/**
 * Update an existing budget (RLS ensures ownership).
 * @param {string} id - budget uuid
 * @param {{ scope?: string, category?: string, periodType?: string, periodStart?: string, amount?: number }} payload
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function updateBudget(id, payload) {
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

  const row = {}
  if (payload.scope !== undefined) row.scope = payload.scope
  if (payload.category !== undefined) row.category = payload.category
  if (payload.periodType !== undefined) row.period_type = payload.periodType
  if (payload.periodStart !== undefined) row.period_start = payload.periodStart
  if (payload.amount !== undefined) row.amount = Number(payload.amount) || 0

  const clean = Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined))
  if (Object.keys(clean).length === 0) {
    const { data } = await supabase.from('budgets').select('*').eq('id', id).single()
    return { data: data ? rowToBudget(data) : null, error: null }
  }

  const { data, error } = await supabase
    .from('budgets')
    .update(clean)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data: rowToBudget(data), error: null }
}

/**
 * Delete a budget by id (RLS ensures ownership).
 * @param {string} id - budget uuid
 * @returns {Promise<{ error: Error | null }>}
 */
export async function deleteBudget(id) {
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

  const { error } = await supabase.from('budgets').delete().eq('id', id)
  return { error: error || null }
}
