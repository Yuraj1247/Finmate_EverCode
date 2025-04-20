"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Expense } from "@/types/finance"

interface CategoryPieChartProps {
  expenses: Expense[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#6B8E23", "#9370DB"]

export function CategoryPieChart({ expenses }: CategoryPieChartProps) {
  const chartData = useMemo(() => {
    // Group by category
    const categoryMap = new Map<string, number>()
    expenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentAmount + expense.amount)
    })

    // Convert to chart data
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
  }, [expenses])

  if (chartData.length === 0) {
    return <div className="text-center py-8 text-slate-500">No expense data available</div>
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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
