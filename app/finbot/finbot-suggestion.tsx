"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"

interface FinBotSuggestionProps {
  text: string
  onClick: () => void
}

export function FinBotSuggestion({ text, onClick }: FinBotSuggestionProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-blue-500" />
        <span className="text-sm">{text}</span>
      </div>
    </motion.div>
  )
}
