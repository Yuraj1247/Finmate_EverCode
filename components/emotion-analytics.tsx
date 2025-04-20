"use client"

import { useState, useEffect } from "react"
import { Calendar, PieChart, TrendingUp, Heart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface EmotionData {
  id: string
  expenseId: string
  mood: "happy" | "neutral" | "sad"
  moodScore: number
  amount: number
  category: string
  date: string
}

export function EmotionAnalytics() {
  const [emotionData] = useLocalStorage<EmotionData[]>("emotion-data", [])
  const [moodByCategory, setMoodByCategory] = useState<any[]>([])
  const [moodOverTime, setMoodOverTime] = useState<any[]>([])
  const [spendingByMood, setSpendingByMood] = useState<any[]>([])

  useEffect(() => {
    if (emotionData.length > 0) {
      // Process data for charts
      processChartData()
    }
  }, [emotionData])

  const processChartData = () => {
    // Mood by category
    const categoryMoods: Record<string, { happy: number; neutral: number; sad: number }> = {}

    emotionData.forEach((data) => {
      if (!categoryMoods[data.category]) {
        categoryMoods[data.category] = { happy: 0, neutral: 0, sad: 0 }
      }
      categoryMoods[data.category][data.mood]++
    })

    const categoryData = Object.entries(categoryMoods).map(([category, moods]) => ({
      category,
      happy: moods.happy,
      neutral: moods.neutral,
      sad: moods.sad,
    }))

    setMoodByCategory(categoryData)

    // Mood over time
    const timeData: Record<string, { date: string; happy: number; neutral: number; sad: number }> = {}

    emotionData.forEach((data) => {
      const date = new Date(data.date).toLocaleDateString()

      if (!timeData[date]) {
        timeData[date] = { date, happy: 0, neutral: 0, sad: 0 }
      }

      timeData[date][data.mood]++
    })

    const sortedTimeData = Object.values(timeData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    setMoodOverTime(sortedTimeData)

    // Spending by mood
    const moodSpending: Record<string, number> = {
      happy: 0,
      neutral: 0,
      sad: 0,
    }

    emotionData.forEach((data) => {
      moodSpending[data.mood] += data.amount
    })

    const spendingData = [
      { name: "Happy", value: moodSpending.happy, color: "#22c55e" },
      { name: "Neutral", value: moodSpending.neutral, color: "#3b82f6" },
      { name: "Sad", value: moodSpending.sad, color: "#ef4444" },
    ]

    setSpendingByMood(spendingData)
  }

  // Get motivational quote based on data
  const getMotivationalQuote = () => {
    if (emotionData.length === 0) return "Track your emotions to gain insights about your spending habits."

    const sadCount = emotionData.filter((data) => data.mood === "sad").length
    const happyCount = emotionData.filter((data) => data.mood === "happy").length

    if (sadCount > happyCount) {
      return "Remember, happiness isn't found in spending, but in the experiences and connections we create."
    } else if (happyCount > sadCount) {
      return "Great job! You're mostly spending when you're happy, which often leads to more mindful purchases."
    } else {
      return "Being aware of your emotions while spending is the first step toward financial mindfulness."
    }
  }

  if (emotionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 text-pink-500 mr-2" />
            Emotion Analytics
          </CardTitle>
          <CardDescription>Track how your emotions affect your spending habits</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Heart className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">No emotion data yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            Start tracking your emotions when spending to gain valuable insights about your financial habits.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 text-pink-500 mr-2" />
          Emotion Analytics
        </CardTitle>
        <CardDescription>Understand how your emotions affect your spending habits</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories">
              <PieChart className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm italic">"{getMotivationalQuote()}"</p>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={spendingByMood}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {spendingByMood.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {spendingByMood.map((entry) => (
                  <Card key={entry.name} className="bg-slate-50 dark:bg-slate-800">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{entry.name} Spending</span>
                        <span className="text-lg font-bold">{formatCurrency(entry.value)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="happy" name="Happy" fill="#22c55e" />
                  <Bar dataKey="neutral" name="Neutral" fill="#3b82f6" />
                  <Bar dataKey="sad" name="Sad" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="happy" name="Happy" stroke="#22c55e" />
                  <Line type="monotone" dataKey="neutral" name="Neutral" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="sad" name="Sad" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
