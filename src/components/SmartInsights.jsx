import { useMemo } from 'react'
import { formatAmount } from '../utils/helpers'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  TrendingDown,
  Crown,
  BarChart3,
  Flame,
  CalendarCheck,
  Minus,
  Lightbulb,
} from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toYMD(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function useInsights(expenses) {
  return useMemo(() => {
    if (!expenses || expenses.length === 0) return []

    const now = new Date()
    const curYear = now.getFullYear()
    const curMonth = now.getMonth()

    const prevMonthDate = new Date(curYear, curMonth - 1, 1)
    const prevYear = prevMonthDate.getFullYear()
    const prevMonth = prevMonthDate.getMonth()

    const thisMonthExpenses = []
    const lastMonthExpenses = []
    const byCategoryThisMonth = {}
    const byDayOfWeekAll = {}

    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0
      const d = new Date(e.date + 'T12:00:00')
      const eYear = d.getFullYear()
      const eMonth = d.getMonth()

      if (eYear === curYear && eMonth === curMonth) {
        thisMonthExpenses.push(e)
        const cat = e.category || 'Other'
        byCategoryThisMonth[cat] = (byCategoryThisMonth[cat] || 0) + amt
      }

      if (eYear === prevYear && eMonth === prevMonth) {
        lastMonthExpenses.push(e)
      }

      const dayIdx = d.getDay()
      byDayOfWeekAll[dayIdx] = (byDayOfWeekAll[dayIdx] || 0) + amt
    })

    const insights = []

    // --- 1. Top categories this month ---
    const catEntries = Object.entries(byCategoryThisMonth).sort((a, b) => b[1] - a[1])
    const totalThisMonth = catEntries.reduce((s, [, v]) => s + v, 0)

    if (catEntries.length > 0) {
      const top = catEntries.slice(0, 3)
      const parts = top.map(([name, value]) => {
        const pct = totalThisMonth > 0 ? Math.round((value / totalThisMonth) * 100) : 0
        return `${name} ${formatAmount(value)} (${pct}%)`
      })
      insights.push({
        icon: BarChart3,
        label: 'Top categories this month',
        text: parts.join(', '),
        tone: 'neutral',
      })
    }

    // --- 2. Biggest single expense this month ---
    if (thisMonthExpenses.length > 0) {
      const biggest = thisMonthExpenses.reduce((max, e) => {
        const amt = Number(e.amount) || 0
        return amt > (Number(max.amount) || 0) ? e : max
      }, thisMonthExpenses[0])
      insights.push({
        icon: Crown,
        label: 'Biggest expense this month',
        text: `${formatAmount(biggest.amount)} on ${biggest.date} — ${biggest.description || biggest.category || 'No description'}`,
        tone: 'neutral',
      })
    }

    // --- 3. Month-over-month change ---
    const totalLastMonth = lastMonthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)

    if (totalLastMonth > 0) {
      const diff = totalThisMonth - totalLastMonth
      const pctChange = Math.round(Math.abs(diff / totalLastMonth) * 100)

      if (diff > 0) {
        insights.push({
          icon: TrendingUp,
          label: 'vs last month',
          text: `Spending is up ${pctChange}% (${formatAmount(diff)} more)`,
          tone: 'negative',
        })
      } else if (diff < 0) {
        insights.push({
          icon: TrendingDown,
          label: 'vs last month',
          text: `Spending is down ${pctChange}% (${formatAmount(Math.abs(diff))} less)`,
          tone: 'positive',
        })
      } else {
        insights.push({
          icon: Minus,
          label: 'vs last month',
          text: 'Spending is exactly the same as last month',
          tone: 'neutral',
        })
      }
    } else if (totalThisMonth > 0) {
      insights.push({
        icon: TrendingUp,
        label: 'vs last month',
        text: `No spending recorded last month. This month: ${formatAmount(totalThisMonth)}`,
        tone: 'neutral',
      })
    }

    // --- 4. Spending streaks (consecutive days with/without spending) ---
    const today = toYMD(now)
    const datesWithSpending = new Set(expenses.map((e) => e.date))

    let noSpendStreak = 0
    let spendStreak = 0

    for (let i = 0; i < 60; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const ymd = toYMD(d)
      if (ymd > today) continue
      if (datesWithSpending.has(ymd)) break
      noSpendStreak++
    }

    if (noSpendStreak === 0) {
      for (let i = 0; i < 60; i++) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const ymd = toYMD(d)
        if (ymd > today) continue
        if (!datesWithSpending.has(ymd)) break
        spendStreak++
      }
    }

    if (noSpendStreak >= 2) {
      insights.push({
        icon: CalendarCheck,
        label: 'No-spend streak',
        text: `${noSpendStreak} day${noSpendStreak === 1 ? '' : 's'} in a row with no expenses — keep it up!`,
        tone: 'positive',
      })
    } else if (spendStreak >= 3) {
      insights.push({
        icon: Flame,
        label: 'Spending streak',
        text: `${spendStreak} day${spendStreak === 1 ? '' : 's'} in a row with expenses`,
        tone: 'negative',
      })
    }

    // --- 5. Busiest day of the week (all time) ---
    const dayEntries = Object.entries(byDayOfWeekAll)
    if (dayEntries.length > 0) {
      const [busiestIdx] = dayEntries.sort((a, b) => b[1] - a[1])[0]
      insights.push({
        icon: Lightbulb,
        label: 'Busiest spending day',
        text: `Most of your expenses land on ${DAYS[Number(busiestIdx)]}s`,
        tone: 'neutral',
      })
    }

    return insights
  }, [expenses])
}

const toneColors = {
  positive: 'text-emerald-500',
  negative: 'text-orange-500',
  neutral: 'text-muted-foreground',
}

export default function SmartInsights({ expenses }) {
  const insights = useInsights(expenses)

  if (insights.length === 0) return null

  return (
    <section className="flex h-full min-h-0 flex-col gap-5">
      <div className="shrink-0">
        <h2 className="text-sm font-medium text-foreground tracking-tight">Smart Insights</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">What's interesting about your spending</p>
      </div>
      <Card className="border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md rounded-xl min-h-[280px] flex-1">
        <ul className="space-y-4" role="list">
          {insights.map((insight, idx) => {
            const Icon = insight.icon
            return (
              <li key={idx} className="flex items-start gap-3">
                <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted ${toneColors[insight.tone]}`}>
                  <Icon className="size-3.5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {insight.label}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {insight.text}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </section>
  )
}

export function SmartInsightsSkeleton() {
  return (
    <section className="flex h-full min-h-0 flex-col gap-5">
      <div className="shrink-0">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-2 h-3 w-56" />
      </div>
      <Card className="border-border bg-card p-5 shadow-sm rounded-xl min-h-[280px] flex-1">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Skeleton className="h-7 w-7 rounded-md" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="h-3 w-full max-w-[320px]" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
