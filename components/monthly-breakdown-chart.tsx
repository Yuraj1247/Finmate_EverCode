"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { startOfMonth, endOfMonth } from "date-fns"
import type { Expense } from "@/types/finance"

interface MonthlyBreakdownChartProps {
  expenses: Expense[]
}

export function MonthlyBreakdownChart({ expenses }: MonthlyBreakdownChartProps) {
  const chartData = useMemo(() => {
    // Filter expenses for the current month
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const thisMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= monthStart && expenseDate <= monthEnd
    })

    // Group by category
    const categoryMap = new Map<string, number>()
    thisMonthExpenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentAmount + expense.amount)
    })

    // Convert to chart data
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }))
  }, [expenses])

  if (chartData.length === 0) {
    return <div className="text-center py-8 text-slate-500">No expense data available for this month</div>
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} tickMargin={10} />
          <YAxis tick={{ fontSize: 12 }} tickMargin={10} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
            labelFormatter={(label) => `Category: ${label}`}
          />
          <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
