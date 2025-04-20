"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Award, CheckCircle, Info, Star, Gamepad, BookOpen, Calculator, Coins, Zap, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { GameChallenge } from "./game-challenge"
import { BudgetQuizGame } from "./budget-quiz-game"
import { DebtPayoffGame } from "./debt-payoff-game"
import { GameEngine } from "@/components/game-engine"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import type { Challenge, Badge as BadgeType, GameConfig } from "@/types/finance"
import { GamesList } from "./games-list"
import { FinanceQuizModule } from "./finance-quiz-module"

// New weekly challenges
const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: "no-spend-today",
    title: "No Spend Today",
    description: "Go an entire day without spending any money",
    difficulty: "easy",
    points: 10,
    completed: false,
    category: "weekly",
    gameType: "coin",
    walletReward: 50,
  },
  {
    id: "avoid-impulse-buy",
    title: "Avoid Impulse Buy",
    description: "Resist the temptation of impulse purchases for a day",
    difficulty: "medium",
    points: 15,
    completed: false,
    category: "weekly",
    gameType: "ninja",
    walletReward: 75,
  },
  {
    id: "save-500-today",
    title: "Save ₹500 Today",
    description: "Set aside ₹500 in your savings account today",
    difficulty: "easy",
    points: 15,
    completed: false,
    category: "weekly",
    gameType: "farm",
    walletReward: 60,
  },
  {
    id: "no-junk-food",
    title: "No Junk Food",
    description: "Avoid junk food for a day and save money",
    difficulty: "medium",
    points: 20,
    completed: false,
    category: "weekly",
    gameType: "obstacle",
    walletReward: 80,
  },
  {
    id: "no-party",
    title: "No Party",
    description: "Skip a party or social event to save money",
    difficulty: "hard",
    points: 25,
    completed: false,
    category: "weekly",
    gameType: "tetris",
    walletReward: 100,
  },
  {
    id: "no-entertainment",
    title: "No Entertainment",
    description: "Avoid paid entertainment for a day (movies, games, etc.)",
    difficulty: "medium",
    points: 15,
    completed: false,
    category: "weekly",
    gameType: "ninja",
    walletReward: 70,
  },
  {
    id: "meal-prep-home",
    title: "Meal Prep at Home",
    description: "Prepare all your meals at home for a day",
    difficulty: "easy",
    points: 10,
    completed: false,
    category: "weekly",
    gameType: "farm",
    walletReward: 50,
  },
  {
    id: "public-transport",
    title: "Use Public Transport Only",
    description: "Use only public transportation for a day",
    difficulty: "medium",
    points: 20,
    completed: false,
    category: "weekly",
    gameType: "obstacle",
    walletReward: 85,
  },
  {
    id: "track-every-rupee",
    title: "Track Every Rupee",
    description: "Record every single expense for a day, no matter how small",
    difficulty: "medium",
    points: 15,
    completed: false,
    category: "weekly",
    gameType: "coin",
    walletReward: 65,
  },
  {
    id: "budget-review",
    title: "Do a 10-minute Budget Review",
    description: "Spend 10 minutes reviewing your budget and finding areas to improve",
    difficulty: "easy",
    points: 10,
    completed: false,
    category: "weekly",
    gameType: "quiz",
    walletReward: 55,
  },
]

// New monthly quiz modules
const MONTHLY_CHALLENGES: Challenge[] = [
  {
    id: "module-1-basic-finance",
    title: "Module 1: Basic Finance Tips",
    description: "Learn the fundamentals of personal finance through an interactive quiz",
    difficulty: "easy",
    points: 30,
    completed: false,
    category: "monthly",
    gameType: "quiz",
    walletReward: 150,
  },
  {
    id: "module-2-saving-money",
    title: "Module 2: How to Save Money",
    description: "Understand needs vs. wants and budgeting techniques",
    difficulty: "easy",
    points: 30,
    completed: false,
    category: "monthly",
    gameType: "quiz",
    walletReward: 150,
  },
  {
    id: "module-3-smart-spending",
    title: "Module 3: Smart Spending Habits",
    description: "Learn strategies to spend wisely and avoid common pitfalls",
    difficulty: "medium",
    points: 40,
    completed: false,
    category: "monthly",
    gameType: "quiz",
    walletReward: 200,
  },
  {
    id: "module-4-investments",
    title: "Module 4: Introduction to Investments",
    description: "Understand the basics of investing and growing your money",
    difficulty: "medium",
    points: 40,
    completed: false,
    category: "monthly",
    gameType: "quiz",
    walletReward: 200,
  },
  {
    id: "module-5-credit-loans",
    title: "Module 5: Credit & Loans Simplified",
    description: "Learn about credit scores, loans, and managing debt responsibly",
    difficulty: "hard",
    points: 50,
    completed: false,
    category: "monthly",
    gameType: "quiz",
    walletReward: 250,
  },
  {
    id: "module-6-financial-planning",
    title: "Module 6: Financial Planning & Goal Setting",
    description: "Create a roadmap for your financial future and set achievable goals",
    difficulty: "hard",
    points: 50,
    completed: false,
    category: "monthly",
    gameType: "quiz",
    walletReward: 250,
  },
]

