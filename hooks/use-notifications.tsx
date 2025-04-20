"use client"

import { useEffect, useRef, useMemo } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Expense, Goal } from "@/types/finance"
import { useToast } from "@/components/ui/use-toast"

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

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>("user-notifications", [])
  const [expenses] = useLocalStorage<Expense[]>("expenses", [])
  const [goals] = useLocalStorage<Goal[]>("goals", [])
  const [income] = useLocalStorage<number>("income", 0)
  const [emotionData] = useLocalStorage<any[]>("emotion-data", [])
  const { toast } = useToast()

  // Use a ref to track if initial notifications have been processed
  const initialNotificationsProcessed = useRef(false)

  // Generate a notification ID
  const generateId = () => crypto.randomUUID()

  // Get current date in ISO format
  const getCurrentDate = () => new Date().toISOString()

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Add a notification
  const addNotification = (notification: Omit<Notification, "id" | "read" | "date">) => {
    // Check if a similar notification already exists to prevent duplicates
    const existingSimilarNotification = notifications.find(
      (n) => n.title === notification.title && n.message === notification.message,
    )

    if (existingSimilarNotification) {
      return existingSimilarNotification
    }

    const newNotification: Notification = {
      id: generateId(),
      ...notification,
      read: false,
      date: getCurrentDate(),
    }

    setNotifications((prev) => {
      // Check if notification with same ID already exists
      if (prev.some((n) => n.id === newNotification.id)) {
        return prev
      }
      return [newNotification, ...prev]
    })

    // Show toast for new notifications
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === "error" ? "destructive" : "default",
    })

    return newNotification
  }

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  // Delete a notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([])
  }

  // Get unread count - use useMemo to prevent unnecessary recalculations
  const getUnreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length
  }, [notifications])

  // Notification generators
  const notificationService = useMemo(
    () => ({
      // Generate a notification for a new expense
      expenseAdded: (expense: Expense) => {
        return addNotification({
          title: "New Expense Added",
          message: `You've added a new expense of ${formatCurrency(expense.amount)} for ${expense.category}.`,
          type: "info",
          actionUrl: "/expenses",
          actionText: "View Expenses",
        })
      },

      // Generate a notification for a budget threshold
      budgetThreshold: (category: string, percentage: number) => {
        return addNotification({
          title: "Budget Alert",
          message: `You've spent ${percentage}% of your monthly budget for ${category}. Consider reducing expenses.`,
          type: "warning",
          actionUrl: "/expenses",
          actionText: "View Expenses",
        })
      },

      // Generate a notification for goal progress
      goalProgress: (goalName: string, percentage: number) => {
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

        return addNotification({
          title: "Goal Progress",
          message,
          type,
          actionUrl: "/goals",
          actionText: "View Goals",
        })
      },

      // Generate a notification for a goal deadline approaching
      goalDeadlineApproaching: (goalName: string, daysLeft: number) => {
        return addNotification({
          title: "Goal Deadline Approaching",
          message: `Your "${goalName}" goal deadline is in ${daysLeft} days.`,
          type: "warning",
          actionUrl: "/goals",
          actionText: "View Goal",
        })
      },

      // Generate a notification for a spending pattern
      spendingPattern: (category: string, trend: "increased" | "decreased") => {
        const message =
          trend === "increased"
            ? `Your spending on ${category} has increased compared to last month.`
            : `Great job! Your spending on ${category} has decreased compared to last month.`

        const type = trend === "increased" ? "warning" : "success"

        return addNotification({
          title: "Spending Pattern",
          message,
          type,
          actionUrl: "/reports",
          actionText: "View Reports",
        })
      },

      // Generate a notification for a saving tip
      savingTip: (tip: string) => {
        return addNotification({
          title: "Saving Tip",
          message: tip,
          type: "info",
        })
      },

      // Generate a notification for an emotional spending pattern
      emotionalSpending: (mood: string, category: string) => {
        return addNotification({
          title: "Emotional Spending Insight",
          message: `We've noticed you tend to spend on ${category} when feeling ${mood}. Being aware of this pattern can help you make more mindful decisions.`,
          type: "info",
          actionUrl: "/emotion-insights",
          actionText: "View Insights",
        })
      },

      // Generate a notification for missing income
      missingIncome: () => {
        return addNotification({
          title: "Income Not Set",
          message:
            "You haven't set your income yet. Setting your income helps track your savings rate and financial progress.",
          type: "warning",
          actionUrl: "/settings",
          actionText: "Set Income",
        })
      },
    }),
    [addNotification, formatCurrency],
  )

  // Check for conditions that should trigger notifications
  useEffect(() => {
    // Only run this effect once to prevent infinite loops
    if (initialNotificationsProcessed.current) {
      return
    }

    initialNotificationsProcessed.current = true

    // Check if income is missing
    if (income === 0) {
      notificationService.missingIncome()
    }

    // Check for goal deadlines approaching
    goals.forEach((goal) => {
      if (!goal.completed) {
        const deadline = new Date(goal.deadline)
        const today = new Date()
        const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysLeft <= 7 && daysLeft > 0) {
          notificationService.goalDeadlineApproaching(goal.name, daysLeft)
        }
      }
    })

    // Generate random saving tips occasionally
    const savingTips = [
      "Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
      "Consider meal prepping to reduce food expenses.",
      "Review your subscriptions and cancel ones you don't use regularly.",
      "Set up automatic transfers to your savings account on payday.",
      "Use the 24-hour rule for non-essential purchases to avoid impulse buying.",
      "Look for cashback and rewards programs for your regular spending.",
      "Consider refinancing high-interest debt to save on interest payments.",
      "Check if you qualify for tax deductions or credits you might be missing.",
      "Shop with a list to avoid impulse purchases at the grocery store.",
      "Use energy-saving settings on appliances to reduce utility bills.",
    ]

    // 10% chance to show a saving tip when the component mounts
    if (Math.random() < 0.1) {
      const randomTip = savingTips[Math.floor(Math.random() * savingTips.length)]
      notificationService.savingTip(randomTip)
    }
  }, [income, goals, notificationService])

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    getUnreadCount,
    notificationService,
  }
}
