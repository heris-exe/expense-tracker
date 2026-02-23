/**
 * Encapsulates expense list state, localStorage sync, and CRUD actions.
 * Keeps App.jsx focused on layout and composition.
 */

import { useState, useEffect, useRef } from 'react'
import { getExpenses, saveExpenses } from '../services/expenseStorage'
import seedExpenses from '../data/seedExpenses.json'

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [editingExpense, setEditingExpense] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const hasHydrated = useRef(false)

  useEffect(() => {
    const stored = getExpenses()
    setExpenses(stored.length > 0 ? stored : seedExpenses)
    hasHydrated.current = true
  }, [])

  useEffect(() => {
    if (!hasHydrated.current) return
    saveExpenses(expenses)
  }, [expenses])

  const closeModal = () => {
    setFormOpen(false)
    setEditingExpense(null)
  }

  const handleAdd = (payload) => {
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id ? { ...e, ...payload } : e
        )
      )
    } else {
      setExpenses((prev) => [...prev, { id: Date.now(), ...payload }])
    }
    closeModal()
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
  }

  const handleDelete = (id) => {
    if (typeof window !== 'undefined' && window.confirm('Delete this expense?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    }
  }

  return {
    expenses,
    editingExpense,
    formOpen,
    isModalOpen: formOpen || editingExpense !== null,
    openForm: () => setFormOpen(true),
    closeModal,
    handleAdd,
    handleEdit,
    handleDelete,
  }
}
