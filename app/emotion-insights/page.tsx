"use client"

import { useState } from "react"
import { Heart, Calendar, BarChart3, Lightbulb, Smile, Meh, Frown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { EmotionAnalytics } from "@/components/emotion-analytics"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatCurrency } from "@/lib/utils"

interface EmotionData {
  id: string
  expenseId: string
  mood: "happy" | "neutral" | "sad"
  moodScore: number
  amount: number
  category: string
  date: string
}

export default function EmotionInsightsPage() {
  const [emotionData] = useLocalStorage<EmotionData[]>("emotion-data", [])
  const [activeTab, setActiveTab] = useState("insights")

  // Calculate summary data
  const totalHappy = emotionData.filter((data) => data.mood === "happy").length
  const totalNeutral = emotionData.filter((data) => data.mood === "neutral").length
  const totalSad = emotionData.filter((data) => data.mood === "sad").length

  const happySpending = emotionData.filter((data) => data.mood === "happy").reduce((sum, data) => sum + data.amount, 0)

  const neutralSpending = emotionData
    .filter((data) => data.mood === "neutral")
    .reduce((sum, data) => sum + data.amount, 0)

  const sadSpending = emotionData.filter((data) => data.mood === "sad").reduce((sum, data) => sum + data.amount, 0)

  // Get wellness tips based on data
  const getWellnessTips = () => {
    if (emotionData.length === 0) return []

    const tips = []

    if (sadSpending > (happySpending + neutralSpending) / 2) {
      tips.push("Try the 24-hour rule: Wait a day before making non-essential purchases when feeling down.")
      tips.push("Create a list of free mood-boosting activities to try instead of shopping when sad.")
    }

    if (totalSad > totalHappy) {
      tips.push("Consider journaling about your emotions before making purchases.")
      tips.push("Practice mindful breathing for 2 minutes before checking out online.")
    }

    if (tips.length === 0) {
      tips.push("Continue tracking your emotions to receive personalized wellness tips.")
      tips.push("Great job being mindful of your emotional spending habits!")
    }

    return tips
  }

  const wellnessTips = getWellnessTips()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Heart className="h-7 w-7 text-pink-500" />
                Emotion Insights
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Understand the connection between your emotions and spending habits
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Happy Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Smile className="h-5 w-5 text-green-500 mr-2" />
                  <div className="text-2xl font-bold">{formatCurrency(happySpending)}</div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{totalHappy} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Neutral Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Meh className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="text-2xl font-bold">{formatCurrency(neutralSpending)}</div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{totalNeutral} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Sad Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Frown className="h-5 w-5 text-red-500 mr-2" />
                  <div className="text-2xl font-bold">{formatCurrency(sadSpending)}</div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{totalSad} transactions</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="insights" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="insights">
                <BarChart3 className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="wellness">
                <Lightbulb className="h-4 w-4 mr-2" />
                Wellness Tips
              </TabsTrigger>
              <TabsTrigger value="history">
                <Calendar className="h-4 w-4 mr-2" />
                Emotion History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="insights">
              <EmotionAnalytics />
            </TabsContent>

            <TabsContent value="wellness">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
                    Financial Wellness Tips
                  </CardTitle>
                  <CardDescription>Personalized suggestions based on your emotional spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  {wellnessTips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Lightbulb className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No tips available yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        Start tracking your emotions when spending to receive personalized wellness tips.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wellnessTips.map((tip, index) => (
                        <div key={index} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800">
                                <span className="font-bold text-amber-800 dark:text-amber-200">{index + 1}</span>
                              </div>
                            </div>
                            <p>{tip}</p>
                          </div>
                        </div>
                      ))}

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-6">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Heart className="h-4 w-4 text-pink-500 mr-2" />
                          Quick Mindfulness Exercise
                        </h3>
                        <p className="text-sm mb-4">
                          Before your next purchase, try this 30-second breathing exercise:
                        </p>
                        <ol className="list-decimal list-inside text-sm space-y-2">
                          <li>Take a deep breath in for 4 seconds</li>
                          <li>Hold for 4 seconds</li>
                          <li>Exhale slowly for 6 seconds</li>
                          <li>Ask yourself: "Do I really need this right now?"</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                    Emotion History
                  </CardTitle>
                  <CardDescription>Your recent spending emotions</CardDescription>
                </CardHeader>
                <CardContent>
                  {emotionData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No emotion history yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        Start tracking your emotions when spending to see your history here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {emotionData
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((data) => (
                          <div key={data.id} className="flex items-center p-3 border rounded-lg">
                            <div className="mr-3">
                              {data.mood === "happy" && <Smile className="h-8 w-8 text-green-500" />}
                              {data.mood === "neutral" && <Meh className="h-8 w-8 text-blue-500" />}
                              {data.mood === "sad" && <Frown className="h-8 w-8 text-red-500" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">{data.category}</span>
                                <span className="font-bold">{formatCurrency(data.amount)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>{new Date(data.date).toLocaleDateString()}</span>
                                <span>Feeling: {data.mood}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
