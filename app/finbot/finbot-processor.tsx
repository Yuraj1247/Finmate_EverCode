"use client"

import { formatCurrency } from "@/lib/utils"

interface FinBotContext {
  income: number
  expenses: any[]
  goals: any[]
  username: string
  navigate: (path: string) => void
  contextMemory?: string
}

interface FinBotResponse {
  text: string
  type?: "text" | "chart" | "suggestion" | "action"
  chartData?: any
  actionType?: string
  path?: string
}

export async function processFinBotQuery(query: string, context: FinBotContext): Promise<FinBotResponse> {
  const normalizedQuery = query.toLowerCase().trim()

  // Use context memory to provide more relevant responses
  const hasContextMemory = context.contextMemory && context.contextMemory.length > 0

  // Check if the query is a follow-up question
  const isFollowUp =
    hasContextMemory &&
    (normalizedQuery.startsWith("what about") ||
      normalizedQuery.startsWith("how about") ||
      normalizedQuery.startsWith("and") ||
      normalizedQuery.startsWith("what else") ||
      normalizedQuery.startsWith("can you") ||
      normalizedQuery === "why" ||
      normalizedQuery === "how" ||
      normalizedQuery.length < 10)

  // Navigation commands
  if (
    normalizedQuery.includes("go to") ||
    normalizedQuery.includes("take me to") ||
    normalizedQuery.includes("navigate to") ||
    normalizedQuery.includes("show me") ||
    normalizedQuery.includes("open")
  ) {
    // Dashboard
    if (
      normalizedQuery.includes("dashboard") ||
      normalizedQuery.includes("home") ||
      normalizedQuery.includes("main page")
    ) {
      return {
        text: "I'll take you to the dashboard right away.",
        type: "action",
        actionType: "navigate",
        path: "/dashboard",
      }
    }

    // Expenses
    if (
      normalizedQuery.includes("expense") ||
      normalizedQuery.includes("spending") ||
      normalizedQuery.includes("transactions")
    ) {
      return {
        text: "Navigating to the expenses page where you can view and manage your transactions.",
        type: "action",
        actionType: "navigate",
        path: "/expenses",
      }
    }

    // Goals
    if (normalizedQuery.includes("goal") || normalizedQuery.includes("saving") || normalizedQuery.includes("target")) {
      return {
        text: "Taking you to your savings goals page.",
        type: "action",
        actionType: "navigate",
        path: "/goals",
      }
    }

    // Challenges
    if (
      normalizedQuery.includes("challenge") ||
      normalizedQuery.includes("game") ||
      normalizedQuery.includes("achievement")
    ) {
      return {
        text: "Let's check out your financial challenges and games.",
        type: "action",
        actionType: "navigate",
        path: "/challenges",
      }
    }

    // Reports
    if (
      normalizedQuery.includes("report") ||
      normalizedQuery.includes("analytics") ||
      normalizedQuery.includes("analysis")
    ) {
      return {
        text: "Here are your financial reports and analytics.",
        type: "action",
        actionType: "navigate",
        path: "/reports",
      }
    }

    // Insights
    if (
      normalizedQuery.includes("insight") ||
      normalizedQuery.includes("advice") ||
      normalizedQuery.includes("recommendation")
    ) {
      return {
        text: "Let me show you your personalized financial insights.",
        type: "action",
        actionType: "navigate",
        path: "/financial-insights",
      }
    }

    // Time Travel
    if (
      normalizedQuery.includes("time travel") ||
      normalizedQuery.includes("future") ||
      normalizedQuery.includes("projection")
    ) {
      return {
        text: "Let's explore your financial future with the Time Travel simulator.",
        type: "action",
        actionType: "navigate",
        path: "/time-travel",
      }
    }

    // Wishes
    if (normalizedQuery.includes("wish") || normalizedQuery.includes("dream") || normalizedQuery.includes("jar")) {
      return {
        text: "Taking you to the Wish Jar where you can visualize your financial dreams.",
        type: "action",
        actionType: "navigate",
        path: "/wishes",
      }
    }
  }

  // Financial data queries
  if (
    normalizedQuery.includes("how much") ||
    normalizedQuery.includes("what is my") ||
    normalizedQuery.includes("show my") ||
    normalizedQuery.includes("tell me about my") ||
    isFollowUp
  ) {
    // Income
    if (normalizedQuery.includes("income") || normalizedQuery.includes("earn") || normalizedQuery.includes("salary")) {
      return {
        text: `Your current monthly income is ${formatCurrency(context.income)}.`,
        type: "text",
      }
    }

    // Expenses
    if (normalizedQuery.includes("expense") || normalizedQuery.includes("spend") || normalizedQuery.includes("cost")) {
      const totalExpenses = context.expenses.reduce((sum, expense) => sum + expense.amount, 0)

      // Check if query is about specific time period
      const isThisMonth = normalizedQuery.includes("this month") || normalizedQuery.includes("current month")

      if (isThisMonth) {
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        const thisMonthExpenses = context.expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
        })

        const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

        // Group by category for chart
        const categoryTotals: Record<string, number> = {}
        thisMonthExpenses.forEach((expense) => {
          categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
        })

        const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))

        return {
          text: `Your expenses for this month total ${formatCurrency(thisMonthTotal)}. Here's a breakdown by category:`,
          type: "chart",
          chartData: {
            type: "pie",
            data: chartData,
          },
        }
      }

      return {
        text: `Your total expenses are ${formatCurrency(totalExpenses)}.`,
        type: "text",
      }
    }

    // Savings
    if (normalizedQuery.includes("saving") || normalizedQuery.includes("saved") || normalizedQuery.includes("save")) {
      const totalExpenses = context.expenses.reduce((sum, expense) => sum + expense.amount, 0)
      const savings = context.income - totalExpenses
      const savingsRate = context.income > 0 ? (savings / context.income) * 100 : 0

      return {
        text: `You're currently saving ${formatCurrency(savings)} per month, which is a savings rate of ${savingsRate.toFixed(1)}% of your income.`,
        type: "text",
      }
    }

    // Goals
    if (normalizedQuery.includes("goal") || normalizedQuery.includes("target")) {
      const activeGoals = context.goals.filter((goal) => !goal.completed)
      const completedGoals = context.goals.filter((goal) => goal.completed)

      if (activeGoals.length === 0 && completedGoals.length === 0) {
        return {
          text: "You don't have any savings goals set up yet. Would you like me to help you create one?",
          type: "text",
        }
      }

      const goalData = activeGoals.map((goal) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100
        return {
          name: goal.name,
          value: progress,
        }
      })

      return {
        text: `You have ${activeGoals.length} active savings goals and ${completedGoals.length} completed goals. Here's your progress on active goals:`,
        type: "chart",
        chartData: {
          type: "bar",
          data: goalData,
          config: {
            yKey: "value",
          },
        },
      }
    }

    // Financial health
    if (
      normalizedQuery.includes("financial health") ||
      normalizedQuery.includes("how am i doing") ||
      normalizedQuery.includes("financial status") ||
      normalizedQuery.includes("financial situation")
    ) {
      const totalExpenses = context.expenses.reduce((sum, expense) => sum + expense.amount, 0)
      const savings = context.income - totalExpenses
      const savingsRate = context.income > 0 ? (savings / context.income) * 100 : 0

      let healthStatus = "good"
      let advice = ""

      if (savingsRate < 0) {
        healthStatus = "critical"
        advice = "You're spending more than you earn. Consider reducing expenses or finding additional income sources."
      } else if (savingsRate < 10) {
        healthStatus = "concerning"
        advice = "Your savings rate is below 10%. Financial experts recommend saving at least 20% of your income."
      } else if (savingsRate < 20) {
        healthStatus = "fair"
        advice = "You're saving, but aim for at least 20% of your income for long-term financial security."
      } else {
        advice = "You're saving more than 20% of your income, which is excellent for long-term financial health."
      }

      // Create chart data for income vs expenses
      const chartData = [
        { name: "Income", value: context.income },
        { name: "Expenses", value: totalExpenses },
        { name: "Savings", value: savings },
      ]

      return {
        text: `Your financial health is ${healthStatus}. ${advice}\n\nYour monthly income is ${formatCurrency(context.income)}, expenses total ${formatCurrency(totalExpenses)}, and you're saving ${formatCurrency(savings)} (${savingsRate.toFixed(1)}% of income).`,
        type: "chart",
        chartData: {
          type: "bar",
          data: chartData,
        },
      }
    }
  }

  // Financial education queries
  if (
    normalizedQuery.includes("what is") ||
    normalizedQuery.includes("how does") ||
    normalizedQuery.includes("explain") ||
    normalizedQuery.includes("tell me about")
  ) {
    // Emergency fund
    if (normalizedQuery.includes("emergency fund")) {
      return {
        text: "An emergency fund is money set aside specifically for unexpected expenses or financial emergencies, like medical bills, car repairs, or job loss.\n\nFinancial experts typically recommend having 3-6 months of essential expenses saved in an easily accessible account.\n\nHaving an emergency fund helps you avoid going into debt when unexpected expenses arise and provides financial security and peace of mind.",
        type: "text",
      }
    }

    // Compound interest
    if (normalizedQuery.includes("compound interest")) {
      return {
        text: "Compound interest is when you earn interest on both your initial investment and on the interest you've already earned. It's often described as 'interest on interest.'\n\nFor example, if you invest $1,000 with a 5% annual interest rate:\n- Year 1: $1,000 × 5% = $50 interest (Total: $1,050)\n- Year 2: $1,050 × 5% = $52.50 interest (Total: $1,102.50)\n\nOver time, compound interest can significantly grow your investments. The effect is more powerful the longer your money is invested, which is why starting to save early is so important.",
        type: "text",
      }
    }

    // Budgeting
    if (normalizedQuery.includes("budget") || normalizedQuery.includes("budgeting")) {
      return {
        text: "Budgeting is the process of creating a plan for how to spend and save your money. It helps you track your income and expenses, prioritize your financial goals, and make informed spending decisions.\n\nTo create a budget:\n1. Track your income and expenses\n2. Categorize your spending\n3. Set financial goals\n4. Allocate your income to different categories\n5. Adjust as needed and stick to your plan\n\nA popular budgeting method is the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
        type: "text",
      }
    }

    // 50/30/20 rule
    if (normalizedQuery.includes("50/30/20")) {
      return {
        text: "The 50/30/20 rule is a simple budgeting method that divides your after-tax income into three categories:\n\n- 50% for needs: Essential expenses like rent/mortgage, utilities, groceries, transportation, and minimum debt payments.\n\n- 30% for wants: Non-essential expenses that improve your quality of life, like dining out, entertainment, hobbies, and subscriptions.\n\n- 20% for savings and debt repayment: Building emergency funds, saving for retirement, and paying off debt beyond minimum payments.\n\nThis rule provides a balanced approach to managing your money while ensuring you're saving for the future.",
        type: "text",
      }
    }

    // Debt snowball vs. avalanche
    if (
      (normalizedQuery.includes("debt") && normalizedQuery.includes("snowball")) ||
      (normalizedQuery.includes("debt") && normalizedQuery.includes("avalanche"))
    ) {
      return {
        text: "Debt Snowball and Debt Avalanche are two popular strategies for paying off multiple debts:\n\nDebt Snowball:\n- Pay minimum payments on all debts\n- Put extra money toward the smallest debt first\n- After paying off the smallest debt, roll that payment into the next smallest\n- Provides psychological wins and motivation as debts are eliminated quickly\n\nDebt Avalanche:\n- Pay minimum payments on all debts\n- Put extra money toward the debt with the highest interest rate\n- After paying off the highest-rate debt, move to the next highest\n- Mathematically saves more money in interest over time\n\nThe best method depends on your personality - Snowball works better if you need motivation, while Avalanche saves more money.",
        type: "text",
      }
    }
  }

  // Theme-related commands
  if (
    normalizedQuery.includes("theme") ||
    normalizedQuery.includes("mode") ||
    normalizedQuery.includes("dark") ||
    normalizedQuery.includes("light") ||
    normalizedQuery.includes("bright") ||
    normalizedQuery.includes("night")
  ) {
    // Check if it's a theme switching command
    const isDarkThemeRequest =
      normalizedQuery.includes("dark mode") ||
      normalizedQuery.includes("night mode") ||
      (normalizedQuery.includes("switch to") && normalizedQuery.includes("dark")) ||
      (normalizedQuery.includes("change to") && normalizedQuery.includes("dark")) ||
      (normalizedQuery.includes("enable") && normalizedQuery.includes("dark")) ||
      (normalizedQuery.includes("turn on") && normalizedQuery.includes("dark"))

    const isLightThemeRequest =
      normalizedQuery.includes("light mode") ||
      normalizedQuery.includes("day mode") ||
      normalizedQuery.includes("bright mode") ||
      (normalizedQuery.includes("switch to") && normalizedQuery.includes("light")) ||
      (normalizedQuery.includes("change to") && normalizedQuery.includes("light")) ||
      (normalizedQuery.includes("enable") && normalizedQuery.includes("light")) ||
      (normalizedQuery.includes("turn on") && normalizedQuery.includes("light")) ||
      (normalizedQuery.includes("turn off") && normalizedQuery.includes("dark"))

    // Toggle theme command
    if (
      normalizedQuery.includes("toggle theme") ||
      normalizedQuery.includes("switch theme") ||
      normalizedQuery.includes("change theme")
    ) {
      const currentTheme = localStorage.getItem("theme") || "dark"
      const newTheme = currentTheme === "dark" ? "light" : "dark"

      // Update theme in localStorage
      localStorage.setItem("theme", newTheme)

      // Toggle dark class on document
      document.documentElement.classList.toggle("dark", newTheme === "dark")

      return {
        text: `I've toggled the theme to ${newTheme} mode for you. ${newTheme === "light" ? "Hope it brightens your day! ☀️" : "Easier on the eyes at night! 🌙"}`,
        type: "action",
        actionType: "theme",
        path: newTheme,
      }
    }
  }

  // Fallback response for unknown queries
  return {
    text: "I'm still under development and learning new things every day. Is there something specific about your finances that I can help you with?",
    type: "text",
  }
}
