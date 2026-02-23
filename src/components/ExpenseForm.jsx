import { useState, useEffect } from 'react'
import { todayStr } from '../utils/helpers'
import { CATEGORIES, PAYMENT_METHODS } from '../constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** Form fields only; used inside Add/Edit expense modal. */
export default function ExpenseForm({ onSubmit, editingExpense, onCancel, onSuccess }) {
  const [date, setDate] = useState(todayStr())
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.date)
      setCategory(editingExpense.category)
      setDescription(editingExpense.description)
      setAmount(editingExpense.amount ?? '')
      setPaymentMethod(editingExpense.paymentMethod || 'Cash')
      setNotes(editingExpense.notes || '')
    } else {
      setDate(todayStr())
      setCategory('')
      setDescription('')
      setAmount('')
      setPaymentMethod('Cash')
      setNotes('')
    }
  }, [editingExpense])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!category?.trim()) return
    onSubmit({
      date,
      category,
      description: description.trim(),
      amount,
      paymentMethod,
      notes: notes.trim(),
    })
    onSuccess?.()
    if (!editingExpense) {
      setDate(todayStr())
      setCategory('')
      setDescription('')
      setAmount('')
      setNotes('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="modal-date">Date</Label>
          <Input
            type="date"
            id="modal-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modal-category">Category</Label>
          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger id="modal-category" className="w-full">
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="modal-description">Description</Label>
          <Input
            id="modal-description"
            placeholder="What was it for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modal-amount">Amount (₦)</Label>
          <Input
            type="number"
            id="modal-amount"
            min="0"
            step="0.01"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modal-payment">Payment method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger id="modal-payment" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="modal-notes">Notes (optional)</Label>
          <Input
            id="modal-notes"
            placeholder="Any extra notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Button type="submit">
          {editingExpense ? 'Save changes' : 'Add expense'}
        </Button>
        {editingExpense ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
