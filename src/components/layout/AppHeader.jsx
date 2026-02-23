import { ThemeToggle } from '@/components/ThemeToggle'

export default function AppHeader() {
  return (
    <header className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card px-5 py-5 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Expense Tracker 2026
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Track daily expenses in ₦ — no Excel needed
        </p>
      </div>
      <ThemeToggle />
    </header>
  )
}
