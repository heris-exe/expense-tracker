/**
 * Main layout for authenticated app: header with nav, global alerts, outlet for page content,
 * add/edit and delete expense dialogs, and footer. Uses ExpenseContext so "Add expense"
 * and modals work from any page.
 */

import { Outlet, NavLink } from 'react-router-dom'
import { AppHeader, AppFooter } from '@/components/layout'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Wallet } from 'lucide-react'
import { useExpenseContext } from '@/contexts/ExpenseContext'
import ExpenseForm from '@/components/ExpenseForm'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'

const navItems = [
  { to: '/', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', end: false, label: 'Expenses', icon: Wallet },
]

export default function AppLayout() {
  const {
    editingExpense,
    isModalOpen,
    deleteTarget,
    isDeleting,
    deleteError,
    closeModal,
    handleAdd,
    loadError,
    loadExpenses,
    importProgress,
    closeDeleteConfirm,
    confirmDelete,
    isLoading,
  } = useExpenseContext()

  return (
    <div className="min-h-screen w-full px-3 py-4 pb-24 sm:pb-6 sm:px-6 sm:py-6 lg:px-8">
      <AppHeader />
      {/* Top nav: desktop only — avoids cramped header on mobile */}
      <nav
        className="mt-3 hidden flex-wrap items-center gap-1 rounded-lg bg-muted/40 px-2 py-2 md:flex md:mt-4 md:px-3 md:py-2"
        aria-label="Main"
      >
        {navItems.map(({ to, end, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `min-h-[44px] shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:min-h-0 md:py-2 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="py-4 sm:py-8">
        {loadError && (
          <div
            className="mb-4 flex flex-wrap items-center gap-2 rounded-r-lg border border-destructive/50 border-l-4 border-l-destructive bg-destructive/10 px-4 py-2"
            role="alert"
          >
            <span className="text-sm text-destructive">{loadError.message}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadExpenses()}
              className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/20 focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Retry
            </Button>
          </div>
        )}
        {isLoading && (
          <p className="mb-4 text-sm text-muted-foreground" role="status" aria-live="polite">
            Loading expenses…
          </p>
        )}
        {importProgress && !importProgress.done && (
          <p className="mb-4 text-sm text-muted-foreground" role="status" aria-live="polite">
            Importing… {importProgress.current} of {importProgress.total}
          </p>
        )}
        {importProgress?.done && (
          <p
            className="mb-4 rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm text-foreground"
            role="status"
          >
            {importProgress.failed > 0
              ? `Imported ${importProgress.imported} of ${importProgress.total} (${importProgress.failed} failed).`
              : `Imported ${importProgress.imported} expense${importProgress.imported === 1 ? '' : 's'}.`}
          </p>
        )}
        <Outlet />
      </main>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-h-[90dvh] overflow-y-auto rounded-xl border-border shadow-md sm:w-full sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit expense' : 'Add expense'}</DialogTitle>
            <DialogDescription>
              {editingExpense
                ? 'Update the transaction details below.'
                : 'Record a new transaction in ₦.'}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            onSubmit={handleAdd}
            editingExpense={editingExpense}
            onCancel={closeModal}
            onSuccess={closeModal}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        expense={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && closeDeleteConfirm()}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        deleteError={deleteError}
      />

      {/* Mobile: sticky bottom nav (Dashboard, Expenses) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around gap-1 border-t border-border bg-card/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
        aria-label="Main"
      >
        {navItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors touch-manipulation active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <AppFooter />
    </div>
  )
}
