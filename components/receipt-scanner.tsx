"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Check, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { format } from "date-fns"
import type { Expense } from "@/types/finance"

// Improved OCR simulation with more realistic data extraction
const processReceiptImage = async (imageUrl: string) => {
  // In a real app, this would use Tesseract.js to extract text from the image
  // For demo purposes, we'll simulate a delay and return more realistic data
  return new Promise<{
    merchantName: string
    date: string
    total: number
    items: { name: string; price: number }[]
    category: string
    confidence: number
  }>((resolve) => {
    setTimeout(() => {
      // Generate random but realistic receipt data
      const merchants = [
        "Walmart",
        "Target",
        "Kroger",
        "Safeway",
        "Whole Foods",
        "CVS Pharmacy",
        "Walgreens",
        "Shell",
        "Exxon",
        "Chevron",
        "Starbucks",
        "McDonald's",
        "Subway",
        "Chipotle",
        "Panera Bread",
      ]

      const categories = {
        Walmart: "Shopping",
        Target: "Shopping",
        Kroger: "Food",
        Safeway: "Food",
        "Whole Foods": "Food",
        "CVS Pharmacy": "Healthcare",
        Walgreens: "Healthcare",
        Shell: "Transportation",
        Exxon: "Transportation",
        Chevron: "Transportation",
        Starbucks: "Food",
        "McDonald's": "Food",
        Subway: "Food",
        Chipotle: "Food",
        "Panera Bread": "Food",
      }

      const foodItems = [
        "Milk",
        "Bread",
        "Eggs",
        "Cheese",
        "Chicken",
        "Beef",
        "Rice",
        "Pasta",
        "Cereal",
        "Vegetables",
        "Fruit",
      ]
      const shoppingItems = ["T-shirt", "Jeans", "Socks", "Towels", "Detergent", "Soap", "Shampoo", "Toothpaste"]
      const healthcareItems = ["Vitamins", "Pain Reliever", "Cold Medicine", "Band-Aids", "First Aid Kit"]
      const transportationItems = ["Gasoline", "Oil Change", "Car Wash"]

      const merchantName = merchants[Math.floor(Math.random() * merchants.length)]
      const category = categories[merchantName as keyof typeof categories]

      const items: { name: string; price: number }[] = []

      // Generate items based on category
      if (category === "Food") {
        const numItems = Math.floor(Math.random() * 5) + 1
        for (let i = 0; i < numItems; i++) {
          const item = foodItems[Math.floor(Math.random() * foodItems.length)]
          const price = Number.parseFloat((Math.random() * 10 + 1).toFixed(2))
          items.push({ name: item, price })
        }
      } else if (category === "Shopping") {
        const numItems = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < numItems; i++) {
          const item = shoppingItems[Math.floor(Math.random() * shoppingItems.length)]
          const price = Number.parseFloat((Math.random() * 20 + 5).toFixed(2))
          items.push({ name: item, price })
        }
      } else if (category === "Healthcare") {
        const numItems = Math.floor(Math.random() * 2) + 1
        for (let i = 0; i < numItems; i++) {
          const item = healthcareItems[Math.floor(Math.random() * healthcareItems.length)]
          const price = Number.parseFloat((Math.random() * 15 + 3).toFixed(2))
          items.push({ name: item, price })
        }
      } else if (category === "Transportation") {
        const item = transportationItems[Math.floor(Math.random() * transportationItems.length)]
        const price = Number.parseFloat((Math.random() * 40 + 20).toFixed(2))
        items.push({ name: item, price })
      }

      // Calculate total
      const total = items.reduce((sum, item) => sum + item.price, 0)

      // Generate a random date within the last 7 days
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 7))

      resolve({
        merchantName,
        date: date.toISOString(),
        total: Number.parseFloat(total.toFixed(2)),
        items,
        category,
        confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
      })
    }, 1500)
  })
}

interface ReceiptScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanComplete: (expense: Expense) => void
  userId: string
}

