"use client"

import { useMemo } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, subDays, isSameDay } from "date-fns"
import type { Expense } from "@/types/finance"

interface DailyExpensesChartProps {
  expenses: Expense[]
}

export function DailyExpensesChart({ expenses }: DailyExpensesChartProps) {
  const chartData = useMemo(() => {
    // Get the last 30 days
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      return {
        date,
        day: format(date, "MMM d"),
        amount: 0,
      }
    })

    // Sum expenses for each day
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date)
      const dayIndex = days.findIndex((day) => isSameDay(day.date, expenseDate))
      if (dayIndex !== -1) {
        days[dayIndex].amount += expense.amount
      }
    })

    return days.map((day) => ({
      day: day.day,
      amount: day.amount,
    }))
  }, [expenses])

  if (chartData.length === 0) {
    return <div className="text-center py-8 text-slate-500">No expense data available</div>
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} tickMargin={10} tickFormatter={(value) => value.split(" ")[1]} />
          <YAxis tick={{ fontSize: 12 }} tickMargin={10} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
            labelFormatter={(label) => `Day: ${label}`}
          />
          <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
