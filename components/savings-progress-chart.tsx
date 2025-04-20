"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { Expense, Goal } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"

interface SavingsProgressChartProps {
  expenses: Expense[]
  goals: Goal[]
  income: number
  selectedMonth: string
  selectedYear: string
}

export function SavingsProgressChart({
  expenses,
  goals,
  income,
  selectedMonth,
  selectedYear,
}: SavingsProgressChartProps) {
  const chartData = useMemo(() => {
    // Get the number of days in the selected month
    const daysInMonth = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth), 0).getDate()

    // Create array with all days in month
    const data = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      return {
        day: day.toString(),
        savings: 0,
        expenses: 0,
        goal: 0,
      }
    })

    // Calculate daily income (assuming income is monthly)
    const dailyIncome = income / daysInMonth

    // Add cumulative income for each day
    let cumulativeIncome = 0
    data.forEach((item, index) => {
      cumulativeIncome += dailyIncome
      data[index].savings = cumulativeIncome
    })

    // Add expenses
    expenses.forEach((expense) => {
      const date = new Date(expense.date)
      if (
        date.getMonth() === Number.parseInt(selectedMonth) - 1 &&
        date.getFullYear() === Number.parseInt(selectedYear)
      ) {
        const day = date.getDate() - 1 // Array is 0-indexed

        // Add expense amount to this day
        data[day].expenses += expense.amount

        // Reduce savings for this and all future days
        for (let i = day; i < data.length; i++) {
          data[i].savings -= expense.amount
        }
      }
    })

    // Add goal target line if there's a goal for this month
    const monthlyGoals = goals.filter((goal) => {
      const deadline = new Date(goal.deadline)
      return (
        deadline.getMonth() === Number.parseInt(selectedMonth) - 1 &&
        deadline.getFullYear() === Number.parseInt(selectedYear)
      )
    })

    if (monthlyGoals.length > 0) {
      // Use the first goal for simplicity
      const goalAmount = monthlyGoals[0].targetAmount
      data.forEach((item, index) => {
        data[index].goal = goalAmount
      })
    }

    return data
  }, [expenses, goals, income, selectedMonth, selectedYear])

  if (chartData.every((item) => item.savings === 0 && item.expenses === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-center">
        <p className="text-slate-500 dark:text-slate-400">No data for this month</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
          <Legend />
          <Line type="monotone" dataKey="savings" name="Savings" stroke="#10b981" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" />
          {chartData.some((item) => item.goal > 0) && (
            <Line type="monotone" dataKey="goal" name="Goal Target" stroke="#8b5cf6" strokeDasharray="5 5" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
