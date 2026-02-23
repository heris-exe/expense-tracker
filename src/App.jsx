import Dashboard from './components/Dashboard'
import ExpenseCharts from './components/ExpenseCharts'
import ExpenseForm from './components/ExpenseForm'
import ExpenseLog from './components/ExpenseLog'
import { AppHeader, AppFooter } from './components/layout'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useExpenses } from './hooks/useExpenses'

function App() {
  const {
    expenses,
    editingExpense,
    isModalOpen,
    openForm,
    closeModal,
    handleAdd,
    handleEdit,
    handleDelete,
  } = useExpenses()

  return (
    <div className="min-h-screen w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <AppHeader />

      <main className="py-8">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Dashboard expenses={expenses} />
            <Button
              onClick={openForm}
              className="h-10 shrink-0 gap-2 sm:self-end"
            >
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          </div>
          <ExpenseCharts expenses={expenses} />
          <ExpenseLog
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="rounded-xl border-border shadow-md sm:max-w-[480px]">
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

      <AppFooter />
    </div>
  )
}

export default App
