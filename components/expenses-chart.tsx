"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Expense } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"

interface ExpensesChartProps {
  expenses: Expense[]
}

export function ExpensesChart({ expenses }: ExpensesChartProps) {
  const chartData = useMemo(() => {
    // Group expenses by category
    const categoryTotals: Record<string, number> = {}

    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })

    // Convert to array format for chart
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }))
  }, [expenses])

  // Colors for the chart
  const COLORS = [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f97316", // orange-500
    "#10b981", // emerald-500
    "#06b6d4", // cyan-500
    "#6366f1", // indigo-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#84cc16", // lime-500
  ]

  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-center">
        <p className="text-slate-500 dark:text-slate-400">No expense data to display</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
