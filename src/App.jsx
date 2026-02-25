import { useState, useRef } from 'react'
import Dashboard, { DashboardSkeleton } from './components/Dashboard'
import SmartInsights, { SmartInsightsSkeleton } from './components/SmartInsights'
import ExpenseCharts, { ExpenseChartsSkeleton, DailyExpenseChart, DailyExpenseChartSkeleton } from './components/ExpenseCharts'
import ExpenseForm from './components/ExpenseForm'
import ExpenseLog, { ExpenseLogSkeleton } from './components/ExpenseLog'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { AppHeader, AppFooter } from './components/layout'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Download, Upload, ChevronDown, RefreshCw } from 'lucide-react'
import { useExpenses } from './hooks/useExpenses'
import { useBudgets } from './hooks/useBudgets'
import { exportExpenses, parseImportFile } from './utils/exportImport'
import { formatAmount } from './utils/helpers'
import BudgetManager from './components/BudgetManager'
import { useAuth } from './contexts/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { SetupRequired } from './components/SetupRequired'

function App() {
  const { user, loading, isConfigured, signIn, signUp, signInWithGoogle, resetPasswordForEmail, sessionMessage, setSessionMessage } = useAuth()
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [authMessage, setAuthMessage] = useState(null)

  const handleSignIn = async (email, password) => {
    setAuthError(null)
    setAuthMessage(null)
    setSessionMessage?.(null)
    setAuthLoading(true)
    const { error } = await signIn(email, password)
    setAuthLoading(false)
    if (error) setAuthError(error)
  }

  const handleSignUp = async (email, password) => {
    setAuthError(null)
    setAuthMessage(null)
    setSessionMessage?.(null)
    setAuthLoading(true)
    const { data, error } = await signUp(email, password)
    setAuthLoading(false)
    if (error) {
      setAuthError(error)
      return
    }
    // Supabase often requires email confirmation: no session until they click the link.
    if (data?.user && !data?.session) {
      setAuthMessage('Account created. Check your email and click the confirmation link, then sign in below.')
    }
  }

  const handleSignInWithGoogle = async () => {
    setAuthError(null)
    setAuthMessage(null)
    setSessionMessage?.(null)
    setAuthLoading(true)
    const { error } = await signInWithGoogle()
    setAuthLoading(false)
    if (error) setAuthError(error)
    // On success, Supabase redirects to Google and then back here; no need to set user state manually.
  }

  if (!isConfigured) return <SetupRequired />
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground" role="status" aria-live="polite">
        Loading…
      </div>
    )
  }
  if (!user) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignInWithGoogle={handleSignInWithGoogle}
        onForgotPassword={resetPasswordForEmail}
        isLoading={authLoading}
        error={authError}
        message={authMessage}
        sessionMessage={sessionMessage}
      />
    )
  }

  return <AppContent />
}

