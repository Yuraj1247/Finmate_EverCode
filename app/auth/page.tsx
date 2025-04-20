"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { useAuth } from "@/contexts/auth-context"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()

  // Check if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // Check if we should show login or signup form based on query param
  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode === "signup") {
      setIsLogin(false)
    } else if (mode === "login") {
      setIsLogin(true)
    }
  }, [searchParams])

  const toggleForm = () => {
    setIsLogin(!isLogin)
    // Update URL without refreshing the page
    const newMode = !isLogin ? "login" : "signup"
    const url = new URL(window.location.href)
    url.searchParams.set("mode", newMode)
    window.history.pushState({}, "", url.toString())
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              FinMate
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Your smart budget buddy</p>
          </div>

          {isLogin ? <LoginForm onToggleForm={toggleForm} /> : <SignupForm onToggleForm={toggleForm} />}
        </div>
      </div>
    </div>
  )
}
