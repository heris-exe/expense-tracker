import { useState } from 'react'
import { formatAmount } from '../utils/helpers'
import { getWeekStart } from '../hooks/useBudgets'
import { CATEGORIES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const PERIOD_TYPES = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
]

function formatPeriodLabel(budget) {
  const start = budget.periodStart
  if (!start) return '—'
  if (budget.periodType === 'day') {
    const d = new Date(start + 'T12:00:00')
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  if (budget.periodType === 'week') {
    const d = new Date(start + 'T12:00:00')
    return `Week of ${d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  if (budget.periodType === 'month') {
    const d = new Date(start + 'T12:00:00')
    return d.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
  }
  return start
}

function BudgetForm({ budget, onSubmit, onCancel, isSubmitting }) {
  const today = new Date().toISOString().slice(0, 10)
  const [scope, setScope] = useState(budget?.scope ?? 'overall')
  const [category, setCategory] = useState(budget?.category ?? '')
  const [periodType, setPeriodType] = useState(budget?.periodType ?? 'month')
  const [periodDate, setPeriodDate] = useState(budget?.periodStart?.slice(0, 10) ?? today)
  const [periodMonth, setPeriodMonth] = useState(
    budget?.periodStart ? budget.periodStart.slice(0, 7) : today.slice(0, 7)
  )
  const [amount, setAmount] = useState(String(budget?.amount ?? ''))
  const [submitError, setSubmitError] = useState(null)

  const getPeriodStart = () => {
    if (periodType === 'day') return periodDate
    if (periodType === 'week') return getWeekStart(periodDate)
    if (periodType === 'month') return periodMonth + '-01'
    return periodMonth + '-01'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    const amt = Number(amount)
    if (!(amt > 0)) {
      setSubmitError('Amount must be greater than 0.')
      return
    }
    if (scope === 'category' && !category) {
      setSubmitError('Select a category for per-category budgets.')
      return
    }
    try {
      await onSubmit({
        scope,
        category: scope === 'category' ? category : null,
        periodType,
        periodStart: getPeriodStart(),
        amount: amt,
      })
      onCancel?.()
    } catch (err) {
      setSubmitError(err?.message ?? 'Something went wrong. Try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {submitError && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}
      <div className="space-y-2">
        <Label>Scope</Label>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overall">Overall (all spending)</SelectItem>
            <SelectItem value="category">Per category</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {scope === 'category' && (
        <div className="space-y-2">
          <Label htmlFor="budget-category">Category</Label>
          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger id="budget-category" className="w-full">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label>Period type</Label>
        <Select value={periodType} onValueChange={setPeriodType}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_TYPES.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {periodType === 'day' && (
        <div className="space-y-2">
          <Label htmlFor="budget-date">Date</Label>
          <Input
            id="budget-date"
            type="date"
            value={periodDate}
            onChange={(e) => setPeriodDate(e.target.value)}
            required
          />
        </div>
      )}
      {periodType === 'week' && (
        <div className="space-y-2">
          <Label htmlFor="budget-week">Any day in the week</Label>
          <Input
            id="budget-week"
            type="date"
            value={periodDate}
            onChange={(e) => setPeriodDate(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">Weekly budgets use Monday–Sunday.</p>
        </div>
      )}
      {periodType === 'month' && (
        <div className="space-y-2">
          <Label htmlFor="budget-month">Month</Label>
          <Input
            id="budget-month"
            type="month"
            value={periodMonth}
            onChange={(e) => setPeriodMonth(e.target.value)}
            required
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="budget-amount">Amount (₦)</Label>
        <Input
          id="budget-amount"
          type="number"
          min="1"
          step="1"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : budget ? 'Save changes' : 'Add budget'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function BudgetManager({
  budgetProgress,
  onAddBudget,
  onUpdateBudget,
  onRemoveBudget,
  isLoading,
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (payload) => {
    setIsSubmitting(true)
    try {
      if (editingBudget) {
        await onUpdateBudget(editingBudget.id, payload)
      } else {
        await onAddBudget(payload)
      }
      setFormOpen(false)
      setEditingBudget(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!deleteTarget) return
    setIsSubmitting(true)
    try {
      await onRemoveBudget(id)
      setDeleteTarget(null)
    } catch {
      // keep dialog open on error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground tracking-tight">Budgets</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Set daily, weekly, or monthly limits (overall or per category)
          </p>
        </div>
        <Button onClick={() => { setEditingBudget(null); setFormOpen(true) }} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add budget
        </Button>
      </div>

      {isLoading ? (
        <Card className="border-border p-6 rounded-xl">
          <p className="text-sm text-muted-foreground">Loading budgets…</p>
        </Card>
      ) : budgetProgress.length === 0 ? (
        <Card className="border border-dashed border-border bg-muted/20 p-8 rounded-xl text-center">
          <p className="text-sm text-muted-foreground mb-4">No budgets yet.</p>
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            Add your first budget
          </Button>
        </Card>
      ) : (
        <Card className="border-border overflow-hidden rounded-xl">
          <ul className="divide-y divide-border" role="list">
            {budgetProgress.map(({ budget, spent, progress, state }) => (
              <li key={budget.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">
                      {budget.scope === 'overall' ? 'Overall' : (budget.category || 'Category')}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground capitalize">{budget.periodType}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{formatPeriodLabel(budget)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 max-w-[200px] rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          state === 'over' ? 'bg-destructive' : state === 'near' ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, progress * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {formatAmount(spent)} / {formatAmount(budget.amount)}
                      {state === 'over' && ' (over)'}
                      {state === 'near' && ' (near limit)'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => { setEditingBudget(budget); setFormOpen(true) }}
                    aria-label="Edit budget"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(budget)}
                    aria-label="Delete budget"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !open && (setFormOpen(false), setEditingBudget(null))}>
        <DialogContent className="rounded-xl border-border shadow-md sm:max-w-[440px] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit budget' : 'Add budget'}</DialogTitle>
            <DialogDescription>
              {editingBudget ? 'Update the budget limit and period.' : 'Set a spending limit for a day, week, or month.'}
            </DialogDescription>
          </DialogHeader>
          <BudgetForm
            budget={editingBudget}
            onSubmit={handleSubmit}
            onCancel={() => { setFormOpen(false); setEditingBudget(null) }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-xl border-border shadow-md sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete budget?</DialogTitle>
            <DialogDescription>
              This will remove the budget. You can add it again later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              {isSubmitting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
