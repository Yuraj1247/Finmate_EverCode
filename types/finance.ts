export interface Expense {
  id: string
  amount: number
  category: string
  date: string
  note: string
  userId: string
  receiptImage?: string | null
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
  userId: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  points: number
  completed: boolean
  category: "weekly" | "monthly"
  gameType?: "coin" | "quiz" | "debt" | "obstacle" | "tetris" | "ninja" | "farm"
  walletReward?: number
  streakRequired?: number
  currentStreak?: number
  userId?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  image: string
  earned: boolean
  pointsRequired: number
  userId?: string
}

export interface User {
  id: string
  email: string
  password: string
  fullName: string
  age: number
  hobby: string
  profession: string
  profilePicture?: string
  language?: string
  createdAt: string
}

export interface Receipt {
  id: string
  userId: string
  imageUrl: string
  extractedData: {
    date?: string
    total?: number
    merchant?: string
    items?: Array<{
      name: string
      price: number
      quantity?: number
    }>
    category?: string
  }
  processed: boolean
  expenseId?: string
}

export interface Account {
  id: string
  userId: string
  name: string
  type: "checking" | "savings" | "credit" | "investment"
  balance: number
  institution: string
  lastUpdated: string
}

export interface LanguageOption {
  code: string
  name: string
  flag: string
}

export interface GameState {
  score: number
  level: number
  lives: number
  gameOver: boolean
  paused: boolean
}

export interface GameConfig {
  challengeId: string
  difficulty: "easy" | "medium" | "hard"
  targetScore: number
  timeLimit: number
}

export interface Income {
  id: string
  userId: string
  amount: number
  source: string
  description: string
  date: string
}

export interface Budget {
  id: string
  userId: string
  category: string
  limit: number
  period: "daily" | "weekly" | "monthly" | "yearly"
  startDate: string
  endDate?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  keywords: string[]
}

export interface FinancialTip {
  id: string
  category: string
  text: string
  severity: "info" | "warning" | "alert"
}

export interface ChatMessage {
  id: string
  userId: string
  content: string
  isUser: boolean
  timestamp: string
  relatedData?: {
    type: "expense" | "income" | "goal" | "budget"
    id: string
  }
}

export interface ExpenseClassification {
  category: string
  confidence: number
  keywords: string[]
}
