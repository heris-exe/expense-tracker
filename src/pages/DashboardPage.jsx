/**
 * Dashboard: overview with summary stats, insights, and a daily chart.
 * Quick-glance page after login; detailed expense list lives on its own page.
 */

import { Link } from 'react-router-dom'
import Dashboard, { DashboardSkeleton } from '@/components/Dashboard'
import SmartInsights, { SmartInsightsSkeleton } from '@/components/SmartInsights'
import {
  DailyExpenseChart,
  DailyExpenseChartSkeleton,
} from '@/components/ExpenseCharts'
import { useExpenseContext } from '@/contexts/ExpenseContext'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export default function DashboardPage() {
  const { expenses, isLoading } = useExpenseContext()

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
      <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <Dashboard expenses={expenses} />
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 sm:gap-10 lg:grid-cols-2 lg:items-stretch">
        {isLoading ? (
          <SmartInsightsSkeleton />
        ) : (
          <SmartInsights expenses={expenses} />
        )}
        {isLoading ? (
          <DailyExpenseChartSkeleton />
        ) : (
          <DailyExpenseChart expenses={expenses} />
        )}
      </section>

      <section className="flex flex-wrap gap-3 border-t border-border pt-6 sm:pt-8">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/expenses">
            <Wallet className="h-4 w-4" />
            View all expenses
          </Link>
        </Button>
      </section>
    </div>
  )
}
