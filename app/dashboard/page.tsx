"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpCircle, ArrowDownCircle, PlusCircle, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ExpenseForm } from "@/components/expense-form"
import { IncomeForm } from "@/components/income-form"
import { ExpensesChart } from "@/components/expenses-chart"
import { DashboardHeader } from "@/components/dashboard-header"
import { RecentExpenses } from "@/components/recent-expenses"
import { formatCurrency } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { ReceiptScanner } from "@/components/receipt-scanner"
import { VoiceInput } from "@/components/voice-input"
import { DailyExpensesChart } from "@/components/daily-expenses-chart"
import { MonthlyBreakdownChart } from "@/components/monthly-breakdown-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { BudgetProgressBar } from "@/components/budget-progress-bar"
import { ExpenseClassifier } from "@/components/expense-classifier"
import { AccountLinking } from "@/components/account-linking"
import type { Expense } from "@/types/finance"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const userId = user?.id || ""

  const [income, setIncome] = useLocalStorage<number>(`income_${userId}`, 0)
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`expenses_${userId}`, [])
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [balance, setBalance] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [showVoiceInput, setShowVoiceInput] = useState(false)

  // Calculate totals only when income or expenses change
  useEffect(() => {
    // Calculate total expenses
    const expenseTotal = expenses.reduce((total, expense) => total + expense.amount, 0)
    setTotalExpenses(expenseTotal)

    // Calculate balance
    setBalance(income - expenseTotal)
  }, [income, expenses])

  const handleAddIncome = (amount: number) => {
    setIncome(amount)
    setShowIncomeForm(false)
    toast({
      title: "Income updated",
      description: `Your income has been set to ${formatCurrency(amount)}`,
    })
  }

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

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />

        <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Welcome, {user?.fullName.split(" ")[0] || "User"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Track your finances and manage your budget</p>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                <Button variant="outline" onClick={() => setShowIncomeForm(true)}>
                  Update Income
                </Button>

                <Button onClick={() => setShowExpenseForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ArrowUpCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div className="text-2xl font-bold">{formatCurrency(income)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ArrowDownCircle className="h-5 w-5 text-red-500 mr-2" />
                    <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Wallet className={`h-5 w-5 ${balance >= 0 ? "text-blue-500" : "text-amber-500"} mr-2`} />
                    <div
                      className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}
                    >
                      {formatCurrency(balance)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="recent">Recent Expenses</TabsTrigger>
                <TabsTrigger value="accounts">Accounts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Expense Breakdown</CardTitle>
                      <CardDescription>Your spending by category</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <ExpensesChart expenses={expenses} />
                    </CardContent>
                  </Card>

                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Budget Status</CardTitle>
                      <CardDescription>Your current financial status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <BudgetProgressBar income={income} expenses={totalExpenses} />

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleNavigate("/expenses")}>
                              View All Expenses
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleNavigate("/goals")}>
                              Manage Goals
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <ExpenseClassifier expenses={expenses} income={income} />
              </TabsContent>

              <TabsContent value="charts" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Expenses</CardTitle>
                      <CardDescription>Your spending over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DailyExpensesChart expenses={expenses} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Breakdown</CardTitle>
                      <CardDescription>Expenses by category this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MonthlyBreakdownChart expenses={expenses} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Category Distribution</CardTitle>
                      <CardDescription>Percentage of spending by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CategoryPieChart expenses={expenses} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Budget vs Actual</CardTitle>
                      <CardDescription>How your spending compares to your budget</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BudgetProgressBar income={income} expenses={totalExpenses} showDetails />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recent">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                    <CardDescription>Your latest transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentExpenses
                      expenses={expenses}
                      onDelete={(id) => {
                        setExpenses(expenses.filter((expense) => expense.id !== id))
                        toast({
                          title: "Expense deleted",
                          description: "The expense has been removed from your records",
                        })
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accounts">
                <AccountLinking userId={userId} />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Forms */}
        <IncomeForm
          open={showIncomeForm}
          onOpenChange={setShowIncomeForm}
          currentIncome={income}
          onSubmit={handleAddIncome}
        />

        <ExpenseForm open={showExpenseForm} onOpenChange={setShowExpenseForm} onSubmit={handleAddExpense} />

        <ReceiptScanner
          open={showReceiptScanner}
          onOpenChange={setShowReceiptScanner}
          onScanComplete={handleAddExpense}
          userId={userId}
        />

        <VoiceInput open={showVoiceInput} onOpenChange={setShowVoiceInput} onExpenseDetected={handleAddExpense} />
      </div>
    </ProtectedRoute>
  )
}
