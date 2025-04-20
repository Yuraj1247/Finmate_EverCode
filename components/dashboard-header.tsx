"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Bell, BarChart2, PieChart, Target, Wallet, Settings, MessageSquare, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { LanguageSelector } from "@/components/language-selector"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export function DashboardHeader() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { user } = useAuth()
  const { translate } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const navigation = [
    { name: translate("dashboard"), href: "/dashboard", icon: BarChart2 },
    { name: translate("expenses"), href: "/expenses", icon: PieChart },
    { name: translate("goals"), href: "/goals", icon: Target },
    { name: translate("challenges"), href: "/challenges", icon: Wallet },
    { name: translate("emotion_insights"), href: "/emotion-insights", icon: Heart },
    { name: translate("finbot"), href: "/finbot", icon: MessageSquare },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">FinMate</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center transition-colors hover:text-foreground/80 ${
                  isActive(item.href) ? "text-foreground font-semibold" : "text-foreground/60"
                }`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/dashboard" className="flex items-center">
              <span className="font-bold">FinMate</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center text-sm font-medium transition-colors hover:text-foreground/80 ${
                      isActive(item.href) ? "text-foreground font-semibold" : "text-foreground/60"
                    }`}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2 md:hidden">
              <span className="font-bold inline-block">FinMate</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />

            {isMounted && (
              <>
                <Link href="/notifications">
                  <Button variant="outline" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                </Link>

                <Link href="/settings">
                  <Button variant="outline" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
