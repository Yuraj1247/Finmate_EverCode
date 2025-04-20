"use client"

import { Button } from "@/components/ui/button"
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
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  income: z.coerce.number().nonnegative("Income must be zero or positive"),
})

type FormValues = z.infer<typeof formSchema>

interface IncomeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentIncome: number
  onSubmit: (income: number) => void
}

export function IncomeForm({ open, onOpenChange, currentIncome, onSubmit }: IncomeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: currentIncome,
    },
  })

  const handleSubmit = (values: FormValues) => {
    onSubmit(values.income)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Income</DialogTitle>
          <DialogDescription>Enter your monthly income to track your budget.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Update Income</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
