"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, X, Check, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type { Expense } from "@/types/finance"

interface VoiceInputProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExpenseDetected: (expense: Expense) => void
}

export function VoiceInput({ open, onOpenChange, onExpenseDetected }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedExpense, setDetectedExpense] = useState<Expense | null>(null)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US" // This would be set based on user's language preference

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        setIsListening(false)
        parseExpenseFromSpeech(transcript)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        toast({
          title: "Voice recognition error",
          description: "There was an error with voice recognition. Please try again.",
          variant: "destructive",
        })
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
  }, [toast])

  // Start/stop listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.abort()
      setIsListening(false)
    } else if (recognitionRef.current) {
      setTranscript("")
      setDetectedExpense(null)
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Parse expense from speech
  const parseExpenseFromSpeech = (text: string) => {
    setIsProcessing(true)

    // In a real app, this would use a more sophisticated NLP approach
    // For demo purposes, we'll use a simple regex-based approach
    setTimeout(() => {
      try {
        // Example patterns: "Spent $50 on groceries" or "I paid 25 dollars for gas yesterday"
        const amountPattern = /\$?(\d+(\.\d+)?)\s*(dollars?|bucks)?/i
        const categoryPatterns = {
          Food: /food|grocery|groceries|restaurant|dinner|lunch|breakfast|meal|snack/i,
          Transportation: /transport|gas|fuel|uber|lyft|taxi|car|bus|train|subway/i,
          Entertainment: /entertainment|movie|concert|show|game|fun/i,
          Shopping: /shop|shopping|clothes|clothing|amazon|online/i,
          Utilities: /utility|utilities|bill|electric|water|internet|phone/i,
        }

        // Extract amount
        const amountMatch = text.match(amountPattern)
        const amount = amountMatch ? Number.parseFloat(amountMatch[1]) : 0

        // Extract category
        let category = "Other"
        for (const [cat, pattern] of Object.entries(categoryPatterns)) {
          if (pattern.test(text)) {
            category = cat
            break
          }
        }

        // Create expense object
        if (amount > 0) {
          const expense: Expense = {
            id: crypto.randomUUID(),
            amount,
            category,
            date: new Date().toISOString(),
            note: `Voice entry: "${text}"`,
          }
          setDetectedExpense(expense)
        } else {
          toast({
            title: "Could not detect expense",
            description: "Please try again with a clearer amount, e.g., 'Spent $50 on groceries'",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error parsing speech",
          description: "Could not understand the expense details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    }, 1000)
  }

  const handleSubmit = () => {
    if (detectedExpense) {
      onExpenseDetected(detectedExpense)
      onOpenChange(false)
      setTranscript("")
      setDetectedExpense(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Voice Input</DialogTitle>
          <DialogDescription>
            Speak to add an expense. For example, "Spent $50 on groceries yesterday."
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex justify-center mb-4">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className={`rounded-full h-16 w-16 ${isListening ? "animate-pulse" : ""}`}
              onClick={toggleListening}
              disabled={isProcessing}
            >
              <Mic className="h-6 w-6" />
            </Button>
          </div>

          {isListening && (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 animate-pulse">
              Listening... Speak now
            </div>
          )}

          {transcript && (
            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
              <p className="text-sm font-medium">Transcript:</p>
              <p className="text-slate-700 dark:text-slate-300 mt-1">{transcript}</p>
            </div>
          )}

          {isProcessing && (
            <div className="flex justify-center items-center mt-4">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Processing...</span>
            </div>
          )}

          {detectedExpense && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Detected Expense:</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="font-medium">Amount:</span> ${detectedExpense.amount.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Category:</span> {detectedExpense.category}
                </p>
                <p>
                  <span className="font-medium">Date:</span> {new Date(detectedExpense.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!detectedExpense}>
            <Check className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
