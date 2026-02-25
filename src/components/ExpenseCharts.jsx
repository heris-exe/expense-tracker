import { useMemo, useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { formatAmount } from '../utils/helpers'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/* Distinct category colors – readable on black, still cohesive */
const CHART_COLORS = [
  '#22d3ee', /* cyan */
  '#a78bfa', /* violet */
  '#34d399', /* emerald */
  '#fbbf24', /* amber */
  '#f472b6', /* pink */
  '#60a5fa', /* blue */
  '#4ade80', /* green */
  '#c084fc', /* purple */
]
const LINE_STROKE = '#22d3ee'
const BAR_FILL = '#22d3ee'
const GRID_STROKE = '#262626'
const AXIS_TICK = '#737373'

function useCategoryData(expenses) {
  return useMemo(() => {
    const byCategory = {}
    expenses.forEach((e) => {
      const cat = e.category || 'Other'
      const amt = Number(e.amount) || 0
      byCategory[cat] = (byCategory[cat] || 0) + amt
    })
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])
}

function useMonthlyData(expenses) {
  return useMemo(() => {
    const byMonth = {}
    expenses.forEach((e) => {
      const month = (e.date || '').slice(0, 7)
      if (!month) return
      const amt = Number(e.amount) || 0
      byMonth[month] = (byMonth[month] || 0) + amt
    })
    return Object.entries(byMonth)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [expenses])
}

/** Daily totals for line chart: one point per date. */
function useDailyData(expenses) {
  return useMemo(() => {
    const byDay = {}
    expenses.forEach((e) => {
      const day = e.date
      if (!day) return
      const amt = Number(e.amount) || 0
      byDay[day] = (byDay[day] || 0) + amt
    })
    return Object.entries(byDay)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [expenses])
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const value = payload[0].payload?.value ?? payload[0].value
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-md">
      <div className="text-muted-foreground text-xs">{label || payload[0].name}</div>
      <div className="font-semibold">{formatAmount(value)}</div>
    </div>
  )
}

/** Match Tailwind sm breakpoint so charts and legend adapt on small screens (e.g. iPhone 12, Tecno Spark 30C). */
function useIsNarrow() {
  const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    const handler = () => setIsNarrow(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isNarrow
}

const cardClass =
  'overflow-hidden border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md rounded-xl'

/** Standalone daily expense line chart; used beside Smart Insights. */
export function DailyExpenseChart({ expenses }) {
  const dailyData = useDailyData(expenses)

  return (
    <section className="flex h-full min-h-0 flex-col gap-5">
      <div className="shrink-0">
        <h2 className="text-sm font-medium text-foreground tracking-tight">Daily expense</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Spending over time by day</p>
      </div>
      <Card className={`${cardClass} min-h-[280px] flex-1`}>
        {dailyData.length > 0 ? (
          <>
            <CardContent className="px-0 pb-0 pt-0">
              <div className="h-[200px] w-full sm:h-[260px]" role="img" aria-label="Daily expense over time">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: AXIS_TICK, fontSize: 11 }}
                      tickFormatter={(v) => (v || '').slice(5)}
                    />
                    <YAxis
                      tick={{ fill: AXIS_TICK, fontSize: 12 }}
                      tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      labelFormatter={(label) => label}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={LINE_STROKE}
                      strokeWidth={2}
                      dot={{ fill: LINE_STROKE, r: 3 }}
                      name="Total"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="py-12">
            <p className="text-center text-sm text-muted-foreground">
              Add some expenses to see your daily spending trend here.
            </p>
          </CardContent>
        )}
      </Card>
    </section>
  )
}

export function DailyExpenseChartSkeleton() {
  return (
    <section className="flex h-full min-h-0 flex-col gap-5">
      <div className="shrink-0">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-3 w-40" />
      </div>
      <Card className="overflow-hidden border-border bg-card p-5 shadow-sm rounded-xl min-h-[280px] flex-1">
        <div className="h-[200px] w-full sm:h-[260px] min-h-[200px]">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </Card>
    </section>
  )
}

export default function ExpenseCharts({ expenses }) {
  const isNarrow = useIsNarrow()
  const categoryData = useCategoryData(expenses)
  const monthlyData = useMonthlyData(expenses)

  if (expenses.length === 0) {
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-sm font-medium text-foreground tracking-tight">Charts</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Spending by category and over time</p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
          Add some expenses to see charts here.
        </div>
      </section>
    )
  }

  const categorySummary = categoryData.map((d) => `${d.name} ${formatAmount(d.value)}`).join(', ')
  const monthlySummary = monthlyData.map((d) => `${d.name}: ${formatAmount(d.value)}`).join(', ')

  return (
    <section className="space-y-5" aria-label="Spending charts">
      <div>
        <h2 className="text-sm font-medium text-foreground tracking-tight">Charts</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Spending by category and over time</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className={cardClass}>
          <CardHeader className="gap-1 pb-3 pt-0">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Spending by category</h3>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            <div className="h-[260px] w-full sm:h-[340px]" role="img" aria-label={categorySummary || 'Spending by category chart'}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isNarrow ? 72 : 110}
                    label={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout={isNarrow ? 'horizontal' : 'vertical'}
                    align={isNarrow ? 'center' : 'right'}
                    verticalAlign={isNarrow ? 'bottom' : 'middle'}
                    wrapperStyle={isNarrow ? { fontSize: 10, paddingTop: 8 } : { fontSize: 11, paddingLeft: 24, marginLeft: 8 }}
                    formatter={(value) => {
                      const total = categoryData.reduce((s, d) => s + d.value, 0)
                      const item = categoryData.find((d) => d.name === value)
                      const pct = item && total ? ((item.value / total) * 100).toFixed(0) : '0'
                      const short = value.length > (isNarrow ? 10 : 12) ? value.slice(0, (isNarrow ? 9 : 11)) + '…' : value
                      return `${short} ${pct}%`
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="gap-1 pb-3 pt-0">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Spending by month</h3>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            <div className="h-[220px] w-full sm:h-[280px]" role="img" aria-label={monthlySummary || 'Spending by month chart'}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: AXIS_TICK, fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: AXIS_TICK, fontSize: 12 }}
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={BAR_FILL} radius={[4, 4, 0, 0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export function ExpenseChartsSkeleton() {
  return (
    <section className="space-y-5" aria-label="Loading spending charts">
      <div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-3 w-56" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Card key={idx} className="overflow-hidden border-border bg-card p-5 shadow-sm rounded-xl">
            <CardHeader className="gap-1 pb-3 pt-0">
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-0">
              <div className="h-[220px] w-full sm:h-[280px]">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

