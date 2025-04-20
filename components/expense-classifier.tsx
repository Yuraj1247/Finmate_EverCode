"use client"

import { useMemo } from "react"
import { AlertTriangle, TrendingDown, TrendingUp, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Expense } from "@/types/finance"
import type { JSX } from "react/jsx-runtime"

interface ExpenseClassifierProps {
  expenses: Expense[]
  income: number
}

export function ExpenseClassifier({ expenses, income }: ExpenseClassifierProps) {
  const analysis = useMemo(() => {
    // Group expenses by category
    const categoryMap = new Map<string, number>()
    expenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentAmount + expense.amount)
    })

    // Calculate percentages
    const categoryPercentages = new Map<string, number>()
    if (income > 0) {
      categoryMap.forEach((amount, category) => {
        categoryPercentages.set(category, (amount / income) * 100)
      })
    }

    // Generate insights
    const insights: {
      title: string
      description: string
      icon: JSX.Element
      variant: "default" | "warning" | "success" | "info"
    }[] = []

    // Check for high food spending
    const foodPercentage = categoryPercentages.get("Food") || 0
    if (foodPercentage > 30) {
      insights.push({
        title: "High Food Spending",
        description:
          "Your food expenses are over 30% of your income. Consider meal planning or cooking at home more often.",
        icon: <AlertTriangle className="h-4 w-4" />,
        variant: "warning",
      })
    }

    // Check for high entertainment spending
    const entertainmentPercentage = categoryPercentages.get("Entertainment") || 0
    if (entertainmentPercentage > 15) {
      insights.push({
        title: "Entertainment Budget",
        description:
          "Your entertainment expenses are over 15% of your income. Consider finding free or low-cost activities.",
        icon: <TrendingDown className="h-4 w-4" />,
        variant: "warning",
      })
    }

    // Check for low savings
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const savingsRate = income > 0 ? ((income - totalExpenses) / income) * 100 : 0
    if (savingsRate < 20 && income > 0) {
      insights.push({
        title: "Low Savings Rate",
        description:
          "You're saving less than 20% of your income. Try to increase your savings rate to build financial security.",
        icon: <TrendingDown className="h-4 w-4" />,
        variant: "warning",
      })
    } else if (savingsRate >= 20 && income > 0) {
      insights.push({
        title: "Good Savings Rate",
        description: "You're saving at least 20% of your income. Keep up the good work!",
        icon: <TrendingUp className="h-4 w-4" />,
        variant: "success",
      })
    }

    // Add a general tip if no specific insights
    if (insights.length === 0) {
      insights.push({
        title: "Financial Tip",
        description:
          "Consider using the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
        icon: <Info className="h-4 w-4" />,
        variant: "info",
      })
    }

    return insights
  }, [expenses, income])

  if (expenses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Based Expense Analysis</CardTitle>
        <CardDescription>Personalized insights based on your spending patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.map((insight, index) => (
          <Alert key={index} variant={insight.variant}>
            <div className="flex items-start">
              {insight.icon}
              <div className="ml-3">
                <AlertTitle>{insight.title}</AlertTitle>
                <AlertDescription>{insight.description}</AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}
