"use client"

import type React from "react"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon.",
      })
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Mail className="h-7 w-7 text-blue-500" />
                Contact Us
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Get in touch with the FinMate team</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        Thank you for reaching out. We've received your message and will get back to you shortly.
                      </p>
                      <Button className="mt-6" onClick={() => setIsSubmitted(false)}>
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Name
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Your email address"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What is your message about?"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="How can we help you?"
                          rows={5}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Ways to reach the FinMate team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">support@finmate.com</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">info@finmate.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">+91 1234567890</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Mon-Fri, 9am-5pIST</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Office</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">123 Finance Street</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">India</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full h-40 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>FAQ</CardTitle>
                  <CardDescription>Common questions about FinMate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Is FinMate free to use?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Yes, FinMate offers a free basic plan with core features. Premium features are available with a
                      subscription.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">How secure is my financial data?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      We use bank-level encryption to protect your data and never share it with third parties without
                      your consent.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Can I export my financial data?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Yes, you can export your data in CSV or PDF format from the settings page.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
