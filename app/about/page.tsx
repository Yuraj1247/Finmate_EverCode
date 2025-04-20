"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Users, Award, Shield, Lightbulb } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Info className="h-7 w-7 text-blue-500" />
                About FinMate
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Learn more about our mission and team</p>
            </div>
          </div>

          <Tabs defaultValue="mission" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="mission">
                <Lightbulb className="h-4 w-4 mr-2" />
                Mission
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="values">
                <Award className="h-4 w-4 mr-2" />
                Values
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mission">
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                  <CardDescription>Empowering financial well-being through technology</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    At FinMate, we believe that financial well-being should be accessible to everyone. Our mission is to
                    demystify personal finance and empower individuals to take control of their financial future through
                    intuitive technology and education.
                  </p>
                  <p>
                    We're committed to building tools that make budgeting, saving, and financial planning simple and
                    even enjoyable. By combining cutting-edge technology with behavioral insights, we help our users
                    develop healthy financial habits that last a lifetime.
                  </p>
                  <p>
                    Our vision is a world where financial stress is reduced, and everyone has the knowledge and tools
                    they need to achieve their financial goals, whether that's saving for a vacation, buying a home, or
                    planning for retirement.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Shield className="h-5 w-5 text-blue-500 mr-2" />
                        Simplicity
                      </h3>
                      <p className="text-sm">
                        We make complex financial concepts simple and accessible through intuitive design.
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Lightbulb className="h-5 w-5 text-green-500 mr-2" />
                        Education
                      </h3>
                      <p className="text-sm">We empower users with knowledge to make informed financial decisions.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Award className="h-5 w-5 text-purple-500 mr-2" />
                        Innovation
                      </h3>
                      <p className="text-sm">
                        We continuously innovate to provide cutting-edge financial tools and insights.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Our Team</CardTitle>
                  <CardDescription>Meet the people behind FinMate,Developed by Team EverCode</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 mb-4"></div>
                      <h3 className="font-medium">Yuraj Chinarathod</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Team EverCode</p>
                      <p className="text-sm mt-2">Team Leader</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="values">
              <Card>
                <CardHeader>
                  <CardTitle>Our Values</CardTitle>
                  <CardDescription>The principles that guide everything we do</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">User-Centered Design</h3>
                    <p>
                      We put our users at the center of everything we build. By deeply understanding their needs,
                      challenges, and goals, we create solutions that truly make a difference in their financial lives.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Financial Empowerment</h3>
                    <p>
                      We believe that knowledge is power. That's why we're committed to not just providing tools, but
                      also education that helps our users make informed financial decisions with confidence.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Transparency</h3>
                    <p>
                      We're open and honest about how our products work, how we use data, and how we make money. We
                      believe that trust is the foundation of any financial relationship.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Inclusivity</h3>
                    <p>
                      Financial well-being should be accessible to everyone, regardless of their background or starting
                      point. We design our products to be inclusive and adaptable to diverse financial situations.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Continuous Innovation</h3>
                    <p>
                      The financial landscape is always evolving, and so are we. We're committed to continuous
                      improvement and innovation to provide our users with the best possible tools and experiences.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
