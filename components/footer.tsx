import Link from "next/link"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4">FinMate</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Your smart budget buddy for tracking expenses, setting goals, and learning about finance.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="#"
                className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/expenses"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Expense Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="/goals"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Goal Setting
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Financial Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/finbot"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  FinBot AI Assistant
                </Link>
              </li>
              <li>
                <Link
                  href="/emotion-insights"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Emotion Insights
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/financial-insights"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Financial Insights
                </Link>
              </li>
              <li>
                <Link
                  href="/challenges"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Financial Challenges
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                <a
                  href="mailto:support@finmate.com"
                  className="text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  support@finmate.com
                </a>
              </li>
              <li>
                <p className="text-slate-600 dark:text-slate-400">123 Finance Street</p>
                <p className="text-slate-600 dark:text-slate-400">India</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} FinMate. All rights reserved.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">Developed by Team EverCode</p>
        </div>
      </div>
    </footer>
  )
}
