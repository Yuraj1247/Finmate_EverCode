"use client"

import { useState } from "react"
import { Bot, User, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FinBotChart } from "./finbot-chart"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: number
  type?: "text" | "chart" | "suggestion" | "action"
  chartData?: any
  actionType?: string
}

interface FinBotMessageProps {
  message: Message
  router: any
}

export function FinBotMessage({ message, router }: FinBotMessageProps) {
  const [expanded, setExpanded] = useState(false)

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Check if message is long
  const isLongMessage = message.content.length > 300

  // Get display content
  const displayContent = isLongMessage && !expanded ? message.content.substring(0, 300) + "..." : message.content

  // Handle action button click
  const handleActionClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
          {message.sender === "user" ? (
            <div className="bg-blue-500 w-full h-full rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="bg-blue-100 dark:bg-blue-900 w-full h-full rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-500" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}>
          <div
            className={`p-3 rounded-lg ${
              message.sender === "user"
                ? "bg-blue-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            }`}
          >
            {/* Text content */}
            {(!message.type || message.type === "text") && (
              <div className="whitespace-pre-wrap text-sm">{displayContent}</div>
            )}

            {/* Chart content */}
            {message.type === "chart" && message.chartData && (
              <div className="w-full">
                <div className="whitespace-pre-wrap text-sm mb-3">{displayContent}</div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-md">
                  <FinBotChart data={message.chartData} />
                </div>
              </div>
            )}

            {/* Action content */}
            {message.type === "action" && (
              <div className="space-y-2">
                <div className="whitespace-pre-wrap text-sm">{displayContent}</div>
                {message.actionType === "navigate" && (
                  <Button
                    variant={message.sender === "user" ? "secondary" : "default"}
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      handleActionClick(
                        message.content.includes("dashboard")
                          ? "/dashboard"
                          : message.content.includes("expenses")
                            ? "/expenses"
                            : message.content.includes("goals")
                              ? "/goals"
                              : message.content.includes("challenges")
                                ? "/challenges"
                                : message.content.includes("reports")
                                  ? "/reports"
                                  : message.content.includes("insights")
                                    ? "/financial-insights"
                                    : message.content.includes("time travel")
                                      ? "/time-travel"
                                      : "/dashboard",
                      )
                    }
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Navigate Now
                  </Button>
                )}
              </div>
            )}

            {/* Show more/less button for long messages */}
            {isLongMessage && (
              <Button
                variant="link"
                size="sm"
                className={`p-0 h-auto text-xs ${message.sender === "user" ? "text-blue-100" : "text-blue-500"}`}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show less" : "Show more"}
              </Button>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-slate-500 mt-1">{formatTime(message.timestamp)}</div>
        </div>
      </div>
    </div>
  )
}
