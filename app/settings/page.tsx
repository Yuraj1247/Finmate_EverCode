"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Moon, Sun, Trash2, Send, LogOut, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { useTheme } from "@/components/theme-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export default function SettingsPage() {
  const { toast } = useToast()
  const { user, updateUser, logout } = useAuth()
  const { translate } = useLanguage()
  const [newUsername, setNewUsername] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (user) {
      setNewUsername(user.fullName || "")
      setProfileImage(user.profilePicture || null)
    }
  }, [user])

  const handleUpdateUsername = () => {
    if (newUsername.trim() && user) {
      updateUser({ fullName: newUsername.trim() })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    }
  }

  const handleResetData = () => {
    // Confirm before resetting
    if (window.confirm("Are you sure you want to reset all your data? This action cannot be undone.")) {
      // Clear all localStorage data for this user
      if (user) {
        localStorage.removeItem(`income_${user.id}`)
        localStorage.removeItem(`expenses_${user.id}`)
        localStorage.removeItem(`goals_${user.id}`)
      }

      toast({
        title: "Data reset",
        description: "All your data has been reset successfully",
        variant: "destructive",
      })

      // Reload the page to reset state
      window.location.reload()
    }
  }

  const handleSubmitFeedback = () => {
    if (feedbackMessage.trim()) {
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })
      setFeedbackMessage("")
    } else {
      toast({
        title: "Error",
        description: "Please enter your feedback before submitting",
        variant: "destructive",
      })
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setProfileImage(imageUrl)
        if (user) {
          updateUser({ profilePicture: imageUrl })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />

        <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{translate("settings")}</h1>
              <p className="text-slate-500 dark:text-slate-400">{translate("manage_settings")}</p>
            </div>

            <div className="space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>{translate("profile")}</CardTitle>
                  <CardDescription>{translate("update_profile")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileImage || ""} alt={user?.fullName || "User"} />
                        <AvatarFallback className="text-2xl">{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageChange}
                        />
                      </label>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">{user?.fullName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{translate("full_name")}</Label>
                      <Input
                        id="fullName"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{translate("email")}</Label>
                      <Input id="email" value={user?.email || ""} disabled className="bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profession">{translate("profession")}</Label>
                      <Input
                        id="profession"
                        value={user?.profession || ""}
                        onChange={(e) => updateUser({ profession: e.target.value })}
                        placeholder="Enter your profession"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hobby">{translate("hobby")}</Label>
                      <Input
                        id="hobby"
                        value={user?.hobby || ""}
                        onChange={(e) => updateUser({ hobby: e.target.value })}
                        placeholder="Enter your hobby"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">{translate("age")}</Label>
                      <Input
                        id="age"
                        type="number"
                        value={user?.age || ""}
                        onChange={(e) => updateUser({ age: Number.parseInt(e.target.value) || 0 })}
                        placeholder="Enter your age"
                      />
                    </div>
                  </div>

                  <Button onClick={handleUpdateUsername}>{translate("save")}</Button>
                </CardContent>
              </Card>

              {/* Theme Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>{translate("appearance")}</CardTitle>
                  <CardDescription>{translate("customize_appearance")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {theme === "dark" ? (
                        <Moon className="h-5 w-5 text-slate-500" />
                      ) : (
                        <Sun className="h-5 w-5 text-amber-500" />
                      )}
                      <span>{translate("dark_mode")}</span>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => {
                        toggleTheme()
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{translate("feedback")}</CardTitle>
                  <CardDescription>{translate("help_improve")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback">{translate("your_feedback")}</Label>
                    <Textarea
                      id="feedback"
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder={translate("feedback_placeholder")}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSubmitFeedback}>
                    <Send className="mr-2 h-4 w-4" />
                    {translate("submit_feedback")}
                  </Button>
                </CardFooter>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle>{translate("data_management")}</CardTitle>
                  <CardDescription>{translate("manage_data")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{translate("data_stored_locally")}</p>
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <Button variant="destructive" onClick={handleResetData}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {translate("reset_data")}
                    </Button>
                    <Button variant="outline" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {translate("logout")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
