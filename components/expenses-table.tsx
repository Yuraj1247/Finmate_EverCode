"use client"

import { useState } from "react"
import { Edit2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ExpenseForm } from "@/components/expense-form"
import { formatCurrency } from "@/lib/utils"
import type { Expense } from "@/types/finance"

interface ExpensesTableProps {
  expenses: Expense[]
  onDelete: (id: string) => void
  onEdit: (expense: Expense) => void
}

export function ExpensesTable({ expenses, onDelete, onEdit }: ExpensesTableProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setShowExpenseForm(true)
  }

  const handleSubmit = (updatedExpense: Expense) => {
    onEdit(updatedExpense)
    setShowExpenseForm(false)
    setEditingExpense(null)
  }

  return (
    <div>
      {expenses.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-slate-500 dark:text-slate-400">No expenses found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.note}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ExpenseForm
        open={showExpenseForm}
        onOpenChange={setShowExpenseForm}
        onSubmit={handleSubmit}
        expense={editingExpense}
      />
    </div>
  )
}
