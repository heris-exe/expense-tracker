import { useState, useMemo } from 'react'
import { getDayOfWeek, formatAmount } from '../utils/helpers'
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

export default function ExpenseLog({ expenses, onEdit, onDelete }) {
  const [filterDate, setFilterDate] = useState('')

  const filteredList = useMemo(() => {
    let list = expenses
    if (filterDate) list = expenses.filter((e) => e.date === filterDate)
    return [...list].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      return (b.id ?? 0) - (a.id ?? 0)
    })
  }, [expenses, filterDate])

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
          <p className="mt-0.5 text-xs text-muted-foreground">View and filter by date</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="filterDate" className="text-xs text-muted-foreground">
            Date
          </label>
          <Input
            type="date"
            id="filterDate"
            className="h-9 w-auto min-w-[140px]"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => setFilterDate('')}>
            Show all
          </Button>
        </div>
      </div>
      <Card className="overflow-hidden border-border bg-card shadow-sm transition-shadow hover:shadow-md rounded-xl">
        <CardContent className="p-0">
          <Table className="expense-log-table">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Day</TableHead>
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
                  <TableCell className="py-3 text-sm text-foreground">{exp.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate py-3 text-sm text-foreground sm:max-w-none">{exp.description}</TableCell>
                  <TableCell className="amount-cell py-3 text-sm font-semibold tabular-nums tracking-tight whitespace-nowrap">
                    {formatAmount(exp.amount)}
                  </TableCell>
                  <TableCell className="text-muted-cell py-3 text-sm tabular-nums font-medium whitespace-nowrap">
                    {isFirstRowForDate ? formatAmount(dailyTotalsByDate[exp.date] ?? 0) : ''}
                  </TableCell>
                  <TableCell className="py-3 text-sm">{exp.paymentMethod || '-'}</TableCell>
                  <TableCell className="text-muted-cell max-w-[160px] truncate py-3 text-sm sm:max-w-none">{exp.notes || '-'}</TableCell>
                  <TableCell className="py-3 text-sm">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onEdit(exp)}
                        aria-label="Edit"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(exp.id)}
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
        <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
          No expenses yet. Add one above.
        </div>
      )}
    </section>
  )
}
