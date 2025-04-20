"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Target, Trophy, Calendar, Trash2, Gamepad, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { GoalForm } from "@/components/goal-form"
import { GoalVisualizer3D } from "./3d-goal-visualizer"
import { IslandVisualizer } from "./island-visualizer"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Goal } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"

export default function GoalsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [goals, setGoals] = useLocalStorage<Goal[]>("goals", [])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [activeTab, setActiveTab] = useState("list")
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  const handleAddGoal = (goal: Goal) => {
    if (editingGoal) {
      // Update existing goal
      setGoals(goals.map((g) => (g.id === goal.id ? goal : g)))
      setEditingGoal(null)
      toast({
        title: "Goal updated",
        description: `Your goal "${goal.name}" has been updated`,
      })
    } else {
      // Add new goal
      setGoals([...goals, goal])
      toast({
        title: "Goal created",
        description: `Your new goal "${goal.name}" has been created`,
      })
    }
    setShowGoalForm(false)
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
    toast({
      title: "Goal deleted",
      description: "The goal has been removed from your records",
    })
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setShowGoalForm(true)
  }

  const handleContributeToGoal = (id: string, amount: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          const newCurrentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
          const completed = newCurrentAmount >= goal.targetAmount

          if (completed && newCurrentAmount === goal.targetAmount) {
            // Show celebration toast when goal is completed
            toast({
              title: "🎉 Goal Achieved!",
              description: `Congratulations! You've reached your goal: "${goal.name}"`,
              variant: "success",
            })
          }

          return {
            ...goal,
            currentAmount: newCurrentAmount,
            completed,
          }
        }
        return goal
      }),
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Savings Goals</h1>
              <p className="text-slate-500 dark:text-slate-400">Set and track your financial goals</p>
            </div>

            <Button
              onClick={() => {
                setEditingGoal(null)
                setShowGoalForm(true)
              }}
              className="mt-4 md:mt-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Goal
            </Button>
          </div>

          <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">
                <Target className="h-4 w-4 mr-2" />
                Goals List
              </TabsTrigger>
              <TabsTrigger value="islands">
                <Map className="h-4 w-4 mr-2" />
                Goal Islands
              </TabsTrigger>
              <TabsTrigger value="3d">
                <Gamepad className="h-4 w-4 mr-2" />
                3D Visualizer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {/* Goals Grid */}
              {goals.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                    <Target className="h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No goals yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Create your first savings goal to start tracking your progress
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingGoal(null)
                        setShowGoalForm(true)
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map((goal) => {
                    const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100)
                    const daysLeft = Math.max(
                      0,
                      Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
                    )

                    return (
                      <Card key={goal.id} className={goal.completed ? "border-green-500" : ""}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                            {goal.completed && (
                              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                                <Trophy className="h-3 w-3 mr-1" />
                                Completed
                              </div>
                            )}
                          </div>
                          <CardDescription>
                            {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>

                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                              <Calendar className="h-4 w-4 mr-1" />
                              {daysLeft > 0
                                ? `${daysLeft} days left`
                                : goal.completed
                                  ? "Goal achieved"
                                  : "Deadline passed"}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditGoal(goal)}>
                            Edit
                          </Button>

                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => {
                                // Simple modal to add contribution
                                const amount = Number.parseFloat(prompt("Enter contribution amount:", "0") || "0")
                                if (amount > 0) {
                                  handleContributeToGoal(goal.id, amount)
                                }
                              }}
                              disabled={goal.completed}
                            >
                              Contribute
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="islands">
              {goals.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                    <Map className="h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No goal islands yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Create your first savings goal to see it as a beautiful island
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingGoal(null)
                        setShowGoalForm(true)
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Goal Islands Map */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Financial Archipelago</CardTitle>
                      <CardDescription>Click on an island to view details and contribute</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {goals.map((goal) => {
                          const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100)
                          return (
                            <Button
                              key={goal.id}
                              variant="outline"
                              className={`h-auto p-4 flex flex-col items-center justify-center gap-2 ${
                                goal.completed ? "border-green-500" : ""
                              }`}
                              onClick={() => setSelectedGoal(goal)}
                            >
                              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                {goal.completed ? (
                                  <Trophy className="h-8 w-8 text-green-500" />
                                ) : (
                                  <Map className="h-8 w-8 text-blue-500" />
                                )}
                              </div>
                              <div className="text-center">
                                <h3 className="font-medium">{goal.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{progress}% complete</p>
                              </div>
                            </Button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Selected Island Visualizer */}
                  {selectedGoal && (
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{selectedGoal.name} Island</CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedGoal(null)}>
                            Back to Map
                          </Button>
                        </div>
                        <CardDescription>Watch your island grow as you progress toward your goal</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <IslandVisualizer
                          goal={selectedGoal}
                          onContribute={(amount) => handleContributeToGoal(selectedGoal.id, amount)}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="3d">
              {goals.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                    <Gamepad className="h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No goals to visualize</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Create your first savings goal to see it in 3D
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingGoal(null)
                        setShowGoalForm(true)
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>3D Goal Visualizer</CardTitle>
                    <CardDescription>Interact with your financial goals in 3D space</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GoalVisualizer3D goals={goals} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Forms */}
      <GoalForm open={showGoalForm} onOpenChange={setShowGoalForm} onSubmit={handleAddGoal} goal={editingGoal} />
    </div>
  )
}
