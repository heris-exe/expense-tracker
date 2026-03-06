import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function AppHeader() {
  const { user, signOut, isConfigured } = useAuth()

  return (
    <header className="flex items-start justify-between gap-3 rounded-b-xl border-b border-x-0 border-t-0 border-border bg-card/95 px-4 py-4 shadow-sm sm:px-5 sm:py-5">
      <Link
        to="/"
        className="flex min-w-0 flex-1 items-start gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Spend NG home"
      >
        <img
          src="/logo.png"
          alt=""
          className="size-9 shrink-0 invert dark:invert-0 sm:size-10"
          width={40}
          height={40}
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Spend NG
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track daily expenses in ₦ — no Excel needed
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        {isConfigured && user && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            title="Sign out"
            aria-label="Sign out"
            className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
