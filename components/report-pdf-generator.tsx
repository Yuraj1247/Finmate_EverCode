"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, QrCode } from "lucide-react"
import type { Expense, Goal } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"

interface ReportPdfGeneratorProps {
  expenses: Expense[]
  goals: Goal[]
  income: number
  selectedMonth: string
  selectedYear: string
}

export function ReportPdfGenerator({ expenses, goals, income, selectedMonth, selectedYear }: ReportPdfGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isQrVisible, setIsQrVisible] = useState(false)
  const [isPdfReady, setIsPdfReady] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  // Generate a unique ID for the report
  const generateReportId = () => {
    return `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  // Generate QR code for the report
  const generateQRCode = async () => {
    setIsGenerating(true)

    try {
      // In a real implementation, this would generate a QR code using a library
      // For now, we'll simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a unique report ID
      const reportId = generateReportId()

      // Create a URL for the report (in a real app, this would be a secure URL)
      const reportUrl = `https://finmate.app/reports/download/${reportId}`

      setQrCodeUrl(reportUrl)
      setIsQrVisible(true)
      setIsPdfReady(true)
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Simulate PDF download
  const downloadPdf = () => {
    alert(
      "In a production environment, this would download a PDF of your financial report. The PDF would contain all the charts and data shown in the report section below.",
    )
  }

  // Calculate summary data
  const calculateSummary = () => {
    // Filter expenses for selected month and year
    const filteredExpenses = expenses.filter((expense) => {
      const date = new Date(expense.date)
      return (
        date.getMonth() === Number.parseInt(selectedMonth) - 1 && date.getFullYear() === Number.parseInt(selectedYear)
      )
    })

    // Calculate total expenses
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Calculate savings (income - expenses)
    const totalSavings = Math.max(0, income - totalExpenses)

    // Calculate savings rate
    const savingsRate = income > 0 ? (totalSavings / income) * 100 : 0

    // Find top spending category
    const categoryTotals: Record<string, number> = {}
    filteredExpenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })

    let topCategory = ""
    let maxAmount = 0

    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount
        topCategory = category
      }
    })

    return {
      totalExpenses,
      totalSavings,
      topCategory: topCategory || "None",
      savingsRate,
      categoryTotals,
    }
  }

  const summary = calculateSummary()
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const monthName = monthNames[Number.parseInt(selectedMonth) - 1]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Financial Report</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {monthName} {selectedYear}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={generateQRCode} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </>
            )}
          </Button>

          <Button variant="default" disabled={!isPdfReady} onClick={downloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {isQrVisible && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <h3 className="text-lg font-medium mb-4">Scan to Download Report</h3>
            <div ref={qrCodeRef} className="bg-white p-4 rounded-lg mb-4">
              {/* This would be a real QR code in production */}
              <div className="w-[200px] h-[200px] bg-slate-100 flex items-center justify-center">
                <QrCode size={150} />
              </div>
            </div>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 max-w-md">
              Scan this QR code with your mobile device to download a PDF version of your financial report for{" "}
              {monthName} {selectedYear}.
            </p>
          </CardContent>
        </Card>
      )}

      <div ref={reportRef} className="space-y-6 p-4 bg-white rounded-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Financial Report</h2>
          <p className="text-slate-500">
            {monthName} {selectedYear}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Income</h3>
            <p className="text-2xl font-bold">{formatCurrency(income)}</p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Expenses</h3>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Savings</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalSavings)}</p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Savings Rate</h3>
            <p className="text-2xl font-bold">{summary.savingsRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-4">Top Spending Categories</h3>
          <div className="space-y-2">
            {Object.entries(summary.categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span>{category}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-4">Goals Progress</h3>
          <div className="space-y-4">
            {goals
              .filter((goal) => !goal.completed)
              .map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span>{goal.name}</span>
                    <span className="font-medium">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">Financial Health Assessment</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Savings Rate: </span>
              {summary.savingsRate < 10 ? (
                <span className="text-red-500">Needs Improvement</span>
              ) : summary.savingsRate < 20 ? (
                <span className="text-yellow-500">Fair</span>
              ) : (
                <span className="text-green-500">Good</span>
              )}
            </p>
            <p>
              <span className="font-medium">Budget Balance: </span>
              {summary.totalSavings <= 0 ? (
                <span className="text-red-500">Deficit</span>
              ) : (
                <span className="text-green-500">Surplus</span>
              )}
            </p>
            <p>
              <span className="font-medium">Top Expense Category: </span>
              <span>{summary.topCategory}</span>
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 mt-8">
          <p>Generated by FinMate Budget App</p>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
