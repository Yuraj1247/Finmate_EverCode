"use client"

import { Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { Expense } from "@/types/finance"

interface RecentExpensesProps {
  expenses: Expense[]
  onDelete: (id: string) => void
  limit?: number
}

export function RecentExpenses({ expenses, onDelete, limit = 5 }: RecentExpensesProps) {
  // Sort expenses by date (newest first) and limit the number
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)

  return (
    <div>
      {recentExpenses.length === 0 ? (
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
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.note}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