// Predefined badges
const BADGES: BadgeType[] = [
  {
    id: "saver-starter",
    name: "Saver Starter",
    description: "Complete your first challenge",
    image: "🌱",
    earned: false,
    pointsRequired: 10,
  },
  {
    id: "budget-master",
    name: "Budget Master",
    description: "Complete 5 challenges",
    image: "🏆",
    earned: false,
    pointsRequired: 50,
  },
  {
    id: "finance-guru",
    name: "Finance Guru",
    description: "Earn 100 points from challenges",
    image: "🧠",
    earned: false,
    pointsRequired: 100,
  },
  {
    id: "savings-champion",
    name: "Savings Champion",
    description: "Complete all weekly challenges",
    image: "💰",
    earned: false,
    pointsRequired: 150,
  },
  {
    id: "financial-freedom",
    name: "Financial Freedom",
    description: "Complete all challenges",
    image: "🚀",
    earned: false,
    pointsRequired: 200,
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Maintain a 7-day streak",
    image: "🔥",
    earned: false,
    pointsRequired: 70,
  },
  {
    id: "game-champion",
    name: "Game Champion",
    description: "Score over 500 points in games",
    image: "🎮",
    earned: false,
    pointsRequired: 120,
  },
  {
    id: "money-saver",
    name: "Money Saver",
    description: "Save ₹5000 through challenges",
    image: "💵",
    earned: false,
    pointsRequired: 180,
  },
]

