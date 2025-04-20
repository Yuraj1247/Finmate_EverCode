import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, showSymbol = true): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: showSymbol ? "currency" : "decimal",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}
