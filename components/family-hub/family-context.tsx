"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

export interface FamilyMember {
  id: string
  name: string
  role: "parent" | "child"
  balance: number
  avatar?: string
}

export interface FamilyTask {
  id: string
  title: string
  description: string
  assignedTo: string
  value: number
  completed: boolean
  dueDate: string
  proofRequired: boolean
  proofSubmitted?: string
  approved?: boolean
}

export interface FamilyGoal {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  completed: boolean
  contributions: Record<string, number>
}

interface FamilyContextType {
  members: FamilyMember[]
  tasks: FamilyTask[]
  goals: FamilyGoal[]
  currentUser: FamilyMember | null
  setCurrentUser: (user: FamilyMember | null) => void
  addMember: (member: Omit<FamilyMember, "id">) => void
  updateMember: (id: string, updates: Partial<FamilyMember>) => void
  removeMember: (id: string) => void
  addTask: (task: Omit<FamilyTask, "id">) => void
  updateTask: (id: string, updates: Partial<FamilyTask>) => void
  removeTask: (id: string) => void
  completeTask: (id: string, proof?: string) => void
  approveTask: (id: string, approved: boolean) => void
  addGoal: (goal: Omit<FamilyGoal, "id" | "contributions" | "currentAmount" | "completed">) => void
  updateGoal: (id: string, updates: Partial<FamilyGoal>) => void
  removeGoal: (id: string) => void
  contributeToGoal: (goalId: string, memberId: string, amount: number) => void
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useLocalStorage<FamilyMember[]>("family-members", [])
  const [tasks, setTasks] = useLocalStorage<FamilyTask[]>("family-tasks", [])
  const [goals, setGoals] = useLocalStorage<FamilyGoal[]>("family-goals", [])
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null)

  // Initialize with demo data if empty
  useEffect(() => {
    if (members.length === 0) {
      const demoMembers: FamilyMember[] = [
        { id: "parent1", name: "Parent", role: "parent", balance: 5000 },
        { id: "child1", name: "Child", role: "child", balance: 500 },
      ]
      setMembers(demoMembers)
      setCurrentUser(demoMembers[0])
    } else {
      setCurrentUser(members[0])
    }

    if (tasks.length === 0) {
      const demoTasks: FamilyTask[] = [
        {
          id: "task1",
          title: "Clean your room",
          description: "Make your bed and organize your desk",
          assignedTo: "child1",
          value: 50,
          completed: false,
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          proofRequired: true,
        },
      ]
      setTasks(demoTasks)
    }

    if (goals.length === 0) {
      const demoGoals: FamilyGoal[] = [
        {
          id: "goal1",
          name: "Family Vacation",
          description: "Trip to the beach this summer",
          targetAmount: 5000,
          currentAmount: 1000,
          deadline: new Date(Date.now() + 7776000000).toISOString(),
          completed: false,
          contributions: {
            parent1: 800,
            child1: 200,
          },
        },
      ]
      setGoals(demoGoals)
    }
  }, [members, tasks, goals, setMembers, setTasks, setGoals])

  const addMember = (member: Omit<FamilyMember, "id">) => {
    const newMember = {
      ...member,
      id: crypto.randomUUID(),
    }
    setMembers([...members, newMember])
  }

  const updateMember = (id: string, updates: Partial<FamilyMember>) => {
    setMembers(members.map((member) => (member.id === id ? { ...member, ...updates } : member)))
  }

  const removeMember = (id: string) => {
    setMembers(members.filter((member) => member.id !== id))
  }

  const addTask = (task: Omit<FamilyTask, "id">) => {
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (id: string, updates: Partial<FamilyTask>) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const completeTask = (id: string, proof?: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: true,
              proofSubmitted: proof,
            }
          : task,
      ),
    )
  }

  const approveTask = (id: string, approved: boolean) => {
    const task = tasks.find((t) => t.id === id)

    if (task && approved) {
      // Find the assigned member and update their balance
      const assignedMember = members.find((m) => m.id === task.assignedTo)

      if (assignedMember) {
        updateMember(assignedMember.id, {
          balance: assignedMember.balance + task.value,
        })
      }
    }

    setTasks(tasks.map((task) => (task.id === id ? { ...task, approved } : task)))
  }

  const addGoal = (goal: Omit<FamilyGoal, "id" | "contributions" | "currentAmount" | "completed">) => {
    const newGoal = {
      ...goal,
      id: crypto.randomUUID(),
      currentAmount: 0,
      completed: false,
      contributions: {},
    }
    setGoals([...goals, newGoal])
  }

  const updateGoal = (id: string, updates: Partial<FamilyGoal>) => {
    setGoals(goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)))
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const contributeToGoal = (goalId: string, memberId: string, amount: number) => {
    const goal = goals.find((g) => g.id === goalId)
    const member = members.find((m) => m.id === memberId)

    if (!goal || !member || member.balance < amount) return

    // Update member balance
    updateMember(memberId, {
      balance: member.balance - amount,
    })

    // Update goal
    const newContributions = {
      ...goal.contributions,
      [memberId]: (goal.contributions[memberId] || 0) + amount,
    }

    const newCurrentAmount = goal.currentAmount + amount
    const completed = newCurrentAmount >= goal.targetAmount

    updateGoal(goalId, {
      currentAmount: newCurrentAmount,
      completed,
      contributions: newContributions,
    })
  }

  return (
    <FamilyContext.Provider
      value={{
        members,
        tasks,
        goals,
        currentUser,
        setCurrentUser,
        addMember,
        updateMember,
        removeMember,
        addTask,
        updateTask,
        removeTask,
        completeTask,
        approveTask,
        addGoal,
        updateGoal,
        removeGoal,
        contributeToGoal,
      }}
    >
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const context = useContext(FamilyContext)
  if (context === undefined) {
    throw new Error("useFamily must be used within a FamilyProvider")
  }
  return context
}
