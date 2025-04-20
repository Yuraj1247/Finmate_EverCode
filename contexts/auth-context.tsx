"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/finance"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (userData: Omit<User, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Get all users from localStorage
    const usersJson = localStorage.getItem("users")
    const users: User[] = usersJson ? JSON.parse(usersJson) : []

    // Find user with matching email and password
    const foundUser = users.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      // Store current user in localStorage
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      setUser(foundUser)
      return { success: true, message: "Login successful" }
    }

    return { success: false, message: "Invalid email or password" }
  }

  const signup = async (userData: Omit<User, "id" | "createdAt">) => {
    // Get all users from localStorage
    const usersJson = localStorage.getItem("users")
    const users: User[] = usersJson ? JSON.parse(usersJson) : []

    // Check if email already exists
    const existingUser = users.find((u) => u.email === userData.email)
    if (existingUser) {
      return { success: false, message: "Email already in use" }
    }

    // Create new user
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    // Add new user to users array
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // Set current user
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    setUser(newUser)

    return { success: true, message: "Signup successful" }
  }

  const logout = () => {
    localStorage.removeItem("currentUser")
    setUser(null)
    router.push("/")
  }

  const updateUser = (userData: Partial<User>) => {
    if (!user) return

    // Update user in state
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)

    // Update user in localStorage
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))

    // Update user in users array
    const usersJson = localStorage.getItem("users")
    const users: User[] = usersJson ? JSON.parse(usersJson) : []
    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u))
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
