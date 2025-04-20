"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Bot,
  Mic,
  Send,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  HelpCircle,
  MessageSquare,
  Brain,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatCurrency } from "@/lib/utils"
import { FinBotAvatar } from "./finbot-avatar"
import { FinBotMessage } from "./finbot-message"
import { FinBotSuggestion } from "./finbot-suggestion"
import { processFinBotQuery } from "./finbot-processor"
import { useTheme } from "@/components/theme-provider"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: number
  type?: "text" | "chart" | "suggestion" | "action"
  chartData?: any
  actionType?: string
}

// Natural language variants for common commands
const COMMAND_VARIANTS = {
  theme: {
    light: [
      "light theme",
      "light mode",
      "day mode",
      "bright theme",
      "switch to light",
      "change to light",
      "enable light",
      "turn on light",
      "light theme please",
      "activate light mode",
      "switch to white mode",
    ],
    dark: [
      "dark theme",
      "dark mode",
      "night mode",
      "switch to dark",
      "change to dark",
      "enable dark",
      "turn on dark",
      "dark theme please",
      "activate dark mode",
      "switch to black mode",
    ],
    toggle: ["toggle theme", "switch theme", "change theme", "flip theme", "invert theme", "swap theme"],
  },
  navigation: {
    dashboard: ["dashboard", "home", "main page", "main screen", "overview"],
    expenses: ["expense", "spending", "transactions", "costs", "purchases"],
    goals: ["goal", "saving", "target", "objective", "aim"],
    challenges: ["challenge", "game", "achievement", "task", "mission"],
    reports: ["report", "analytics", "analysis", "statistics", "charts"],
    insights: ["insight", "advice", "recommendation", "suggestion", "tip"],
    timeTravel: ["time travel", "future", "projection", "forecast", "predict"],
  },
}

