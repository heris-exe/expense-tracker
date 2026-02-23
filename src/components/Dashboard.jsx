import { useMemo } from 'react'
import { formatAmount, todayStr } from '../utils/helpers'
import { Card } from '@/components/ui/card'
import { CalendarDays, CalendarRange, Infinity } from 'lucide-react'

const statConfig = [
  {
    key: 'today',
    label: 'Today',
    icon: CalendarDays,
    description: 'Spent today',
  },
  {
    key: 'month',
    label: 'This month',
    icon: CalendarRange,
    description: 'Spent this month',
  },
  {
    key: 'all',
    label: 'All time',
    icon: Infinity,
    description: 'Total spent',
  },
]

export default function Dashboard({ expenses }) {
  const stats = useMemo(() => {
    const today = todayStr()
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    let totalToday = 0
    let totalMonth = 0
    let totalAll = 0
    let countToday = 0
    let countMonth = 0
    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0
      totalAll += amt
      if (e.date === today) {
        totalToday += amt
        countToday += 1
      }
      const d = new Date(e.date + 'T12:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) {
        totalMonth += amt
        countMonth += 1
      }
    })
    return {
      today: { total: totalToday, count: countToday },
      month: { total: totalMonth, count: countMonth },
      all: { total: totalAll, count: expenses.length },
    }
  }, [expenses])

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-sm font-medium text-foreground tracking-tight">Overview</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Totals at a glance</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statConfig.map(({ key, label, icon: Icon, description }) => {
          const { total, count } = stats[key]
          return (
            <Card
              key={key}
              className="flex flex-col gap-4 border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {formatAmount(total)}
              </p>
              <p className="text-xs text-muted-foreground">
                {count === 1 ? '1 transaction' : `${count} transactions`}
              </p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
