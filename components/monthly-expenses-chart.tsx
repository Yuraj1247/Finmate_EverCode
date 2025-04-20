"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Expense } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"

interface MonthlyExpensesChartProps {
  expenses: Expense[]
  selectedMonth: string
  selectedYear: string
}

export function MonthlyExpensesChart({ expenses, selectedMonth, selectedYear }: MonthlyExpensesChartProps) {
  const chartData = useMemo(() => {
    // Filter expenses for selected month and year
    const filteredExpenses = expenses.filter((expense) => {
      const date = new Date(expense.date)
      return (
        date.getMonth() === Number.parseInt(selectedMonth) - 1 && date.getFullYear() === Number.parseInt(selectedYear)
      )
    })

    // Group expenses by day
    const dailyExpenses: Record<number, number> = {}

    filteredExpenses.forEach((expense) => {
      const day = new Date(expense.date).getDate()
      dailyExpenses[day] = (dailyExpenses[day] || 0) + expense.amount
    })

    // Create array for chart with all days in month
    const daysInMonth = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth), 0).getDate()

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      return {
        day: day.toString(),
        amount: dailyExpenses[day] || 0,
      }
    })
  }, [expenses, selectedMonth, selectedYear])

  if (chartData.every((item) => item.amount === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-center">
        <p className="text-slate-500 dark:text-slate-400">No expense data for this month</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" label={{ value: "Day of Month", position: "insideBottom", offset: -5 }} />
          <YAxis
            tickFormatter={(value) => formatCurrency(value, false)}
            label={{ value: "Amount", angle: -90, position: "insideLeft" }}
          />
          <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Day ${label}`} />
          <Bar dataKey="amount" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
