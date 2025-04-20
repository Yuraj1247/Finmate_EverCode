"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

type ThemeProviderState = {
  theme: string
  setTheme: (theme: string) => void
  toggleTheme: () => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<string>("dark")

  useEffect(() => {
    // Get stored theme from localStorage or use default (dark)
    const storedTheme = localStorage.getItem("theme") || "dark"
    setTheme(storedTheme)
    document.documentElement.classList.toggle("dark", storedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <NextThemesProvider {...props} enableSystem={false} attribute="class" defaultTheme="dark" forcedTheme={theme}>
        {children}
      </NextThemesProvider>
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
