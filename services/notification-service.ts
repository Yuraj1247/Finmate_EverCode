import type { Expense } from "@/types/finance"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  date: string
  actionUrl?: string
  actionText?: string
}

// Function to generate a notification ID
const generateId = () => crypto.randomUUID()

// Function to get current date in ISO format
const getCurrentDate = () => new Date().toISOString()

// Notification generators
export const notificationService = {
  // Generate a notification for a new expense
  expenseAdded: (expense: Expense): Notification => {
    return {
      id: generateId(),
      title: "New Expense Added",
      message: `You've added a new expense of ${formatCurrency(expense.amount)} for ${expense.category}.`,
      type: "info",
      read: false,
      date: getCurrentDate(),
      actionUrl: "/expenses",
      actionText: "View Expenses",
    }
  },

  // Generate a notification for a budget threshold
  budgetThreshold: (category: string, percentage: number): Notification => {
    return {
      id: generateId(),
      title: "Budget Alert",
      message: `You've spent ${percentage}% of your monthly budget for ${category}. Consider reducing expenses.`,
      type: "warning",
      read: false,
      date: getCurrentDate(),
      actionUrl: "/expenses",
      actionText: "View Expenses",
    }
  },

  // Generate a notification for goal progress
  goalProgress: (goalName: string, percentage: number): Notification => {
    let type: "info" | "success" = "info"
    let message = `You're ${percentage}% of the way to your "${goalName}" goal.`

    if (percentage >= 100) {
      type = "success"
      message = `Congratulations! You've reached your "${goalName}" goal!`
    } else if (percentage >= 75) {
      message = `Almost there! You've reached ${percentage}% of your "${goalName}" goal.`
    } else if (percentage >= 50) {
      message = `Halfway there! You've reached ${percentage}% of your "${goalName}" goal.`
    } else if (percentage >= 25) {
      message = `Making progress! You've reached ${percentage}% of your "${goalName}" goal.`
    }

    return {
      id: generateId(),
      title: "Goal Progress",
      message,
      type,
      read: false,
      date: getCurrentDate(),
      actionUrl: "/goals",
      actionText: "View Goals",
    }
  },

  // Generate a notification for a goal deadline approaching
  goalDeadlineApproaching: (goalName: string, daysLeft: number): Notification => {
    return {
      id: generateId(),
      title: "Goal Deadline Approaching",
      message: `Your "${goalName}" goal deadline is in ${daysLeft} days.`,
      type: "warning",
      read: false,
      date: getCurrentDate(),
      actionUrl: "/goals",
      actionText: "View Goal",
    }
  },

  // Generate a notification for a new badge earned
  badgeEarned: (badgeName: string): Notification => {
    return {
      id: generateId(),
      title: "New Badge Earned",
      message: `Congratulations! You've earned the "${badgeName}" badge.`,
      type: "success",
      read: false,
      date: getCurrentDate(),
      actionUrl: "/challenges",
      actionText: "View Badges",
    }
  },

  // Generate a notification for a spending pattern
  spendingPattern: (category: string, trend: "increased" | "decreased"): Notification => {
    const message =
      trend === "increased"
        ? `Your spending on ${category} has increased compared to last month.`
        : `Great job! Your spending on ${category} has decreased compared to last month.`

    const type = trend === "increased" ? "warning" : "success"

    return {
      id: generateId(),
      title: "Spending Pattern",
      message,
      type,
      read: false,
      date: getCurrentDate(),
      actionUrl: "/reports",
      actionText: "View Reports",
    }
  },

  // Generate a notification for a saving tip
  savingTip: (tip: string): Notification => {
    return {
      id: generateId(),
      title: "Saving Tip",
      message: tip,
      type: "info",
      read: false,
      date: getCurrentDate(),
    }
  },

  // Generate a notification for an emotional spending pattern
  emotionalSpending: (mood: string, category: string): Notification => {
    return {
      id: generateId(),
      title: "Emotional Spending Insight",
      message: `We've noticed you tend to spend on ${category} when feeling ${mood}. Being aware of this pattern can help you make more mindful decisions.`,
      type: "info",
      read: false,
      date: getCurrentDate(),
      actionUrl: "/emotion-insights",
      actionText: "View Insights",
    }
  },
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
