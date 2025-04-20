"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Challenge } from "@/types/finance"
import { CreditCard, TrendingDown, Award, Briefcase, Home, Car, Smartphone } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DebtPayoffGameProps {
  challenge: Challenge
  onComplete: (id: string) => void
}

interface Debt {
  id: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
  icon: JSX.Element
}

interface Income {
  id: string
  name: string
  amount: number
  icon: JSX.Element
}

interface Expense {
  id: string
  name: string
  amount: number
  required: boolean
  icon: JSX.Element
}

export function DebtPayoffGame({ challenge, onComplete }: DebtPayoffGameProps) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "completed">("intro")
  const [month, setMonth] = useState(1)
  const [cash, setCash] = useState(1000)
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: "credit-card",
      name: "Credit Card",
      balance: 5000,
      interestRate: 0.18,
      minimumPayment: 150,
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: "car-loan",
      name: "Car Loan",
      balance: 8000,
      interestRate: 0.06,
      minimumPayment: 250,
      icon: <Car className="h-5 w-5" />,
    },
    {
      id: "student-loan",
      name: "Student Loan",
      balance: 12000,
      interestRate: 0.045,
      minimumPayment: 200,
      icon: <Home className="h-5 w-5" />,
    },
  ])

  const [incomes, setIncomes] = useState<Income[]>([
    {
      id: "salary",
      name: "Salary",
      amount: 3000,
      icon: <Briefcase className="h-5 w-5" />,
    },
  ])

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "rent",
      name: "Rent",
      amount: 1000,
      required: true,
      icon: <Home className="h-5 w-5" />,
    },
    {
      id: "groceries",
      name: "Groceries",
      amount: 400,
      required: true,
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      id: "entertainment",
      name: "Entertainment",
      amount: 200,
      required: false,
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      id: "dining",
      name: "Dining Out",
      amount: 300,
      required: false,
      icon: <Smartphone className="h-5 w-5" />,
    },
  ])

  const [selectedDebt, setSelectedDebt] = useState<string | null>(null)
  const [extraPayment, setExtraPayment] = useState(0)
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>(
    expenses.filter((e) => e.required).map((e) => e.id),
  )

  // Calculate total debt
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0)
  const initialDebt = 25000 // Sum of all initial debt balances
  const progress = Math.max(0, Math.min(100, ((initialDebt - totalDebt) / initialDebt) * 100))

  // Calculate monthly income
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

  // Calculate monthly expenses
  const totalExpenses = expenses
    .filter((expense) => selectedExpenses.includes(expense.id))
    .reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate minimum debt payments
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)

  // Calculate available cash for extra payments
  const availableCash = cash + totalIncome - totalExpenses - totalMinimumPayments

  // Start game
  const startGame = () => {
    setGameState("playing")
    setMonth(1)
    setCash(1000)
    setDebts([
      {
        id: "credit-card",
        name: "Credit Card",
        balance: 5000,
        interestRate: 0.18,
        minimumPayment: 150,
        icon: <CreditCard className="h-5 w-5" />,
      },
      {
        id: "car-loan",
        name: "Car Loan",
        balance: 8000,
        interestRate: 0.06,
        minimumPayment: 250,
        icon: <Car className="h-5 w-5" />,
      },
      {
        id: "student-loan",
        name: "Student Loan",
        balance: 12000,
        interestRate: 0.045,
        minimumPayment: 200,
        icon: <Home className="h-5 w-5" />,
      },
    ])
    setSelectedDebt("credit-card")
    setExtraPayment(0)
    setSelectedExpenses(expenses.filter((e) => e.required).map((e) => e.id))
  }

  // Toggle expense selection
  const toggleExpense = (id: string) => {
    const expense = expenses.find((e) => e.id === id)
    if (expense?.required) return // Can't toggle required expenses

    if (selectedExpenses.includes(id)) {
      setSelectedExpenses(selectedExpenses.filter((e) => e !== id))
    } else {
      setSelectedExpenses([...selectedExpenses, id])
    }
  }

  // Process month
  const processMonth = () => {
    // Apply minimum payments
    let newCash = cash + totalIncome - totalExpenses
    let newDebts = [...debts]

    // Apply minimum payments to all debts
    newDebts = newDebts.map((debt) => {
      const payment = Math.min(debt.minimumPayment, debt.balance)
      newCash -= payment

      return {
        ...debt,
        balance: Math.max(0, debt.balance - payment),
      }
    })

    // Apply extra payment to selected debt
    if (selectedDebt && extraPayment > 0) {
      newDebts = newDebts.map((debt) => {
        if (debt.id === selectedDebt) {
          const payment = Math.min(extraPayment, debt.balance)
          newCash -= payment

          return {
            ...debt,
            balance: Math.max(0, debt.balance - payment),
          }
        }
        return debt
      })
    }

    // Apply interest to remaining balances
    newDebts = newDebts.map((debt) => {
      const monthlyInterest = debt.balance * (debt.interestRate / 12)

      return {
        ...debt,
        balance: debt.balance + monthlyInterest,
      }
    })

    // Update state
    setCash(newCash)
    setDebts(newDebts)
    setMonth(month + 1)
    setExtraPayment(0)

    // Check if all debts are paid off
    if (newDebts.every((debt) => debt.balance <= 0)) {
      setGameState("completed")
      onComplete(challenge.id)
    }

    // Check if game over (no money left and can't pay minimum payments)
    if (newCash < 0) {
      alert("You've run out of money! Game over.")
      setGameState("intro")
    }

    // Check if reached month 24 without paying off debts
    if (month >= 24) {
      alert("You've reached the maximum number of months without paying off all debts. Try again!")
      setGameState("intro")
    }
  }

  return (
    <div className="w-full">
      {gameState === "intro" && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Debt Payoff Challenge</CardTitle>
            <CardDescription>Pay off all your debts within 24 months using smart financial strategies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <h3 className="font-medium mb-2">How to Play:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Manage your monthly budget to pay off debts</li>
                <li>Cut unnecessary expenses to free up cash</li>
                <li>Choose which debt to prioritize for extra payments</li>
                <li>Pay off all debts within 24 months to win</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingDown className="h-16 w-16 text-green-500" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startGame} className="w-full">
              Start Challenge
            </Button>
          </CardFooter>
        </Card>
      )}

      {gameState === "playing" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Month {month}</CardTitle>
                <CardDescription>Pay off your debts strategically</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Cash Available</div>
                <div className="text-xl font-bold">{formatCurrency(cash)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Debt Payoff Progress</span>
                <span className="font-medium">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Debts Section */}
              <div className="border rounded-md p-3">
                <h3 className="font-medium mb-2">Your Debts</h3>
                <div className="space-y-3">
                  {debts.map((debt) => (
                    <div
                      key={debt.id}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${
                        selectedDebt === debt.id
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      onClick={() => setSelectedDebt(debt.id)}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          {debt.icon}
                          <span className="ml-2 font-medium">{debt.name}</span>
                        </div>
                        <div className="font-mono">{formatCurrency(debt.balance)}</div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <div>Interest: {(debt.interestRate * 100).toFixed(1)}%</div>
                        <div>Min Payment: {formatCurrency(debt.minimumPayment)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extra Payment Section */}
                <div className="mt-4 border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">Extra Payment</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, availableCash)}
                      value={extraPayment}
                      onChange={(e) => setExtraPayment(Number(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-24 text-right font-mono">{formatCurrency(extraPayment)}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Available for extra payment: {formatCurrency(availableCash)}
                  </div>
                </div>
              </div>

              {/* Budget Section */}
              <div className="border rounded-md p-3">
                <h3 className="font-medium mb-2">Monthly Budget</h3>

                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1">Income</h4>
                  {incomes.map((income) => (
                    <div key={income.id} className="flex justify-between items-center p-2">
                      <div className="flex items-center">
                        {income.icon}
                        <span className="ml-2">{income.name}</span>
                      </div>
                      <div className="font-mono text-green-600">+{formatCurrency(income.amount)}</div>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium mt-1 border-t pt-1">
                    <span>Total Income</span>
                    <span className="text-green-600">+{formatCurrency(totalIncome)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Expenses</h4>
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className={`flex justify-between items-center p-2 rounded-md ${
                        !expense.required ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" : ""
                      } ${selectedExpenses.includes(expense.id) ? "" : "opacity-50"}`}
                      onClick={() => !expense.required && toggleExpense(expense.id)}
                    >
                      <div className="flex items-center">
                        {expense.icon}
                        <span className="ml-2">{expense.name}</span>
                        {expense.required && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <div className="font-mono text-red-600">-{formatCurrency(expense.amount)}</div>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium mt-1 border-t pt-1">
                    <span>Total Expenses</span>
                    <span className="text-red-600">-{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Monthly Cash Flow</span>
                    <span className={totalIncome - totalExpenses > 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(totalIncome - totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm">
              <span className="font-medium">Strategy Tip:</span> Pay off high-interest debt first
            </div>
            <Button onClick={processMonth}>Process Month →</Button>
          </CardFooter>
        </Card>
      )}

      {gameState === "completed" && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>Debt Free!</CardTitle>
            <CardDescription>You've successfully paid off all your debts in {month} months</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Congratulations! You've demonstrated excellent debt management skills.</p>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md">
              <p className="font-medium">You've earned {challenge.points} points for completing this challenge!</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setGameState("intro")} variant="outline">
              Play Again
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
