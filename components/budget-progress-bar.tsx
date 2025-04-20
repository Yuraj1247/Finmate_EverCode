"use client"

import { useMemo } from "react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BudgetProgressBarProps {
  income: number
  expenses: number
  showDetails?: boolean
}

export function BudgetProgressBar({ income, expenses, showDetails = false }: BudgetProgressBarProps) {
  const percentage = useMemo(() => {
    if (income === 0) return 0
    return Math.min((expenses / income) * 100, 100)
  }, [income, expenses])

  const status = useMemo(() => {
    if (percentage >= 100) {
      return {
        color: "bg-red-500",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        title: "Over Budget",
        description: "You've exceeded your monthly budget.",
      }
    } else if (percentage >= 80) {
      return {
        color: "bg-amber-500",
        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        title: "Approaching Limit",
        description: "You're getting close to your monthly budget.",
      }
    } else if (percentage >= 50) {
      return {
        color: "bg-blue-500",
        icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
        title: "On Track",
        description: "You're managing your budget well.",
      }
    } else {
      return {
        color: "bg-green-500",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        title: "Excellent",
        description: "You're well under your monthly budget.",
      }
    }
  }, [percentage])

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Income Used</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{income > 0 ? Math.round(percentage) : 0}%</div>
        </div>
        <Progress value={percentage} className="h-2" indicatorClassName={status.color} />
      </div>

      {showDetails && (
        <>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <div className="text-sm text-slate-500 dark:text-slate-400">Income</div>
              <div className="font-medium">{formatCurrency(income)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 dark:text-slate-400">Expenses</div>
              <div className="font-medium">{formatCurrency(expenses)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 dark:text-slate-400">Remaining</div>
              <div className="font-medium">{formatCurrency(Math.max(income - expenses, 0))}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 dark:text-slate-400">Savings Rate</div>
              <div className="font-medium">{income > 0 ? Math.round(((income - expenses) / income) * 100) : 0}%</div>
            </div>
          </div>

          <Alert>
            <div className="flex items-start">
              {status.icon}
              <div className="ml-3">
                <AlertTitle>{status.title}</AlertTitle>
                <AlertDescription>{status.description}</AlertDescription>
              </div>
            </div>
          </Alert>
        </>
      )}
    </div>
  )
}
