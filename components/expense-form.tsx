"use client"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Expense } from "@/types/finance"
// Import the EmotionTracker component
import { useState } from "react"
import { EmotionTracker } from "@/components/emotion-tracker"
import { useNotifications } from "@/hooks/use-notifications"

const expenseCategories = [
  "Food",
  "Housing",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Education",
  "Travel",
  "Other",
]

const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Please select a category"),
  date: z.date(),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (expense: Expense) => void
  expense?: Expense | null
}

export function ExpenseForm({ open, onOpenChange, onSubmit, expense }: ExpenseFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: expense?.amount || 0,
      category: expense?.category || "",
      date: expense?.date ? new Date(expense.date) : new Date(),
      note: expense?.note || "",
    },
  })

  // Add showEmotionTracker state inside the ExpenseForm component
  const [showEmotionTracker, setShowEmotionTracker] = useState(false)
  const [submittedExpense, setSubmittedExpense] = useState<Expense | null>(null)
  const { notificationService } = useNotifications()

  // Update the handleSubmit function to properly handle the flow
  // and fix the issue with the emotion tracker appearing behind the modal
  const handleSubmit = (values: FormValues) => {
    const newExpense: Expense = {
      id: expense?.id || crypto.randomUUID(),
      amount: values.amount,
      category: values.category,
      date: values.date.toISOString(),
      note: values.note || "",
    }

    // Close the expense modal first
    onOpenChange(false)

    // Then show the emotion tracker after a short delay
    setTimeout(() => {
      setSubmittedExpense(newExpense)
      setShowEmotionTracker(true)
    }, 100)
  }

  // Handle emotion tracker close
  const handleEmotionTrackerClose = (expense: Expense, mood?: string) => {
    setShowEmotionTracker(false)

    // Submit the expense
    onSubmit(expense)

    // Reset the form
    form.reset()

    // Create a notification for the new expense
    notificationService.expenseAdded(expense)

    // If mood was provided, create an emotional spending notification
    if (mood) {
      // Only show this occasionally to avoid spamming
      if (Math.random() < 0.3) {
        notificationService.emotionalSpending(mood, expense.category)
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
            <DialogDescription>
              {expense ? "Update the details of your expense." : "Enter the details of your expense."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add a note" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">{expense ? "Update Expense" : "Add Expense"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {showEmotionTracker && submittedExpense && (
        <EmotionTracker
          expenseId={submittedExpense.id}
          amount={submittedExpense.amount}
          category={submittedExpense.category}
          date={submittedExpense.date}
          onClose={(mood) => handleEmotionTrackerClose(submittedExpense, mood)}
        />
      )}
    </>
  )
}
