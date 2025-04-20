"use client"

import { useState } from "react"
import { Users, Target, CheckSquare, Wallet, Plus, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { FamilyProvider, useFamily } from "@/components/family-hub/family-context"
import { formatCurrency } from "@/lib/utils"

function FamilyMembersList() {
  const { members, currentUser, setCurrentUser } = useFamily()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 text-blue-500 mr-2" />
          Family Members
        </CardTitle>
        <CardDescription>Select a family member to view their dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <Button
              key={member.id}
              variant={currentUser?.id === member.id ? "default" : "outline"}
              className="w-full justify-start h-auto py-3"
              onClick={() => setCurrentUser(member)}
            >
              <div className="flex items-center w-full">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-3">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {member.role === "parent" ? "Parent" : "Child"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Balance: {formatCurrency(member.balance)}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Family Member
        </Button>
      </CardFooter>
    </Card>
  )
}

function FamilyGoalsList() {
  const { goals, currentUser, contributeToGoal } = useFamily()
  const [contributionAmount, setContributionAmount] = useState<Record<string, string>>({})

  const handleContribute = (goalId: string) => {
    const amount = Number.parseFloat(contributionAmount[goalId] || "0")
    if (amount > 0 && currentUser) {
      contributeToGoal(goalId, currentUser.id, amount)
      setContributionAmount({
        ...contributionAmount,
        [goalId]: "",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 text-green-500 mr-2" />
          Family Goals
        </CardTitle>
        <CardDescription>Work together to achieve shared financial goals</CardDescription>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <Target className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No family goals yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100)
              const myContribution = currentUser ? goal.contributions[currentUser.id] || 0 : 0

              return (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{goal.name}</h3>
                    <span className="text-sm font-bold">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{goal.description}</p>

                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-2">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>{progress}% complete</span>
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>

                  <div className="text-xs mb-3">
                    <span className="font-medium">Your contribution:</span> {formatCurrency(myContribution)}
                  </div>

                  {!goal.completed && currentUser && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amount"
                        className="flex-1 px-3 py-1 text-sm border rounded"
                        value={contributionAmount[goal.id] || ""}
                        onChange={(e) =>
                          setContributionAmount({
                            ...contributionAmount,
                            [goal.id]: e.target.value,
                          })
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() => handleContribute(goal.id)}
                        disabled={!contributionAmount[goal.id] || Number.parseFloat(contributionAmount[goal.id]) <= 0}
                      >
                        Contribute
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Goal
        </Button>
      </CardFooter>
    </Card>
  )
}

function FamilyTasksList() {
  const { tasks, currentUser, completeTask, approveTask } = useFamily()

  // Filter tasks based on current user role
  const filteredTasks =
    currentUser?.role === "parent"
      ? tasks // Parents see all tasks
      : tasks.filter((task) => task.assignedTo === currentUser?.id) // Children see only their tasks

  const pendingApproval = tasks.filter((task) => task.completed && !task.approved && task.proofRequired)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckSquare className="h-5 w-5 text-purple-500 mr-2" />
          {currentUser?.role === "parent" ? "Assign Tasks" : "My Tasks"}
        </CardTitle>
        <CardDescription>
          {currentUser?.role === "parent"
            ? "Assign tasks to family members to earn money"
            : "Complete tasks to earn money"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6">
            <CheckSquare className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No tasks available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const isAssignedToMe = currentUser?.id === task.assignedTo
              const canComplete = isAssignedToMe && !task.completed
              const canApprove = currentUser?.role === "parent" && task.completed && !task.approved

              return (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <span className="font-bold">{formatCurrency(task.value)}</span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{task.description}</p>

                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        task.approved
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : task.completed
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {task.approved ? "Completed" : task.completed ? "Pending Approval" : "Open"}
                    </span>
                  </div>

                  {canComplete && (
                    <Button size="sm" className="w-full" onClick={() => completeTask(task.id)}>
                      Mark as Complete
                    </Button>
                  )}

                  {canApprove && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => approveTask(task.id, false)}
                      >
                        Reject
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => approveTask(task.id, true)}>
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pending Approvals Section for Parents */}
        {currentUser?.role === "parent" && pendingApproval.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Pending Approvals</h3>
            <div className="space-y-3">
              {pendingApproval.map((task) => {
                const assignedTo = task.assignedTo
                const member = assignedTo
                  ? { name: "Child" } // In a real app, you'd look up the member name
                  : null

                return (
                  <div key={task.id} className="border rounded-lg p-3 bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <span>{member?.name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => approveTask(task.id, false)}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => approveTask(task.id, true)}>
                        Approve ({formatCurrency(task.value)})
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {currentUser?.role === "parent" && (
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create New Task
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function FamilyDashboard() {
  const { currentUser } = useFamily()
  const [activeTab, setActiveTab] = useState("overview")

  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome to Family Hub</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Select a family member to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300 mr-4">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentUser.name}'s Dashboard</h2>
              <p className="text-slate-500 dark:text-slate-400">
                {currentUser.role === "parent" ? "Parent Account" : "Child Account"}
              </p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-slate-500 dark:text-slate-400">Available Balance</div>
              <div className="text-2xl font-bold">{formatCurrency(currentUser.balance)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Wallet className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FamilyMembersList />

            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Recent family financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3 p-3 border-l-4 border-green-500">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Task Completed</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Child earned {formatCurrency(50)} for completing "Clean your room"
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Today, 10:30 AM</p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 border-l-4 border-blue-500">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Goal Contribution</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Parent contributed {formatCurrency(200)} to "Family Vacation"
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Yesterday, 3:15 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <FamilyTasksList />
        </TabsContent>

        <TabsContent value="goals">
          <FamilyGoalsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function FamilyHubPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="h-7 w-7 text-blue-500" />
                Family Finance Hub
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Manage your family's finances together</p>
            </div>
          </div>

          <FamilyProvider>
            <FamilyDashboard />
          </FamilyProvider>
        </div>
      </main>
    </div>
  )
}