export default function ChallengesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { translate: t } = useLanguage()
  const userId = user?.id || "guest"

  const [challenges, setChallenges] = useLocalStorage<Challenge[]>(
    `challenges_${userId}`,
    [...WEEKLY_CHALLENGES, ...MONTHLY_CHALLENGES].map((challenge) => ({
      ...challenge,
      userId,
    })),
  )
  const [badges, setBadges] = useLocalStorage<BadgeType[]>(
    `badges_${userId}`,
    BADGES.map((badge) => ({
      ...badge,
      userId,
    })),
  )
  const [points, setPoints] = useLocalStorage<number>(`challenge-points_${userId}`, 0)
  const [wallet, setWallet] = useLocalStorage<number>(`challenge-wallet_${userId}`, 0)
  const [activeTab, setActiveTab] = useState("weekly")
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [quizModule, setQuizModule] = useState<string | null>(null)

  // Use a ref to track if badge checks have been processed
  const badgeChecksProcessed = useRef(false)

  // Check for badge unlocks when points change
  useEffect(() => {
    // Skip if we've already processed badges in this session
    if (badgeChecksProcessed.current) {
      return
    }

    // Mark as processed to prevent infinite loops
    badgeChecksProcessed.current = true

    const updatedBadges = badges.map((badge) => {
      if (!badge.earned && points >= badge.pointsRequired) {
        // Badge newly earned
        toast({
          title: "🎉 " + t("badge_unlocked"),
          description: `${t("earned_badge")} "${badge.name}"!`,
          variant: "success",
        })
        return { ...badge, earned: true }
      }
      return badge
    })

    // Only update badges if there's a change
    if (JSON.stringify(updatedBadges) !== JSON.stringify(badges)) {
      setBadges(updatedBadges)
    }
  }, [points, badges, setBadges, toast, t])

  const handleCompleteChallenge = (id: string, gameScore?: number) => {
    const updatedChallenges = challenges.map((challenge) => {
      if (challenge.id === id && !challenge.completed) {
        // Add points
        setPoints(points + challenge.points)

        // Add wallet reward
        if (challenge.walletReward) {
          setWallet(wallet + challenge.walletReward)
        }

        // Show toast
        toast({
          title: t("challenge_completed"),
          description: `${t("earned")} ${challenge.points} ${t("points")} ${t("and")} ₹${challenge.walletReward || 0}`,
          variant: "success",
        })

        return { ...challenge, completed: true }
      }
      return challenge
    })

    setChallenges(updatedChallenges)

    // Check if all challenges in a category are completed
    const categoryCompleted = updatedChallenges.filter((c) => c.category === activeTab).every((c) => c.completed)

    if (categoryCompleted) {
      toast({
        title: "🏆 " + t("achievement_unlocked"),
        description: `${t("completed_all")} ${activeTab} ${t("challenges")}!`,
        variant: "success",
      })
    }

    // Return to challenge list
    setSelectedChallenge(null)
    setGameConfig(null)
    setQuizModule(null)
  }

  const handleResetChallenges = () => {
    const resetChallenges = challenges.map((challenge) => ({
      ...challenge,
      completed: false,
    }))

    setChallenges(resetChallenges)
    toast({
      title: t("challenges_reset"),
      description: t("all_challenges_reset"),
    })
  }

  // Filter challenges by category
  const filteredChallenges = challenges.filter((challenge) => challenge.category === activeTab)

  // Calculate progress
  const totalChallenges = filteredChallenges.length
  const completedChallenges = filteredChallenges.filter((c) => c.completed).length
  const progressPercentage = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0

  // Start a game for a challenge
  const handleStartGame = (challenge: Challenge) => {
    setSelectedChallenge(challenge)

    if (challenge.gameType === "quiz" && challenge.category === "monthly") {
      setQuizModule(challenge.id)
      return
    }

    // Create game configuration based on challenge type
    const config: GameConfig = {
      challengeId: challenge.id,
      difficulty: challenge.difficulty,
      targetScore: challenge.difficulty === "easy" ? 100 : challenge.difficulty === "medium" ? 200 : 300,
      timeLimit: challenge.difficulty === "easy" ? 60 : challenge.difficulty === "medium" ? 90 : 120,
    }

    setGameConfig(config)
  }

  // Render the appropriate game component based on the challenge type
  const renderGameComponent = (challenge: Challenge) => {
    if (quizModule) {
      return <FinanceQuizModule moduleId={quizModule} onComplete={() => handleCompleteChallenge(challenge.id)} />
    }

    if (!gameConfig) return null

    switch (challenge.gameType) {
      case "quiz":
        return <BudgetQuizGame challenge={challenge} onComplete={handleCompleteChallenge} />
      case "debt":
        return <DebtPayoffGame challenge={challenge} onComplete={handleCompleteChallenge} />
      case "coin":
      case "obstacle":
      case "tetris":
      case "ninja":
      case "farm":
        return (
          <GameEngine
            gameType={challenge.gameType}
            config={gameConfig}
            onComplete={(score) => handleCompleteChallenge(challenge.id, score)}
          />
        )
      default:
        return <GameChallenge challenge={challenge} onComplete={handleCompleteChallenge} />
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t("Finance Challenges")}</h1>
              <p className="text-slate-500 dark:text-slate-400">{t("complete challenges to earn badges")}</p>
            </div>

            <div className="flex items-center mt-4 md:mt-0 gap-4">
              <div className="flex items-center bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full">
                <Star className="h-4 w-4 mr-1" />
                <span className="font-medium">
                  {points} {t("points")}
                </span>
              </div>

              <div className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                <Coins className="h-4 w-4 mr-1" />
                <span className="font-medium">₹{wallet}</span>
              </div>

              <Button variant="outline" size="sm" onClick={handleResetChallenges}>
                {t("Reset Challenges")}
              </Button>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium">{t("Challenge Progress")}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {completedChallenges} {t("of")} {totalChallenges} {t("challenges completed")}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-1/2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("progress")}</span>
                    <span className="font-medium">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          {selectedChallenge ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedChallenge.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedChallenge(null)
                      setGameConfig(null)
                      setQuizModule(null)
                    }}
                  >
                    {t("back_to_challenges")}
                  </Button>
                </div>
                <CardDescription>
                  {t("complete_this_challenge")} {selectedChallenge.points} {t("points")} {t("and")} ₹
                  {selectedChallenge.walletReward || 0}
                </CardDescription>
              </CardHeader>
              <CardContent>{renderGameComponent(selectedChallenge)}</CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="weekly" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="weekly">{t("Weekly Challenges")}</TabsTrigger>
                <TabsTrigger value="monthly">{t("Monthly Challenges")}</TabsTrigger>
                <TabsTrigger value="badges">{t("badges")}</TabsTrigger>
                <TabsTrigger value="games">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  {t("games")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="weekly" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onComplete={handleCompleteChallenge}
                      onPlay={handleStartGame}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onComplete={handleCompleteChallenge}
                      onPlay={handleStartGame}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="badges" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} points={points} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="games" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("financial_games")}</CardTitle>
                    <CardDescription>{t("play_games_description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GamesList />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}

function ChallengeCard({
  challenge,
  onComplete,
  onPlay,
}: {
  challenge: Challenge
  onComplete: (id: string) => void
  onPlay: (challenge: Challenge) => void
}) {
  const { translate: t } = useLanguage()

  // Get icon based on game type
  const getIcon = () => {
    switch (challenge.gameType) {
      case "quiz":
        return <BookOpen className="h-4 w-4 mr-1" />
      case "debt":
        return <Calculator className="h-4 w-4 mr-1" />
      case "obstacle":
        return <Zap className="h-4 w-4 mr-1" />
      case "tetris":
        return <Gamepad className="h-4 w-4 mr-1" />
      case "ninja":
        return <Gamepad className="h-4 w-4 mr-1" />
      case "farm":
        return <Coins className="h-4 w-4 mr-1" />
      case "coin":
      default:
        return <Gamepad className="h-4 w-4 mr-1" />
    }
  }

  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${challenge.completed ? "border-green-500" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{challenge.title}</CardTitle>
          <Badge
            variant={
              challenge.difficulty === "easy"
                ? "outline"
                : challenge.difficulty === "medium"
                  ? "secondary"
                  : "destructive"
            }
          >
            {t(challenge.difficulty)}
          </Badge>
        </div>
        <CardDescription>{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1" />
            <span>
              {challenge.points} {t("points")}
            </span>
          </div>

          {challenge.walletReward && (
            <div className="flex items-center">
              <Coins className="h-4 w-4 mr-1" />
              <span>₹{challenge.walletReward}</span>
            </div>
          )}

          <Badge variant="outline" className="ml-auto">
            {getIcon()}
            {challenge.gameType === "quiz"
              ? t("quiz_game")
              : challenge.gameType === "debt"
                ? t("strategy_game")
                : challenge.gameType === "obstacle"
                  ? t("obstacle_game")
                  : challenge.gameType === "tetris"
                    ? t("tetris_game")
                    : challenge.gameType === "ninja"
                      ? t("ninja_game")
                      : challenge.gameType === "farm"
                        ? t("farm_game")
                        : t("coin_game")}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPlay(challenge)}
          disabled={challenge.completed}
          className="transition-all hover:bg-blue-50 dark:hover:bg-blue-900"
        >
          {getIcon()}
          {t("play challenge")}
        </Button>

        <Button
          className="w-auto"
          variant={challenge.completed ? "outline" : "default"}
          size="sm"
          disabled={challenge.completed}
          onClick={() => onComplete(challenge.id)}
        >
          {challenge.completed ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("completed")}
            </>
          ) : (
            t("mark as complete")
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function BadgeCard({
  badge,
  points,
}: {
  badge: BadgeType
  points: number
}) {
  const { translate: t } = useLanguage()
  const isLocked = !badge.earned
  const progress = Math.min(100, Math.round((points / badge.pointsRequired) * 100))

  return (
    <Card
      className={`transition-all duration-300 ${badge.earned ? "border-purple-500 hover:shadow-md" : "opacity-80"}`}
    >
      <CardHeader className="pb-2 text-center">
        <div className="flex justify-center mb-2">
          <div className={`text-5xl ${isLocked ? "grayscale opacity-50" : "animate-pulse"}`}>{badge.image}</div>
        </div>
        <CardTitle className="text-lg">{badge.name}</CardTitle>
        <CardDescription>{badge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("progress")}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 mt-2">
            <Info className="h-4 w-4 mr-1" />
            <span>
              {points}/{badge.pointsRequired} {t("points_needed")}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Badge variant={badge.earned ? "default" : "outline"} className={badge.earned ? "animate-pulse" : ""}>
          {badge.earned ? t("unlocked") : t("locked")}
        </Badge>
      </CardFooter>
    </Card>
  )
}
