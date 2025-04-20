"use client"

import { useState } from "react"
import { Plus, Link, Unlink, CreditCard, Building, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatCurrency } from "@/lib/utils"
import type { Account } from "@/types/finance"

interface AccountLinkingProps {
  userId: string
}

export function AccountLinking({ userId }: AccountLinkingProps) {
  const [accounts, setAccounts] = useLocalStorage<Account[]>(`accounts_${userId}`, [])
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    balance: 0,
  })
  const { toast } = useToast()

  const handleChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSubmit = () => {
    const newAccount: Account = {
      id: crypto.randomUUID(),
      name: formData.name,
      type: formData.type as "checking" | "savings" | "credit",
      balance: formData.balance,
      userId,
    }

    setAccounts([...accounts, newAccount])
    setShowLinkDialog(false)
    setFormData({
      name: "",
      type: "checking",
      balance: 0,
    })

    toast({
      title: "Account linked",
      description: `${newAccount.name} has been successfully linked to your profile.`,
    })
  }

  const handleUnlink = (id: string) => {
    setAccounts(accounts.filter((account) => account.id !== id))
    toast({
      title: "Account unlinked",
      description: "The account has been removed from your profile.",
    })
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <Building className="h-5 w-5 text-blue-500" />
      case "savings":
        return <Wallet className="h-5 w-5 text-green-500" />
      case "credit":
        return <CreditCard className="h-5 w-5 text-purple-500" />
      default:
        return <Building className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {getAccountIcon(account.type)}
                  <CardTitle className="ml-2 text-lg">{account.name}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleUnlink(account.id)} title="Unlink account">
                  <Unlink className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{account.type.charAt(0).toUpperCase() + account.type.slice(1)} Account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Current Balance</div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed">
          <CardContent className="p-6">
            <div
              className="flex flex-col items-center justify-center h-full cursor-pointer"
              onClick={() => setShowLinkDialog(true)}
            >
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="font-medium text-slate-700 dark:text-slate-300">Link a New Account</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
                Connect your bank accounts to track your finances in one place
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Link a New Account</DialogTitle>
            <DialogDescription>Enter your account details to connect it to FinMate.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., Chase Checking"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Account Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.balance}
                onChange={(e) => handleChange("balance", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>
              <Link className="mr-2 h-4 w-4" />
              Link Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
