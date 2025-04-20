"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, ArrowRight, Calendar, DollarSign, PiggyBank, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatCurrency } from "@/lib/utils"
import { FinancialTimeTunnel } from "./time-tunnel"

interface FinancialData {
  currentSavings: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  investmentReturn: number
  inflationRate: number
  years: number
}

export default function TimeTravel() {
  const router = useRouter()
  const [income] = useLocalStorage<number>("income", 3000)
  const [expenses] = useLocalStorage<Expense[]>("expenses", [])

  // Calculate total monthly expenses
  const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Initial financial data
  const [financialData, setFinancialData] = useState<FinancialData>({
    currentSavings: 5000,
    monthlyIncome: income,
    monthlyExpenses: totalMonthlyExpenses,
    monthlySavings: income - totalMonthlyExpenses,
    investmentReturn: 7,
    inflationRate: 3,
    years: 5,
  })

  const [showSimulation, setShowSimulation] = useState(false)

  // Calculate future values
  const calculateFutureValues = () => {
    const { currentSavings, monthlySavings, investmentReturn, inflationRate, years } = financialData

    // Calculate future savings with compound interest
    const monthlyRate = investmentReturn / 100 / 12
    const months = years * 12

    // Future value of current savings
    const futureCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, months)

    // Future value of monthly contributions
    let futureContributions = 0
    for (let i = 0; i < months; i++) {
      futureContributions += monthlySavings * Math.pow(1 + monthlyRate, months - i)
    }

    const totalFutureSavings = futureCurrentSavings + futureContributions

    // Adjust for inflation
    const inflationAdjustedValue = totalFutureSavings / Math.pow(1 + inflationRate / 100, years)

    return {
      futureValue: totalFutureSavings,
      inflationAdjustedValue,
      monthlyContribution: monthlySavings,
      totalContributions: monthlySavings * months,
      interestEarned: totalFutureSavings - currentSavings - monthlySavings * months,
    }
  }

  const futureValues = calculateFutureValues()

  const handleStartSimulation = () => {
    setShowSimulation(true)
  }

  const handleBackToInputs = () => {
    setShowSimulation(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Clock className="h-7 w-7 text-blue-500" />
                Financial Time Travel
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                See your financial future based on your current habits and decisions
              </p>
            </div>
          </div>

          {!showSimulation ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Financial Details</CardTitle>
                <CardDescription>Enter your current financial information to see your projected future</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentSavings">Current Savings</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                              id="currentSavings"
                              type="number"
                              className="pl-8"
                              value={financialData.currentSavings}
                              onChange={(e) =>
                                setFinancialData({
                                  ...financialData,
                                  currentSavings: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="monthlyIncome">Monthly Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                              id="monthlyIncome"
                              type="number"
                              className="pl-8"
                              value={financialData.monthlyIncome}
                              onChange={(e) => {
                                const newIncome = Number.parseFloat(e.target.value) || 0
                                setFinancialData({
                                  ...financialData,
                                  monthlyIncome: newIncome,
                                  monthlySavings: newIncome - financialData.monthlyExpenses,
                                })
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                              id="monthlyExpenses"
                              type="number"
                              className="pl-8"
                              value={financialData.monthlyExpenses}
                              onChange={(e) => {
                                const newExpenses = Number.parseFloat(e.target.value) || 0
                                setFinancialData({
                                  ...financialData,
                                  monthlyExpenses: newExpenses,
                                  monthlySavings: financialData.monthlyIncome - newExpenses,
                                })
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="monthlySavings">Monthly Savings</Label>
                          <div className="relative">
                            <PiggyBank className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                              id="monthlySavings"
                              type="number"
                              className="pl-8"
                              value={financialData.monthlySavings}
                              onChange={(e) =>
                                setFinancialData({
                                  ...financialData,
                                  monthlySavings: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <p className="text-xs text-slate-500">
                            This is calculated as your income minus expenses, but you can adjust it manually.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Time Horizon (Years): {financialData.years}</Label>
                          <Slider
                            defaultValue={[financialData.years]}
                            min={1}
                            max={30}
                            step={1}
                            onValueChange={(value) =>
                              setFinancialData({
                                ...financialData,
                                years: value[0],
                              })
                            }
                          />
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Your Financial Summary</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Current Savings:</span>
                              <span className="font-medium">{formatCurrency(financialData.currentSavings)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly Income:</span>
                              <span className="font-medium">{formatCurrency(financialData.monthlyIncome)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly Expenses:</span>
                              <span className="font-medium">{formatCurrency(financialData.monthlyExpenses)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly Savings:</span>
                              <span className="font-medium">{formatCurrency(financialData.monthlySavings)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Investment Return: {financialData.investmentReturn}%</Label>
                          <Slider
                            defaultValue={[financialData.investmentReturn]}
                            min={0}
                            max={15}
                            step={0.5}
                            onValueChange={(value) =>
                              setFinancialData({
                                ...financialData,
                                investmentReturn: value[0],
                              })
                            }
                          />
                          <p className="text-xs text-slate-500">
                            Average annual return on your investments. Historically, the stock market has returned
                            around 7-10% annually.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Inflation Rate: {financialData.inflationRate}%</Label>
                          <Slider
                            defaultValue={[financialData.inflationRate]}
                            min={0}
                            max={10}
                            step={0.5}
                            onValueChange={(value) =>
                              setFinancialData({
                                ...financialData,
                                inflationRate: value[0],
                              })
                            }
                          />
                          <p className="text-xs text-slate-500">
                            Average annual inflation rate. Historically, inflation has averaged around 2-3% annually.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md h-fit">
                        <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                          Advanced Settings Impact
                        </h3>
                        <p className="text-sm mb-4">
                          These settings significantly impact your long-term financial projections:
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 mt-0.5 text-green-500" />
                            <span>
                              Higher investment returns compound over time, dramatically increasing your wealth.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 mt-0.5 text-blue-500" />
                            <span>Longer time horizons allow compound interest to work its magic.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 mt-0.5 text-red-500" />
                            <span>
                              Inflation erodes purchasing power over time, reducing the real value of your savings.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Back to Dashboard
                </Button>
                <Button onClick={handleStartSimulation}>
                  Start Time Travel <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-0 h-[500px] relative overflow-hidden rounded-lg">
                  <FinancialTimeTunnel financialData={financialData} futureValues={futureValues} />
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white">
                    <h3 className="text-lg font-bold mb-2">Your Financial Future in {financialData.years} Years</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-300">Future Value:</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(futureValues.futureValue)}</p>
                      </div>
                      <div>
                        <p className="text-slate-300">After Inflation:</p>
                        <p className="text-xl font-bold text-blue-400">
                          {formatCurrency(futureValues.inflationAdjustedValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Contributions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(futureValues.totalContributions)}</div>
                    <p className="text-sm text-slate-500 mt-1">Your total deposits over {financialData.years} years</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Interest Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(futureValues.interestEarned)}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      The power of compound interest at {financialData.investmentReturn}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Monthly Contribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(futureValues.monthlyContribution)}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Your consistent monthly savings</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Insights</CardTitle>
                  <CardDescription>What your financial future means in practical terms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">
                      The Power of Compound Interest
                    </h3>
                    <p className="text-sm">
                      Your investments will earn {formatCurrency(futureValues.interestEarned)} in interest alone -
                      that's {Math.round((futureValues.interestEarned / futureValues.totalContributions) * 100)}% of
                      what you contributed!
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Inflation Impact</h3>
                    <p className="text-sm">
                      Due to inflation at {financialData.inflationRate}%, your{" "}
                      {formatCurrency(futureValues.futureValue)} will have the purchasing power of{" "}
                      {formatCurrency(futureValues.inflationAdjustedValue)} in today's dollars.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                    <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Potential Improvements</h3>
                    <p className="text-sm mb-2">
                      If you could increase your monthly savings by just 10% (
                      {formatCurrency(futureValues.monthlyContribution * 0.1)}), you would have an additional{" "}
                      {formatCurrency(
                        futureValues.monthlyContribution *
                          0.1 *
                          12 *
                          financialData.years *
                          (1 + financialData.investmentReturn / 100),
                      )}{" "}
                      in {financialData.years} years!
                    </p>
                    <p className="text-sm">
                      Increasing your investment return by 1% would result in approximately{" "}
                      {formatCurrency(futureValues.futureValue * 0.2)} more in your final balance.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={handleBackToInputs} className="w-full">
                    Adjust Your Financial Details
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Type definition for Expense
interface Expense {
  id: string
  amount: number
  category: string
  date: string
  note: string
}
