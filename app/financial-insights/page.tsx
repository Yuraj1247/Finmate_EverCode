"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  PieChart,
  DollarSign,
  Target,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Expense, Goal } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"

interface Insight {
  id: string
  title: string
  description: string
  type: "positive" | "negative" | "warning" | "tip"
  actionText?: string
  actionUrl?: string
}

export default function FinancialInsightsPage() {
  const router = useRouter()
  const [expenses] = useLocalStorage<Expense[]>("expenses", [])
  const [goals] = useLocalStorage<Goal[]>("goals", [])
  const [income] = useLocalStorage<number>("income", 0)
  const [insights, setInsights] = useState<Insight[]>([])
  const [financialScore, setFinancialScore] = useState(0)

  // Generate insights based on user data
  useEffect(() => {
    const newInsights: Insight[] = []
    let score = 50 // Start with a neutral score

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Calculate savings rate
    const savingsRate = income > 0 ? ((income - totalExpenses) / income) * 100 : 0

    // Get expense categories
    const categories = expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    // Sort categories by amount
    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({ category, amount }))

    // Check if income is set
    if (income === 0) {
      newInsights.push({
        id: "no-income",
        title: "Income Not Set",
        description: "Set your monthly income to get more accurate insights and recommendations.",
        type: "warning",
        actionText: "Set Income",
        actionUrl: "/dashboard",
      })
      score -= 10
    }

    // Check savings rate
    if (income > 0) {
      if (savingsRate < 0) {
        newInsights.push({
          id: "negative-savings",
          title: "Spending More Than You Earn",
          description:
            "Your expenses exceed your income. Consider reducing expenses or finding additional income sources.",
          type: "negative",
          actionText: "View Expenses",
          actionUrl: "/expenses",
        })
        score -= 20
      } else if (savingsRate < 10) {
        newInsights.push({
          id: "low-savings",
          title: "Low Savings Rate",
          description: "Your savings rate is below 10%. Aim to save at least 20% of your income.",
          type: "warning",
          actionText: "View Budget",
          actionUrl: "/dashboard",
        })
        score -= 10
      } else if (savingsRate >= 20) {
        newInsights.push({
          id: "good-savings",
          title: "Healthy Savings Rate",
          description: `You're saving ${savingsRate.toFixed(0)}% of your income. Great job!`,
          type: "positive",
        })
        score += 15
      }
    }

    // Check if there are any goals
    if (goals.length === 0) {
      newInsights.push({
        id: "no-goals",
        title: "No Savings Goals",
        description: "Setting specific savings goals can help you stay motivated and track your progress.",
        type: "tip",
        actionText: "Create a Goal",
        actionUrl: "/goals",
      })
    } else {
      // Check goal progress
      const completedGoals = goals.filter((goal) => goal.completed).length
      if (completedGoals > 0) {
        newInsights.push({
          id: "completed-goals",
          title: "Goals Achieved",
          description: `You've completed ${completedGoals} savings ${completedGoals === 1 ? "goal" : "goals"}. Keep up the good work!`,
          type: "positive",
        })
        score += 10
      }

      // Check for goals close to deadline
      const upcomingDeadlines = goals.filter((goal) => {
        if (goal.completed) return false
        const deadline = new Date(goal.deadline)
        const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return daysLeft > 0 && daysLeft <= 30
      })

      if (upcomingDeadlines.length > 0) {
        newInsights.push({
          id: "upcoming-deadlines",
          title: "Goal Deadlines Approaching",
          description: `You have ${upcomingDeadlines.length} goal${upcomingDeadlines.length === 1 ? "" : "s"} with deadlines in the next 30 days.`,
          type: "warning",
          actionText: "View Goals",
          actionUrl: "/goals",
        })
      }
    }

    // Check spending patterns
    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0]
      const topCategoryPercentage = (topCategory.amount / totalExpenses) * 100

      if (topCategoryPercentage > 40) {
        newInsights.push({
          id: "high-category-spending",
          title: `High ${topCategory.category} Spending`,
          description: `${topCategory.category} makes up ${topCategoryPercentage.toFixed(0)}% of your expenses. Consider if you can reduce this category.`,
          type: "warning",
          actionText: "View Breakdown",
          actionUrl: "/expenses",
        })
        score -= 5
      }
    }

    // Add general financial tips
    const tips = [
      {
        id: "emergency-fund",
        title: "Build an Emergency Fund",
        description: "Aim to save 3-6 months of expenses in an easily accessible account for emergencies.",
        type: "tip" as const,
      },
      {
        id: "automate-savings",
        title: "Automate Your Savings",
        description: "Set up automatic transfers to your savings account on payday to make saving effortless.",
        type: "tip" as const,
      },
      {
        id: "review-subscriptions",
        title: "Review Subscriptions",
        description: "Regularly review your subscriptions and cancel those you don't use frequently.",
        type: "tip" as const,
      },
    ]

    // Add a random tip if we have fewer than 5 insights
    if (newInsights.length < 5) {
      const randomTip = tips[Math.floor(Math.random() * tips.length)]
      if (!newInsights.some((insight) => insight.id === randomTip.id)) {
        newInsights.push(randomTip)
      }
    }

    // Cap score between 0 and 100
    const finalScore = Math.max(0, Math.min(100, score))

    setInsights(newInsights)
    setFinancialScore(finalScore)
  }, [expenses, goals, income])

  // Get icon based on insight type
  const getIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "tip":
        return <Lightbulb className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  // Get score color
  const getScoreColor = () => {
    if (financialScore >= 80) return "text-green-500"
    if (financialScore >= 60) return "text-blue-500"
    if (financialScore >= 40) return "text-amber-500"
    return "text-red-500"
  }

  // Get score description
  const getScoreDescription = () => {
    if (financialScore >= 80) return "Excellent"
    if (financialScore >= 60) return "Good"
    if (financialScore >= 40) return "Fair"
    return "Needs Improvement"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Financial Insights</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Personalized recommendations to improve your financial health
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Your Financial Health Score</CardTitle>
                <CardDescription>Based on your spending habits, savings, and goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>{financialScore}</div>
                  <div className="text-lg font-medium mb-4">{getScoreDescription()}</div>
                  <div className="w-full max-w-md">
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          financialScore >= 80
                            ? "bg-green-500"
                            : financialScore >= 60
                              ? "bg-blue-500"
                              : financialScore >= 40
                                ? "bg-amber-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${financialScore}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Needs Work</span>
                      <span>Fair</span>
                      <span>Good</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <span>Monthly Income</span>
                  </div>
                  <span className="font-medium">{formatCurrency(income)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <PieChart className="h-5 w-5 text-red-500 mr-2" />
                    <span>Total Expenses</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Active Goals</span>
                  </div>
                  <span className="font-medium">{goals.filter((goal) => !goal.completed).length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                    <span>Last Update</span>
                  </div>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personalized Insights</CardTitle>
              <CardDescription>Recommendations based on your financial data and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.length === 0 ? (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No insights yet</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Add more financial data to get personalized insights
                    </p>
                  </div>
                ) : (
                  insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg border ${
                        insight.type === "positive"
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : insight.type === "negative"
                            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                            : insight.type === "warning"
                              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getIcon(insight.type)}</div>
                        <div>
                          <h3 className="font-medium mb-1">{insight.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{insight.description}</p>

                          {insight.actionText && insight.actionUrl && (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-sm mt-2"
                              onClick={() => router.push(insight.actionUrl!)}
                            >
                              {insight.actionText} <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
                View Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
