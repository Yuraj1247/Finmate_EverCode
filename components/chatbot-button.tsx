"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Mic, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatCurrency } from "@/lib/utils"
import type { Expense } from "@/types/finance"

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
    { text: "Hi there! I'm your FinMate assistant. How can I help you today?", sender: "bot" },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const userId = user?.id || ""
  const [expenses] = useLocalStorage<Expense[]>(`expenses_${userId}`, [])
  const [income] = useLocalStorage<number>(`income_${userId}`, 0)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)

        // Auto-submit after a short delay
        setTimeout(() => {
          if (transcript.trim()) {
            handleSendMessage(transcript)
          }
        }, 300)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.abort()
      setIsListening(false)
    } else if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Speak text
  const speakText = (text: string) => {
    if (!voiceEnabled) return

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Process user query
  const processQuery = (query: string) => {
    // Simple rule-based chatbot for financial questions
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("spent") || lowerQuery.includes("spending") || lowerQuery.includes("expenses")) {
      if (lowerQuery.includes("food") || lowerQuery.includes("groceries") || lowerQuery.includes("restaurant")) {
        const foodExpenses = expenses
          .filter((e) => e.category.toLowerCase() === "food")
          .reduce((sum, e) => sum + e.amount, 0)
        return `You've spent ${formatCurrency(foodExpenses)} on food.`
      } else if (lowerQuery.includes("total")) {
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
        return `Your total expenses are ${formatCurrency(totalExpenses)}.`
      } else {
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
        return `You've spent ${formatCurrency(totalExpenses)} in total. Would you like to see a breakdown by category?`
      }
    } else if (lowerQuery.includes("income") || lowerQuery.includes("earn") || lowerQuery.includes("salary")) {
      return `Your current income is set to ${formatCurrency(income)}.`
    } else if (lowerQuery.includes("balance") || lowerQuery.includes("left") || lowerQuery.includes("remaining")) {
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      const balance = income - totalExpenses
      return `Your current balance is ${formatCurrency(balance)}.`
    } else if (lowerQuery.includes("budget") || lowerQuery.includes("tip") || lowerQuery.includes("advice")) {
      return "I recommend using the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment."
    } else {
      return "I'm not sure how to answer that. Try asking about your expenses, income, or balance."
    }
  }

  // Send message
  const handleSendMessage = (overrideInput?: string) => {
    const messageText = overrideInput || input
    if (!messageText.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { text: messageText, sender: "user" }])
    setInput("")

    // Process query and add bot response
    setTimeout(() => {
      const response = processQuery(messageText)
      setMessages((prev) => [...prev, { text: response, sender: "bot" }])

      if (voiceEnabled) {
        speakText(response)
      }
    }, 500)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg" onClick={() => setIsOpen(true)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 md:w-96 shadow-xl z-50">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
            <div className="font-medium">FinMate Assistant</div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setVoiceEnabled(!voiceEnabled)}>
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 h-80 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === "user" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                size="icon"
                className={`${isListening ? "bg-red-100 text-red-500 dark:bg-red-900" : ""}`}
                onClick={toggleListening}
              >
                <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about your finances..."
                className="flex-1"
              />
              <Button size="icon" onClick={() => handleSendMessage()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
