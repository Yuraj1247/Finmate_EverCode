"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, UserPlus, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/types/finance"

export function SignupForm({ onToggleForm }: { onToggleForm: () => void }) {
  const [formData, setFormData] = useState<Omit<User, "id" | "createdAt">>({
    fullName: "",
    email: "",
    password: "",
    age: 0,
    hobby: "",
    profession: "",
    language: "en",
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { signup } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "number" ? Number.parseInt(value) || 0 : value,
    })
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string)
        setFormData({
          ...formData,
          profilePicture: event.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await signup(formData)

      if (result.success) {
        toast({
          title: "Signup successful",
          description: "Welcome to FinMate!",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Signup failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your details to get started with FinMate</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePicture || ""} alt="Profile" />
                <AvatarFallback className="text-lg">{formData.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
              {profilePicture && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => {
                    setProfilePicture(null)
                    setFormData({
                      ...formData,
                      profilePicture: undefined,
                    })
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="0"
                placeholder="25"
                value={formData.age || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                name="profession"
                placeholder="Software Engineer"
                value={formData.profession}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hobby">Hobby</Label>
            <Input
              id="hobby"
              name="hobby"
              placeholder="Reading, Gaming, etc."
              value={formData.hobby}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
            <UserPlus className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={onToggleForm}>
              Login
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
