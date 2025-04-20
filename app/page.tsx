import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            FinMate
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/auth?mode=login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/auth?mode=signup">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    Take Control of Your Finances
                  </h1>
                  <p className="max-w-[600px] text-slate-700 md:text-xl dark:text-slate-400">
                    FinMate helps you track expenses, set budgets, and achieve your financial goals with smart insights
                    and easy-to-use tools.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth?mode=signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">Start Budgeting</Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  alt="FinMate Dashboard Preview"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                  src="/placeholder.svg?height=550&width=800"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-slate-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-sm dark:bg-slate-700">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Everything You Need to Manage Your Money
                </h2>
                <p className="max-w-[900px] text-slate-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-slate-400">
                  FinMate combines powerful budgeting tools with intelligent insights to help you make better financial
                  decisions.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 dark:border-slate-700">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Expense Tracking</h3>
                <p className="text-center text-sm text-slate-700 dark:text-slate-400">
                  Easily log and categorize your expenses to see where your money is going.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 dark:border-slate-700">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Visual Analytics</h3>
                <p className="text-center text-sm text-slate-700 dark:text-slate-400">
                  Interactive charts and graphs help you visualize your spending patterns.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 dark:border-slate-700">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 20h20" />
                    <path d="M5 20V8.2a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V20" />
                    <path d="M13 20V4.2a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V20" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Budget Planning</h3>
                <p className="text-center text-sm text-slate-700 dark:text-slate-400">
                  Set budgets for different categories and track your progress over time.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 dark:border-slate-700">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-6" />
                    <path d="M8 18v-1" />
                    <path d="M16 18v-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Financial Reports</h3>
                <p className="text-center text-sm text-slate-700 dark:text-slate-400">
                  Generate detailed reports to understand your financial health at a glance.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 dark:border-slate-700">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2v8" />
                    <path d="m4.93 10.93 1.41 1.41" />
                    <path d="M2 18h2" />
                    <path d="M20 18h2" />
                    <path d="m19.07 10.93-1.41 1.41" />
                    <path d="M22 22H2" />
                    <path d="m16 6-4 4-4-4" />
                    <path d="M16 18a4 4 0 0 0-8 0" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Goal Setting</h3>
                <p className="text-center text-sm text-slate-700 dark:text-slate-400">
                  Set financial goals and track your progress with visual indicators.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 dark:border-slate-700">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Smart Insights</h3>
                <p className="text-center text-sm text-slate-700 dark:text-slate-400">
                  Get personalized financial advice based on your spending habits.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
