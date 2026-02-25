import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getDayOfWeek, formatAmount, formatTimeFromISO } from '../utils/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/constants'

export default function ExpenseLog({ expenses, onEdit, onDelete }) {
  const [filterDate, setFilterDate] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  /** On mobile: when set, we show the detail view instead of the list. On desktop the table is always shown. */
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')

  const filteredList = useMemo(() => {
    let list = expenses
    if (filterDate) list = list.filter((e) => e.date === filterDate)
    if (filterCategory) list = list.filter((e) => (e.category || 'Other') === filterCategory)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      list = list.filter((e) => {
        const haystack = [
          e.description,
          e.notes,
          e.category,
          e.paymentMethod,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }
    if (minAmount) {
      const min = Number(minAmount) || 0
      list = list.filter((e) => (Number(e.amount) || 0) >= min)
    }
    if (maxAmount) {
      const max = Number(maxAmount) || 0
      list = list.filter((e) => (Number(e.amount) || 0) <= max)
    }
    return [...list].sort((a, b) => {
      // Newer days first
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      // Within the same day, sort by creation time (newest first) if available
      const createdA = a.createdAt || ''
      const createdB = b.createdAt || ''
      if (createdA !== createdB) return createdB.localeCompare(createdA)
      // Fallback: stable-ish order by id
      return String(b.id ?? '').localeCompare(String(a.id ?? ''))
    })
  }, [expenses, filterDate, filterCategory, searchTerm, minAmount, maxAmount])

  const dailyTotalsByDate = useMemo(() => {
    const map = {}
    filteredList.forEach((e) => {
      const d = e.date
      const amt = Number(e.amount) || 0
      map[d] = (map[d] || 0) + amt
    })
    return map
  }, [filteredList])

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground tracking-tight">Daily expense log</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            View and filter by date, category, amount, or keyword
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="filterDate" className="text-xs text-muted-foreground">
            Date
          </label>
          <Input
            type="date"
            id="filterDate"
            className="h-10 w-full min-w-0 sm:h-9 sm:w-auto sm:min-w-[140px]"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <label htmlFor="filterCategory" className="text-xs text-muted-foreground">
            Category
          </label>
          <Select value={filterCategory || 'all'} onValueChange={(v) => setFilterCategory(v === 'all' ? '' : v)}>
            <SelectTrigger id="filterCategory" className="h-10 w-full min-w-0 sm:h-9 sm:w-auto sm:min-w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label htmlFor="filterSearch" className="text-xs text-muted-foreground">
            Search
          </label>
          <Input
            id="filterSearch"
            placeholder="Description, notes, category…"
            className="h-10 w-full min-w-0 sm:h-9 sm:w-[180px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <label htmlFor="filterMin" className="text-xs text-muted-foreground">
            Min ₦
          </label>
          <Input
            type="number"
            id="filterMin"
            className="h-10 w-24 min-w-0 sm:h-9"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <label htmlFor="filterMax" className="text-xs text-muted-foreground">
            Max ₦
          </label>
          <Input
            type="number"
            id="filterMax"
            className="h-10 w-24 min-w-0 sm:h-9"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="min-h-[44px] sm:min-h-0"
            onClick={() => {
              setFilterDate('')
              setFilterCategory('')
              setSearchTerm('')
              setMinAmount('')
              setMaxAmount('')
            }}
          >
            Show all
          </Button>
        </div>
      </div>

      {/* Mobile: list + detail (no horizontal scroll). Desktop: table. */}
      <div className="md:hidden">
        {selectedExpense == null ? (
          filteredList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
              {(filterDate || filterCategory || searchTerm.trim() || minAmount || maxAmount) ? 'No expenses match your filters.' : 'No expenses yet. Add one above.'}
            </div>
          ) : (
          <ul className="space-y-2" role="list">
            {filteredList.map((exp, index) => {
              const isFirstForDate = index === 0 || filteredList[index - 1].date !== exp.date
              const dailyTotal = isFirstForDate ? (dailyTotalsByDate[exp.date] ?? 0) : null
              return (
                <li key={exp.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedExpense(exp)}
                    className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{exp.description || 'No description'}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {exp.date} · {getDayOfWeek(exp.date)}
                          {exp.createdAt ? ` · ${formatTimeFromISO(exp.createdAt)}` : ''}
                          {' · '}
                          {exp.category || 'Other'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums text-foreground">{formatAmount(exp.amount)}</p>
                        {dailyTotal != null && (
                          <p className="text-xs text-muted-foreground">Day: {formatAmount(dailyTotal)}</p>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          )
        ) : (
          <Card className="overflow-hidden border-border bg-card shadow-sm rounded-xl">
            <CardContent className="p-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 mb-4 gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedExpense(null)}
                aria-label="Back to list"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to list
              </Button>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</dt>
                  <dd className="mt-0.5 text-foreground">
                    {selectedExpense.date} · {getDayOfWeek(selectedExpense.date)}
                    {selectedExpense.createdAt ? ` · ${formatTimeFromISO(selectedExpense.createdAt)}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</dt>
                  <dd className="mt-0.5 text-foreground">{selectedExpense.category || 'Other'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</dt>
                  <dd className="mt-0.5 text-foreground">{selectedExpense.description || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount (₦)</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{formatAmount(selectedExpense.amount)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Daily total (that day)</dt>
                  <dd className="mt-0.5 tabular-nums text-foreground">{formatAmount(dailyTotalsByDate[selectedExpense.date] ?? 0)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment</dt>
                  <dd className="mt-0.5 text-foreground">{selectedExpense.paymentMethod || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</dt>
                  <dd className="mt-0.5 text-foreground">{selectedExpense.notes || '—'}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] flex-1 sm:flex-none"
                  onClick={() => onEdit(selectedExpense)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
                  onClick={() => onDelete(selectedExpense)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="hidden overflow-hidden border-border bg-card shadow-sm transition-shadow hover:shadow-md rounded-xl md:block">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="expense-log-table min-w-[720px] sm:min-w-0">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Day</TableHead>
                  <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount (₦)</TableHead>
                <TableHead className="h-11 whitespace-nowrap text-xs font-medium uppercase tracking-wider text-muted-foreground">Daily total</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</TableHead>
                <TableHead className="h-11 w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((exp, index) => {
                const isFirstRowForDate =
                  index === 0 || filteredList[index - 1].date !== exp.date
                return (
                <TableRow key={exp.id}>
                  <TableCell className="py-3 text-sm text-foreground">{exp.date}</TableCell>
                  <TableCell className="py-3 text-sm text-foreground">{getDayOfWeek(exp.date)}</TableCell>
                  <TableCell className="py-3 text-sm text-foreground">
                    {exp.createdAt ? formatTimeFromISO(exp.createdAt) : '—'}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-foreground">{exp.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate py-3 text-sm text-foreground sm:max-w-none">{exp.description}</TableCell>
                  <TableCell className="amount-cell py-3 text-sm font-semibold tabular-nums tracking-tight whitespace-nowrap">
                    {formatAmount(exp.amount)}
                  </TableCell>
                  <TableCell className="text-muted-cell py-3 text-sm tabular-nums font-medium whitespace-nowrap">
                    {isFirstRowForDate ? formatAmount(dailyTotalsByDate[exp.date] ?? 0) : ''}
                  </TableCell>
                  <TableCell className="py-3 text-sm">{exp.paymentMethod || '-'}</TableCell>
                  <TableCell
                    className="text-muted-cell max-w-[220px] truncate py-3 text-sm"
                    title={exp.notes || undefined}
                  >
                    {exp.notes || '-'}
                  </TableCell>
                  <TableCell className="py-2 sm:py-3 text-sm">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-[36px] min-w-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onEdit(exp)}
                        aria-label="Edit"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-[36px] min-w-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(exp)}
                        aria-label="Delete"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {filteredList.length === 0 && (
        <div className="hidden rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground md:block">
          {(filterDate || filterCategory || searchTerm.trim() || minAmount || maxAmount) ? 'No expenses match your filters.' : 'No expenses yet. Add one above.'}
        </div>
      )}
    </section>
  )
}

export function ExpenseLogSkeleton() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-60" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="md:hidden space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card
            key={idx}
            className="rounded-xl border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="shrink-0 space-y-2 text-right">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden border-border bg-card shadow-sm rounded-xl md:block">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-24" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-full max-w-[200px]" />
                </div>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