export default function FinBotPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState("assistant")
  const [contextMemory, setContextMemory] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get user data from localStorage
  const [income] = useLocalStorage<number>("income", 0)
  const [expenses] = useLocalStorage<any[]>("expenses", [])
  const [goals] = useLocalStorage<any[]>("goals", [])
  const [username] = useLocalStorage<string>("username", "User")

  // Add this inside the FinBotPage component, after the other state variables
  const { theme, toggleTheme } = useTheme()

  // Speech recognition setup
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Web Speech API if available
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

        // Auto-submit after a short delay to allow UI update
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

    // Add welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hello ${username || "there"}! I'm FinBot, your personal financial assistant. How can I help you today?`,
      sender: "bot",
      timestamp: Date.now(),
      type: "text",
    }

    setMessages([welcomeMessage])

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [username])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle voice input
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.abort()
      setIsListening(false)
    } else if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Speak text using Web Speech API
  const speakText = (text: string) => {
    if (!voiceEnabled) return

    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text)

      // Get available voices and set a good one
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice =
        voices.find((voice) => voice.name.includes("Google") && voice.name.includes("Female")) ||
        voices.find((voice) => !voice.name.includes("Male"))

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.rate = 1.0
      utterance.pitch = 1.0

      // Set speaking state
      setIsSpeaking(true)

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      // Speak
      window.speechSynthesis.speak(utterance)
    }
  }

  // Stop speaking
  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Check for natural language command variants
  const parseCommandIntent = (userInput: string) => {
    const normalizedInput = userInput.toLowerCase().trim()

    // Check for theme commands
    if (COMMAND_VARIANTS.theme.light.some((phrase) => normalizedInput.includes(phrase))) {
      return { command: "theme", action: "light" }
    }

    if (COMMAND_VARIANTS.theme.dark.some((phrase) => normalizedInput.includes(phrase))) {
      return { command: "theme", action: "dark" }
    }

    if (COMMAND_VARIANTS.theme.toggle.some((phrase) => normalizedInput.includes(phrase))) {
      return { command: "theme", action: "toggle" }
    }

    // Check for navigation commands
    for (const [destination, phrases] of Object.entries(COMMAND_VARIANTS.navigation)) {
      if (
        (normalizedInput.includes("go to") ||
          normalizedInput.includes("take me to") ||
          normalizedInput.includes("navigate to") ||
          normalizedInput.includes("show me") ||
          normalizedInput.includes("open")) &&
        phrases.some((phrase) => normalizedInput.includes(phrase))
      ) {
        return { command: "navigate", action: destination }
      }
    }

    return null
  }

  // Update context memory with new messages
  const updateContextMemory = (userMessage: string, botResponse: string) => {
    // Keep only the last 5 interactions
    const newMemory = [...contextMemory, `User: ${userMessage}`, `Bot: ${botResponse}`].slice(-10)
    setContextMemory(newMemory)
  }

  // Get context memory as a string
  const getContextString = () => {
    return contextMemory.join("\n")
  }

  // Handle sending a message
  const handleSendMessage = async (overrideInput?: string) => {
    const messageText = overrideInput || input
    if (!messageText.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: "user",
      timestamp: Date.now(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Check for command intent
    const commandIntent = parseCommandIntent(messageText)

    if (commandIntent) {
      // Handle theme commands
      if (commandIntent.command === "theme") {
        let responseText = ""

        if (commandIntent.action === "toggle") {
          toggleTheme()
          responseText = `I've toggled the theme for you. Now using ${theme === "dark" ? "light" : "dark"} mode.`
        } else {
          const requestedTheme = commandIntent.action
          const currentTheme = localStorage.getItem("theme") || "dark"

          if (requestedTheme !== currentTheme) {
            localStorage.setItem("theme", requestedTheme)
            document.documentElement.classList.toggle("dark", requestedTheme === "dark")
            responseText = `I've switched to ${requestedTheme} mode for you.`
          } else {
            responseText = `You're already using ${requestedTheme} mode.`
          }
        }

        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseText,
          sender: "bot",
          timestamp: Date.now(),
          type: "text",
        }

        setMessages((prev) => [...prev, botMessage])
        updateContextMemory(messageText, responseText)

        if (voiceEnabled) {
          speakText(responseText)
        }

        setIsLoading(false)
        return
      }

      // Handle navigation commands
      if (commandIntent.command === "navigate") {
        let path = "/"
        let responseText = ""

        switch (commandIntent.action) {
          case "dashboard":
            path = "/dashboard"
            responseText = "Taking you to the dashboard."
            break
          case "expenses":
            path = "/expenses"
            responseText = "Navigating to your expenses page."
            break
          case "goals":
            path = "/goals"
            responseText = "Let's check out your financial goals."
            break
          case "challenges":
            path = "/challenges"
            responseText = "Taking you to the challenges page."
            break
          case "reports":
            path = "/reports"
            responseText = "Here are your financial reports."
            break
          case "insights":
            path = "/financial-insights"
            responseText = "Let's look at your personalized financial insights."
            break
          case "timeTravel":
            path = "/time-travel"
            responseText = "Let's explore your financial future."
            break
        }

        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseText,
          sender: "bot",
          timestamp: Date.now(),
          type: "text",
        }

        setMessages((prev) => [...prev, botMessage])
        updateContextMemory(messageText, responseText)

        if (voiceEnabled) {
          speakText(responseText)
        }

        // Navigate after a short delay
        setTimeout(() => {
          router.push(path)
        }, 1500)

        setIsLoading(false)
        return
      }
    }

    // Process the query with context memory
    try {
      const response = await processFinBotQuery(messageText, {
        income,
        expenses,
        goals,
        username,
        navigate: (path: string) => {
          router.push(path)
        },
        contextMemory: getContextString(),
      })

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.text,
        sender: "bot",
        timestamp: Date.now(),
        type: response.type || "text",
        chartData: response.chartData,
        actionType: response.actionType,
      }

      setMessages((prev) => [...prev, botMessage])
      updateContextMemory(messageText, response.text)

      // Speak the response if voice is enabled
      if (voiceEnabled && response.text) {
        speakText(response.text)
      }

      // Execute action if needed
      if (response.actionType === "navigate" && response.path) {
        setTimeout(() => {
          router.push(response.path as string)
        }, 1500)
      }

      // Add this inside the try block after processing the query
      if (response.actionType === "theme-toggle" || response.actionType === "theme-change") {
        // Theme already changed in the processor, just update the UI state
        // This ensures the UI reflects the theme change
        if (response.actionType === "theme-change" && response.path) {
          // Force theme update in the UI
          document.documentElement.classList.toggle("dark", response.path === "dark")
        }
      }
    } catch (error) {
      console.error("Error processing query:", error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: Date.now(),
        type: "text",
      }

      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Suggested queries
  const suggestions = [
    "Show me my expenses this month",
    "How much have I saved?",
    "What is an emergency fund?",
    "Take me to my goals",
    "Show me my financial health",
    "How do I create a budget?",
  ]

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setTimeout(() => {
      handleSendMessage(suggestion)
    }, 100)
  }

  // Reset conversation
  const resetConversation = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hello again ${username || "there"}! How else can I help you today?`,
      sender: "bot",
      timestamp: Date.now(),
      type: "text",
    }

    setMessages([welcomeMessage])
    setContextMemory([])

    if (voiceEnabled) {
      speakText(welcomeMessage.content)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Calculate unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    // This would normally come from a notifications service
    return 0
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Bot className="h-7 w-7 text-blue-500" />
                FinBot AI Assistant
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Your intelligent financial companion</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chat Interface */}
            <Card className={`${isExpanded ? "lg:col-span-2" : "lg:col-span-1"} transition-all duration-300`}>
              <CardContent className="p-0">
                <div className="flex flex-col h-[70vh]">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                        <Bot className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">FinBot</h3>
                        <p className="text-xs text-slate-500">Online</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        title={voiceEnabled ? "Mute voice" : "Enable voice"}
                      >
                        {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={resetConversation} title="Reset conversation">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FinBotMessage message={message} router={router} />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Loading indicator */}
                    {isLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleListening}
                        className={`${isListening ? "bg-red-100 text-red-500 dark:bg-red-900" : ""}`}
                      >
                        <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
                      </Button>
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask me anything about finance or your accounts..."
                        className="flex-1"
                      />
                      <Button onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Voice status */}
                    {isListening && (
                      <div className="text-xs text-center mt-2 text-blue-500">Listening... Speak now</div>
                    )}

                    {/* Speaking indicator */}
                    {isSpeaking && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="text-xs text-blue-500">Speaking</div>
                        <div className="flex space-x-1">
                          <div
                            className="w-1 h-3 bg-blue-500 rounded-full animate-sound-wave"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-1 h-3 bg-blue-500 rounded-full animate-sound-wave"
                            style={{ animationDelay: "100ms" }}
                          ></div>
                          <div
                            className="w-1 h-3 bg-blue-500 rounded-full animate-sound-wave"
                            style={{ animationDelay: "200ms" }}
                          ></div>
                          <div
                            className="w-1 h-3 bg-blue-500 rounded-full animate-sound-wave"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                          <div
                            className="w-1 h-3 bg-blue-500 rounded-full animate-sound-wave"
                            style={{ animationDelay: "400ms" }}
                          ></div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={stopSpeaking}>
                          Stop
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <Card className={`${isExpanded ? "lg:col-span-1" : "lg:col-span-2"} transition-all duration-300`}>
              <CardContent className="p-0">
                <Tabs
                  defaultValue="assistant"
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="h-[70vh] flex flex-col"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="assistant" className="flex-1">
                      <Bot className="h-4 w-4 mr-2" />
                      Assistant
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="flex-1">
                      <Zap className="h-4 w-4 mr-2" />
                      Suggestions
                    </TabsTrigger>
                    <TabsTrigger value="help" className="flex-1">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-auto">
                    <TabsContent value="assistant" className="h-full m-0 p-0 flex flex-col">
                      <div className="flex-1 flex items-center justify-center p-4">
                        <FinBotAvatar isSpeaking={isSpeaking} />
                      </div>

                      <div className="p-4 border-t">
                        <h3 className="font-medium mb-2">Financial Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Monthly Income:</span>
                            <span className="font-medium">{formatCurrency(income)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Expenses:</span>
                            <span className="font-medium">
                              {formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Goals:</span>
                            <span className="font-medium">{goals.filter((goal) => !goal.completed).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Savings Rate:</span>
                            <span className="font-medium">
                              {income > 0
                                ? `${Math.round(((income - expenses.reduce((sum, expense) => sum + expense.amount, 0)) / income) * 100)}%`
                                : "0%"}
                            </span>
                          </div>
                        </div>

                        {contextMemory.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-purple-500" />
                              <h3 className="font-medium text-sm">Memory Context</h3>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              FinBot remembers your recent interactions to provide more relevant responses.
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="suggestions" className="h-full m-0 p-4 overflow-y-auto">
                      <h3 className="font-medium mb-4">Try asking me:</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {suggestions.map((suggestion, index) => (
                          <FinBotSuggestion
                            key={index}
                            text={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                          />
                        ))}

                        <div className="mt-4">
                          <h4 className="font-medium mb-2 text-sm">Navigation Commands:</h4>
                          <div className="space-y-2">
                            <FinBotSuggestion
                              text="Go to dashboard"
                              onClick={() => handleSuggestionClick("Go to dashboard")}
                            />
                            <FinBotSuggestion
                              text="Show me my expenses"
                              onClick={() => handleSuggestionClick("Show me my expenses")}
                            />
                            <FinBotSuggestion
                              text="Take me to goals page"
                              onClick={() => handleSuggestionClick("Take me to goals page")}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium mb-2 text-sm">Financial Questions:</h4>
                          <div className="space-y-2">
                            <FinBotSuggestion
                              text="What is compound interest?"
                              onClick={() => handleSuggestionClick("What is compound interest?")}
                            />
                            <FinBotSuggestion
                              text="How should I budget my money?"
                              onClick={() => handleSuggestionClick("How should I budget my money?")}
                            />
                            <FinBotSuggestion
                              text="Explain the 50/30/20 rule"
                              onClick={() => handleSuggestionClick("Explain the 50/30/20 rule")}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="help" className="h-full m-0 p-4 overflow-y-auto">
                      <h3 className="font-medium mb-4">How to use FinBot</h3>

                      <div className="space-y-4 text-sm">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4" />
                            Chat Commands
                          </h4>
                          <p className="mb-2">You can ask FinBot about:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Your financial data (expenses, income, goals)</li>
                            <li>Navigation to different parts of the app</li>
                            <li>Financial concepts and advice</li>
                            <li>Calculations and projections</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <Mic className="h-4 w-4" />
                            Voice Commands
                          </h4>
                          <p>Click the microphone icon to speak your commands instead of typing.</p>
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <Volume2 className="h-4 w-4" />
                            Voice Responses
                          </h4>
                          <p>FinBot can speak responses. Toggle the sound icon to turn this on/off.</p>
                        </div>

                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4" />
                            Example Commands
                          </h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>"Show me my spending for this month"</li>
                            <li>"Take me to my goals page"</li>
                            <li>"What's my current balance?"</li>
                            <li>"Explain what an emergency fund is"</li>
                            <li>"How am I doing financially?"</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
