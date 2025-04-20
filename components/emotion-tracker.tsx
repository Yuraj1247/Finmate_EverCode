"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Smile, Meh, Frown, X, AlertCircle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

interface EmotionTrackerProps {
  expenseId: string
  amount: number
  category: string
  date: string
  onClose: (mood?: string) => void
}

export function EmotionTracker({ expenseId, amount, category, date, onClose }: EmotionTrackerProps) {
  const [emotionData, setEmotionData] = useLocalStorage<EmotionData[]>("emotion-data", [])

  const handleMoodSelect = (mood: "happy" | "neutral" | "sad") => {
    const moodScore = mood === "happy" ? 2 : mood === "neutral" ? 1 : 0

    const newEmotionData: EmotionData = {
      id: crypto.randomUUID(),
      expenseId,
      mood,
      moodScore,
      amount,
      category,
      date,
    }

    setEmotionData([...emotionData, newEmotionData])
    onClose(mood)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="relative">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => onClose()}>
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>How were you feeling?</CardTitle>
          <CardDescription>
            Tell us how you felt during this {formatCurrency(amount)} expense on {category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              className="flex-1 flex-col h-auto py-6 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() => handleMoodSelect("happy")}
            >
              <Smile className="h-12 w-12 text-green-500 mb-2" />
              <span>Happy</span>
            </Button>

            <Button
              variant="outline"
              className="flex-1 flex-col h-auto py-6 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => handleMoodSelect("neutral")}
            >
              <Meh className="h-12 w-12 text-blue-500 mb-2" />
              <span>Neutral</span>
            </Button>

            <Button
              variant="outline"
              className="flex-1 flex-col h-auto py-6 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => handleMoodSelect("sad")}
            >
              <Frown className="h-12 w-12 text-red-500 mb-2" />
              <span>Sad</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-slate-500 dark:text-slate-400">
          <Heart className="h-4 w-4 mr-2 text-pink-500" />
          <span>Understanding your emotions helps improve your financial well-being</span>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export function EmotionAlert() {
  const [emotionData] = useLocalStorage<EmotionData[]>("emotion-data", [])
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [hasCheckedEmotions, setHasCheckedEmotions] = useState(false)

  useEffect(() => {
    // Only run this effect once to prevent infinite loops
    if (hasCheckedEmotions || emotionData.length === 0) {
      return
    }

    setHasCheckedEmotions(true)

    // Check for emotional spending patterns
    // Get data from the last 7 days
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const recentEmotions = emotionData.filter((data) => new Date(data.date) >= oneWeekAgo)

    // Count sad emotions
    const sadEmotions = recentEmotions.filter((data) => data.mood === "sad")

    if (sadEmotions.length >= 3) {
      // Find most common category for sad spending
      const categories: Record<string, number> = {}
      sadEmotions.forEach((data) => {
        categories[data.category] = (categories[data.category] || 0) + 1
      })

      let topCategory = ""
      let maxCount = 0

      Object.entries(categories).forEach(([category, count]) => {
        if (count > maxCount) {
          maxCount = count
          topCategory = category
        }
      })

      // Generate alert message
      const messages = [
        `We noticed you've been spending on ${topCategory} when feeling down. Consider taking a short walk instead.`,
        "Emotional spending is common. Try journaling your feelings before making a purchase.",
        "Shopping when sad? Take a 10-minute break to reflect before buying.",
        `You often shop for ${topCategory} when feeling sad. Maybe try a free activity you enjoy instead?`,
      ]

      setAlertMessage(messages[Math.floor(Math.random() * messages.length)])
      setShowAlert(true)
    }
  }, [emotionData, hasCheckedEmotions])

  if (!showAlert) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className="w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
            <CardTitle className="text-base">Emotional Spending Insight</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm">{alertMessage}</p>
        </CardContent>
        <CardFooter className="pt-0 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAlert(false)}>
            Dismiss
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAlert(false)}>
            Try Breathing
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
