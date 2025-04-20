"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Calendar, ShoppingCart, Zap, Sprout } from "lucide-react"

interface Game {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  reward: string
  difficulty: "easy" | "medium" | "hard"
}

export function GamesList() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const games: Game[] = [
    {
      id: "no-spend",
      title: "No-Spend Day",
      description: "Complete a full day without spending any money. Tap coins to save them!",
      icon: <Coins className="h-8 w-8 text-yellow-500" />,
      reward: "₹100 virtual cash + Saver Badge",
      difficulty: "easy",
    },
    {
      id: "budget-limit",
      title: "Weekly Budget Limit",
      description: "Stay under your weekly budget. Jump over spending obstacles!",
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      reward: "₹200 virtual cash + Budgeter Badge",
      difficulty: "medium",
    },
    {
      id: "track-7-days",
      title: "Track 7 Days",
      description: "Log all expenses for 7 consecutive days. Play Budget Tetris!",
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      reward: "₹150 virtual cash + Tracker Badge",
      difficulty: "medium",
    },
    {
      id: "avoid-impulse",
      title: "Avoid Impulse Buy",
      description: "Resist an impulse purchase. Slice temptations in Fruit Ninja style!",
      icon: <ShoppingCart className="h-8 w-8 text-red-500" />,
      reward: "₹250 virtual cash + Mindful Badge",
      difficulty: "hard",
    },
    {
      id: "save-500",
      title: "Save ₹500",
      description: "Save ₹500 this week. Build your farm with resources!",
      icon: <Sprout className="h-8 w-8 text-emerald-500" />,
      reward: "₹300 virtual cash + Saver Pro Badge",
      difficulty: "hard",
    },
  ]

  const handlePlayGame = (gameId: string) => {
    setSelectedGame(gameId)
    // In a real implementation, this would launch the game
    alert(
      `In a production environment, this would launch the ${gameId} game. The game would be built with Phaser.js and provide an interactive experience related to the financial challenge.`,
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Card key={game.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{game.title}</CardTitle>
                <Badge
                  variant={
                    game.difficulty === "easy" ? "outline" : game.difficulty === "medium" ? "secondary" : "destructive"
                  }
                >
                  {game.difficulty}
                </Badge>
              </div>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">{game.icon}</div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <div className="text-sm">
                <span className="font-medium">Reward:</span> {game.reward}
              </div>
              <Button className="w-full" onClick={() => handlePlayGame(game.id)}>
                <Zap className="mr-2 h-4 w-4" />
                Play Game
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
        <p>
          Complete challenges to earn virtual rewards and improve your financial habits.
          <br />
          New games are added regularly!
        </p>
      </div>
    </div>
  )
}
