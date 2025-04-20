"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Challenge } from "@/types/finance"
import { CheckCircle, X, HelpCircle, Award, Clock } from "lucide-react"

interface BudgetQuizGameProps {
  challenge: Challenge
  onComplete: (id: string) => void
}

interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export function BudgetQuizGame({ challenge, onComplete }: BudgetQuizGameProps) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "completed">("intro")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Quiz questions
  const questions: Question[] = [
    {
      id: 1,
      text: "What is the 50/30/20 budgeting rule?",
      options: [
        "50% needs, 30% wants, 20% savings",
        "50% savings, 30% needs, 20% wants",
        "50% wants, 30% savings, 20% needs",
        "50% needs, 30% savings, 20% wants",
      ],
      correctAnswer: 0,
      explanation:
        "The 50/30/20 rule suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.",
    },
    {
      id: 2,
      text: "Which of these is NOT typically considered a fixed expense?",
      options: ["Rent or mortgage payment", "Dining out", "Car insurance", "Internet bill"],
      correctAnswer: 1,
      explanation:
        "Dining out is a variable expense that can change month to month, while rent, insurance, and internet bills are typically fixed expenses.",
    },
    {
      id: 3,
      text: "What is an emergency fund?",
      options: [
        "Money set aside for vacation",
        "Savings for retirement",
        "Money saved for unexpected expenses",
        "Investment in stocks",
      ],
      correctAnswer: 2,
      explanation:
        "An emergency fund is money set aside specifically for unexpected expenses like medical emergencies, car repairs, or job loss.",
    },
    {
      id: 4,
      text: "How much should you ideally have in your emergency fund?",
      options: ["1 month of expenses", "3-6 months of expenses", "1 year of expenses", "As much as possible"],
      correctAnswer: 1,
      explanation:
        "Financial experts typically recommend having 3-6 months of living expenses saved in your emergency fund.",
    },
    {
      id: 5,
      text: "What is the first step in creating a budget?",
      options: [
        "Cut all unnecessary expenses",
        "Open a new bank account",
        "Track your income and expenses",
        "Set financial goals",
      ],
      correctAnswer: 2,
      explanation:
        "The first step in creating a budget is to track your current income and expenses to understand your financial situation.",
    },
  ]

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isTimerRunning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0 && isTimerRunning) {
      // Time's up for this question
      handleAnswer(null)
    }

    return () => clearTimeout(timer)
  }, [timeLeft, isTimerRunning])

  const startGame = () => {
    setGameState("playing")
    setCurrentQuestion(0)
    setScore(0)
    setTimeLeft(30)
    setIsTimerRunning(true)
  }

  const handleAnswer = (optionIndex: number | null) => {
    setIsTimerRunning(false)
    setSelectedOption(optionIndex)

    // Check if answer is correct
    if (optionIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }

    setShowExplanation(true)
  }

  const nextQuestion = () => {
    setSelectedOption(null)
    setShowExplanation(false)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTimeLeft(30)
      setIsTimerRunning(true)
    } else {
      // Quiz completed
      if (score >= 3) {
        // Pass threshold: 3 out of 5 questions
        setGameState("completed")
        onComplete(challenge.id)
      } else {
        // Failed, restart quiz
        setGameState("intro")
      }
    }
  }

  return (
    <div className="w-full">
      {gameState === "intro" && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Financial Knowledge Quiz</CardTitle>
            <CardDescription>Test your knowledge about budgeting and personal finance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <h3 className="font-medium mb-2">How to Play:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Answer 5 questions about personal finance</li>
                <li>You have 30 seconds to answer each question</li>
                <li>Get at least 3 questions right to complete the challenge</li>
                <li>Learn valuable financial concepts along the way</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <HelpCircle className="h-16 w-16 text-blue-500" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startGame} className="w-full">
              Start Quiz
            </Button>
          </CardFooter>
        </Card>
      )}

      {gameState === "playing" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Badge variant="outline">
                Question {currentQuestion + 1}/{questions.length}
              </Badge>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-amber-500" />
                <span className={`font-medium ${timeLeft <= 10 ? "text-red-500" : ""}`}>{timeLeft}s</span>
              </div>
            </div>
            <Progress value={(currentQuestion / questions.length) * 100} className="h-1 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <h3 className="text-lg font-medium">{questions[currentQuestion].text}</h3>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    selectedOption === null
                      ? "outline"
                      : selectedOption === index
                        ? index === questions[currentQuestion].correctAnswer
                          ? "default"
                          : "destructive"
                        : index === questions[currentQuestion].correctAnswer && showExplanation
                          ? "default"
                          : "outline"
                  }
                  className={`w-full justify-start text-left h-auto py-3 ${
                    selectedOption !== null ? "cursor-default" : ""
                  }`}
                  onClick={() => selectedOption === null && handleAnswer(index)}
                  disabled={selectedOption !== null}
                >
                  <div className="flex items-center w-full">
                    <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                    <span className="flex-1">{option}</span>
                    {selectedOption !== null && index === questions[currentQuestion].correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    )}
                    {selectedOption === index && index !== questions[currentQuestion].correctAnswer && (
                      <X className="h-5 w-5 text-red-500 ml-2" />
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {showExplanation && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Explanation:</p>
                <p>{questions[currentQuestion].explanation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm">
              Score:{" "}
              <span className="font-medium">
                {score}/{currentQuestion + (selectedOption !== null ? 1 : 0)}
              </span>
            </div>
            {showExplanation && (
              <Button onClick={nextQuestion}>
                {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {gameState === "completed" && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>Quiz Completed!</CardTitle>
            <CardDescription>
              You scored {score} out of {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Great job! You've demonstrated solid knowledge of personal finance concepts.</p>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md">
              <p className="font-medium">You've earned {challenge.points} points for completing this challenge!</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setGameState("intro")} variant="outline">
              Play Again
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
