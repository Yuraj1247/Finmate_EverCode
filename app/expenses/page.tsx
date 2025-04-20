"use client"

import { useState } from "react"
import { PlusCircle, Search, ArrowUpDown, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ExpenseForm } from "@/components/expense-form"
import { ExpensesTable } from "@/components/expenses-table"
import { ExpensesChart } from "@/components/expenses-chart"
import { DashboardHeader } from "@/components/dashboard-header"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import type { Expense } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"

export default function ExpensesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const userId = user?.id || ""

  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`expenses_${userId}`, [])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  // Get unique categories from expenses
  const categories = Array.from(new Set(expenses.map((expense) => expense.category)))

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "amount-asc") return a.amount - b.amount
      if (sortBy === "amount-desc") return b.amount - a.amount
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime()
      return new Date(b.date).getTime() - new Date(a.date).getTime() // date-desc (default)
    })

  const handleAddExpense = (expense: Expense) => {
    const newExpense = {
      ...expense,
      userId,
    }
    const newExpenses = [...expenses, newExpense]
    setExpenses(newExpenses)
    setShowExpenseForm(false)
    toast({
      title: "Expense added",
      description: `${formatCurrency(expense.amount)} added to ${expense.category}`,
    })
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
    toast({
      title: "Expense deleted",
      description: "The expense has been removed from your records",
    })
  }

  const handleEditExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense)))
    toast({
      title: "Expense updated",
      description: "Your expense has been updated successfully",
    })
  }

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />

        <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Expense Tracker</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage and analyze your expenses</p>
              </div>

              <Button onClick={() => setShowExpenseForm(true)} className="mt-4 md:mt-0">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                      placeholder="Search expenses..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="amount-desc">Highest Amount</SelectItem>
                        <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total:</span>
                    <span className="font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Expense List</CardTitle>
                  <CardDescription>
                    {filteredExpenses.length} {filteredExpenses.length === 1 ? "expense" : "expenses"} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpensesTable
                    expenses={filteredExpenses}
                    onDelete={handleDeleteExpense}
                    onEdit={handleEditExpense}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Your spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpensesChart expenses={filteredExpenses} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Forms */}
        <ExpenseForm open={showExpenseForm} onOpenChange={setShowExpenseForm} onSubmit={handleAddExpense} />
      </div>
    </ProtectedRoute>
  )
}