function AppContent() {
  const {
    expenses,
    editingExpense,
    isModalOpen,
    deleteTarget,
    isDeleting,
    deleteError,
    openForm,
    closeModal,
    handleAdd,
    handleEdit,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    isLoading,
    loadError,
    loadExpenses,
    importProgress,
    importExpenses,
  } = useExpenses()

  const {
    budgetProgress,
    isLoading: budgetsLoading,
    addBudget,
    updateBudget,
    removeBudget,
  } = useBudgets(expenses)

  const [importError, setImportError] = useState(null)
  const [budgetBannerDismissed, setBudgetBannerDismissed] = useState(false)
  const fileInputRef = useRef(null)
  const isImporting = importProgress && !importProgress.done

  const budgetAlerts = budgetProgress.filter((p) => p.state === 'over' || p.state === 'near')
  const showBudgetBanner = budgetAlerts.length > 0 && !budgetBannerDismissed
  const overBudgets = budgetAlerts.filter((p) => p.state === 'over')
  const nearBudgets = budgetAlerts.filter((p) => p.state === 'near')

  const handleExport = (format) => {
    exportExpenses(expenses, format)
  }

  const handleImportClick = () => {
    setImportError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setImportError(null)
      setIsImporting(true)
      const items = await parseImportFile(file)
      if (!items?.length) throw new Error('No valid expenses found in file.')
      await importExpenses(items)
    } catch (err) {
      console.error('Import failed', err)
      setImportError(
        err instanceof Error ? err.message : 'Failed to import file.'
      )
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen w-full px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <AppHeader />

      <main className="py-4 sm:py-8">
        {loadError && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2" role="alert">
            <span className="text-sm text-destructive">{loadError.message}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => loadExpenses()} className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/20">
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
          <p className="mb-4 text-sm text-foreground rounded-lg border border-border bg-muted/30 px-4 py-2" role="status">
            {importProgress.failed > 0
              ? `Imported ${importProgress.imported} of ${importProgress.total} (${importProgress.failed} failed).`
              : `Imported ${importProgress.imported} expense${importProgress.imported === 1 ? '' : 's'}.`}
          </p>
        )}
        {importError && (
          <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
            {importError}
          </p>
        )}
        {showBudgetBanner && (
          <div
            className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 ${
              overBudgets.length > 0
                ? 'border-destructive/50 bg-destructive/10'
                : 'border-amber-500/50 bg-amber-500/10'
            }`}
            role="alert"
          >
            <div className="min-w-0 flex-1 text-sm">
              {overBudgets.length > 0 && (
                <p className="font-medium text-destructive">
                  Over budget: {overBudgets.map((p) => `${p.budget.scope === 'overall' ? 'Overall' : p.budget.category} (${p.budget.periodType})`).join(', ')} — {formatAmount(overBudgets.reduce((s, p) => s + (p.spent - p.budget.amount), 0))} over limit.
                </p>
              )}
              {nearBudgets.length > 0 && overBudgets.length === 0 && (
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Near budget limit: {nearBudgets.map((p) => `${p.budget.scope === 'overall' ? 'Overall' : p.budget.category} (${p.budget.periodType})`).join(', ')}.
                </p>
              )}
              {nearBudgets.length > 0 && overBudgets.length > 0 && (
                <p className="mt-1 text-muted-foreground">
                  Also near limit: {nearBudgets.map((p) => `${p.budget.scope === 'overall' ? 'Overall' : p.budget.category}`).join(', ')}.
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => setBudgetBannerDismissed(true)}
              aria-label="Dismiss"
            >
              Dismiss
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-6 sm:gap-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {isLoading ? <DashboardSkeleton /> : <Dashboard expenses={expenses} />}
            <div className="flex flex-col gap-2 sm:items-end">
              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  onClick={openForm}
                  className="min-h-[44px] shrink-0 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add expense
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-[44px] shrink-0 gap-1 text-xs sm:text-sm"
                  onClick={() => loadExpenses()}
                  disabled={isLoading}
                  title="Refresh list"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-[44px] shrink-0 gap-1 text-xs sm:text-sm"
                      disabled={!expenses || expenses.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      Export
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('json')}>
                      JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      CSV (doc)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                      Excel (sheet)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-[44px] shrink-0 gap-1 text-xs sm:text-sm"
                  onClick={handleImportClick}
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4" />
                  {isImporting ? 'Importing…' : 'Import'}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="grid gap-6 sm:gap-10 grid-cols-1 lg:grid-cols-2 lg:items-stretch">
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
          </div>
          {!isLoading && (
            <BudgetManager
              budgetProgress={budgetProgress}
              onAddBudget={addBudget}
              onUpdateBudget={updateBudget}
              onRemoveBudget={removeBudget}
              isLoading={budgetsLoading}
            />
          )}
          {isLoading ? (
            <ExpenseChartsSkeleton />
          ) : (
            <ExpenseCharts expenses={expenses} />
          )}
          {isLoading ? (
            <ExpenseLogSkeleton />
          ) : (
            <ExpenseLog
              expenses={expenses}
              onEdit={handleEdit}
              onDelete={openDeleteConfirm}
            />
          )}
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="rounded-xl border-border shadow-md sm:max-w-[480px] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit expense' : 'Add expense'}
            </DialogTitle>
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

      <AppFooter />
    </div>
  )
}

export default App