export function ReceiptScanner({ open, onOpenChange, onScanComplete, userId }: ReceiptScannerProps) {
  const [step, setStep] = useState<"upload" | "processing" | "review">("upload")
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResults, setScanResults] = useState<{
    merchantName: string
    date: string
    total: number
    items: { name: string; price: number }[]
    category: string
    confidence: number
  } | null>(null)
  const [expenseData, setExpenseData] = useState<{
    amount: number
    category: string
    date: string
    note: string
  }>({
    amount: 0,
    category: "",
    date: new Date().toISOString(),
    note: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  useEffect(() => {
    const dropZone = dropZoneRef.current
    if (!dropZone) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dropZone.classList.add("border-blue-500")
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dropZone.classList.remove("border-blue-500")
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dropZone.classList.remove("border-blue-500")

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith("image/")) {
          handleFile(file)
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload an image file (JPG, PNG, etc.)",
            variant: "destructive",
          })
        }
      }
    }

    dropZone.addEventListener("dragover", handleDragOver)
    dropZone.addEventListener("dragleave", handleDragLeave)
    dropZone.addEventListener("drop", handleDrop)

    return () => {
      dropZone.removeEventListener("dragover", handleDragOver)
      dropZone.removeEventListener("dragleave", handleDragLeave)
      dropZone.removeEventListener("drop", handleDrop)
    }
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string)
      processReceipt(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const processReceipt = async (imageUrl: string) => {
    setStep("processing")
    setIsProcessing(true)

    try {
      // Process the receipt image using OCR
      const results = await processReceiptImage(imageUrl)
      setScanResults(results)

      // Set the expense data based on OCR results
      setExpenseData({
        amount: results.total,
        category: results.category,
        date: results.date,
        note: `Receipt from ${results.merchantName}: ${results.items.map((item) => item.name).join(", ")}`,
      })

      setStep("review")
    } catch (error) {
      toast({
        title: "Error processing receipt",
        description: "There was an error processing your receipt. Please try again.",
        variant: "destructive",
      })
      setStep("upload")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = () => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: expenseData.amount,
      category: expenseData.category,
      date: expenseData.date,
      note: expenseData.note,
      userId,
      receiptImage,
    }

    onScanComplete(newExpense)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setStep("upload")
    setReceiptImage(null)
    setScanResults(null)
    setExpenseData({
      amount: 0,
      category: "",
      date: new Date().toISOString(),
      note: "",
    })
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Scan Receipt</DialogTitle>
          <DialogDescription>Upload a receipt image to automatically extract expense details.</DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div
              ref={dropZoneRef}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-8 w-8 text-slate-400" />
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Click to upload a receipt image or drag and drop
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">Supports JPG, PNG, HEIC</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                capture="environment"
              />
            </div>

            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              We&apos;ll use OCR technology to extract the date, amount, and merchant information from your receipt.
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <div className="text-center">
              <div className="font-medium">Processing your receipt</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">This may take a few moments...</div>
            </div>
          </div>
        )}

        {step === "review" && scanResults && (
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              {receiptImage && (
                <div className="relative flex-shrink-0">
                  <img
                    src={receiptImage || "/placeholder.svg"}
                    alt="Receipt"
                    className="w-24 h-32 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setReceiptImage(null)
                      setStep("upload")
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={expenseData.amount}
                    onChange={(e) => setExpenseData({ ...expenseData, amount: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={expenseData.category}
                    onValueChange={(value) => setExpenseData({ ...expenseData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Housing">Housing</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={format(new Date(expenseData.date), "yyyy-MM-dd")}
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      if (!isNaN(date.getTime())) {
                        setExpenseData({ ...expenseData, date: date.toISOString() })
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Input
                    id="note"
                    value={expenseData.note}
                    onChange={(e) => setExpenseData({ ...expenseData, note: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
              <div className="font-medium text-slate-700 dark:text-slate-300">Detected Information:</div>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Merchant: {scanResults.merchantName}</li>
                <li>Date: {new Date(scanResults.date).toLocaleDateString()}</li>
                <li>
                  Items:
                  <ul className="list-disc list-inside ml-4">
                    {scanResults.items.map((item, index) => (
                      <li key={index}>
                        {item.name}: {formatCurrency(item.price)}
                      </li>
                    ))}
                  </ul>
                </li>
                <li>Confidence: {Math.round(scanResults.confidence * 100)}%</li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "processing" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Rescan
              </Button>
              <Button onClick={handleSubmit}>
                <Check className="mr-2 h-4 w-4" />
                Save Expense
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
