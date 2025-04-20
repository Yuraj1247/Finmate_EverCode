"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, ArrowRight, Award } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Quiz questions for each module
const quizModules = {
  "module-1-basic-finance": [
    {
      question: "What is the first step in creating a personal financial plan?",
      options: [
        "Investing in stocks",
        "Setting financial goals",
        "Opening a savings account",
        "Applying for a credit card",
      ],
      correctAnswer: 1,
      explanation:
        "Setting clear financial goals is the foundation of any personal financial plan. It helps you determine your priorities and create a roadmap for your financial future.",
    },
    {
      question: "Which of the following is NOT a basic financial need?",
      options: ["Housing", "Food", "Luxury vacation", "Healthcare"],
      correctAnswer: 2,
      explanation:
        "Luxury vacations are wants, not needs. Basic financial needs include housing, food, healthcare, transportation, and utilities.",
    },
    {
      question: "What is the 50/30/20 rule in budgeting?",
      options: [
        "Save 50%, spend 30% on needs, 20% on wants",
        "Spend 50% on needs, 30% on wants, save 20%",
        "Invest 50%, save 30%, spend 20%",
        "Pay 50% in taxes, save 30%, spend 20%",
      ],
      correctAnswer: 1,
      explanation:
        "The 50/30/20 rule suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.",
    },
    {
      question: "What is the purpose of an emergency fund?",
      options: [
        "To save for retirement",
        "To cover unexpected expenses",
        "To invest in stocks",
        "To pay for vacations",
      ],
      correctAnswer: 1,
      explanation:
        "An emergency fund is designed to cover unexpected expenses like medical emergencies, car repairs, or job loss without going into debt.",
    },
    {
      question: "Which of these is the most liquid asset?",
      options: ["Real estate", "Stocks", "Cash in a savings account", "Collectibles"],
      correctAnswer: 2,
      explanation:
        "Cash in a savings account is the most liquid asset because it can be accessed immediately without any loss of value. Real estate, stocks, and collectibles typically take time to convert to cash.",
    },
    {
      question: "What does 'pay yourself first' mean in personal finance?",
      options: [
        "Paying your bills before spending on wants",
        "Setting aside savings before spending on anything else",
        "Paying off debt before saving",
        "Giving yourself a weekly allowance",
      ],
      correctAnswer: 1,
      explanation:
        "Paying yourself first means automatically setting aside a portion of your income for savings before spending on anything else, making saving a priority rather than an afterthought.",
    },
    {
      question: "Which of these is NOT a good way to track expenses?",
      options: ["Using a budgeting app", "Keeping receipts", "Relying solely on memory", "Checking bank statements"],
      correctAnswer: 2,
      explanation:
        "Relying solely on memory is not effective for tracking expenses as it's easy to forget small purchases, which can add up over time. Using tools like apps, receipts, and bank statements provides more accurate tracking.",
    },
    {
      question: "What is the difference between a debit card and a credit card?",
      options: [
        "There is no difference",
        "Debit cards have higher interest rates",
        "Credit cards allow you to borrow money, debit cards use your own money",
        "Debit cards offer better rewards",
      ],
      correctAnswer: 2,
      explanation:
        "A debit card uses money directly from your bank account, while a credit card allows you to borrow money from the card issuer up to a certain limit, which you must pay back later.",
    },
    {
      question: "What is compound interest?",
      options: [
        "Interest paid only on the principal amount",
        "Interest paid on both the principal and accumulated interest",
        "A fixed interest rate that never changes",
        "Interest that decreases over time",
      ],
      correctAnswer: 1,
      explanation:
        "Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. This is why it's often called 'interest on interest.'",
    },
    {
      question: "Which of these is a good financial habit?",
      options: [
        "Spending your entire paycheck immediately",
        "Ignoring your bank statements",
        "Regularly reviewing your financial goals",
        "Maxing out credit cards",
      ],
      correctAnswer: 2,
      explanation:
        "Regularly reviewing your financial goals helps you stay on track and make adjustments as needed. It's an essential habit for maintaining financial health and progress toward your objectives.",
    },
  ],
  "module-2-saving-money": [
    {
      question: "What is the difference between a need and a want?",
      options: [
        "Needs are expensive, wants are cheap",
        "Needs are essential for survival, wants are desirable but not essential",
        "Needs are things you buy monthly, wants are one-time purchases",
        "There is no difference; they are the same thing",
      ],
      correctAnswer: 1,
      explanation:
        "Needs are essential items required for basic survival and functioning (like food, shelter, basic clothing), while wants are things that are desirable but not essential for living (like entertainment, luxury items, vacations).",
    },
    {
      question: "Which of these is an example of a 'need'?",
      options: ["Designer clothes", "Basic groceries", "Concert tickets", "Latest smartphone"],
      correctAnswer: 1,
      explanation:
        "Basic groceries are a need because food is essential for survival. Designer clothes, concert tickets, and the latest smartphone are wants because they're not essential for basic living.",
    },
    {
      question: "What is a zero-based budget?",
      options: [
        "A budget where you spend zero money",
        "A budget where you save zero money",
        "A budget where every rupee of income is assigned a purpose",
        "A budget that only tracks large expenses",
      ],
      correctAnswer: 2,
      explanation:
        "A zero-based budget is where you assign every rupee of your income to a specific category (spending, saving, investing, etc.) until you have zero rupees left to assign. This ensures all your money has a purpose.",
    },
    {
      question: "Which budgeting method involves using cash envelopes for different spending categories?",
      options: ["50/30/20 method", "Zero-based budgeting", "Envelope budgeting system", "Pay-yourself-first method"],
      correctAnswer: 2,
      explanation:
        "The envelope budgeting system involves placing cash in separate envelopes for different spending categories (groceries, entertainment, etc.). When an envelope is empty, you stop spending in that category until the next budget period.",
    },
    {
      question: "What is the recommended minimum amount for an emergency fund?",
      options: [
        "One month of expenses",
        "Three to six months of expenses",
        "One year of expenses",
        "₹10,000 regardless of expenses",
      ],
      correctAnswer: 1,
      explanation:
        "Financial experts typically recommend having three to six months of essential expenses saved in an emergency fund to cover unexpected costs or income loss.",
    },
    {
      question: "Which of these is NOT a good strategy for saving money on groceries?",
      options: ["Making a shopping list", "Shopping when hungry", "Buying seasonal produce", "Using coupons"],
      correctAnswer: 1,
      explanation:
        "Shopping when hungry often leads to impulse purchases and buying more food than needed. Making a list, buying seasonal produce, and using coupons are all effective strategies for saving on groceries.",
    },
    {
      question: "What is the 30-day rule for avoiding impulse purchases?",
      options: [
        "Shop only once every 30 days",
        "Return items within 30 days if not used",
        "Wait 30 days before buying non-essential items",
        "Spend only 30% of your income on wants",
      ],
      correctAnswer: 2,
      explanation:
        "The 30-day rule suggests waiting 30 days before making non-essential purchases. If you still want the item after 30 days, it may be a thoughtful purchase rather than an impulse buy.",
    },
    {
      question: "Which of these typically has the highest interest rate?",
      options: ["Savings account", "Fixed deposit", "Credit card debt", "Home loan"],
      correctAnswer: 2,
      explanation:
        "Credit card debt typically carries the highest interest rate compared to savings accounts, fixed deposits, and home loans. This is why paying off credit card debt is often a financial priority.",
    },
    {
      question: "What is a sinking fund?",
      options: [
        "Money set aside for emergencies",
        "Money saved for a specific planned expense",
        "Money invested in the stock market",
        "Money used to pay off debt",
      ],
      correctAnswer: 1,
      explanation:
        "A sinking fund is money regularly set aside for a specific planned future expense, such as a vacation, car maintenance, or holiday gifts. Unlike an emergency fund, it's for anticipated expenses.",
    },
    {
      question: "Which of these is a good way to automate savings?",
      options: [
        "Setting up automatic transfers to a savings account",
        "Using only cash for all purchases",
        "Keeping all money in a checking account",
        "Writing checks for bill payments",
      ],
      correctAnswer: 0,
      explanation:
        "Setting up automatic transfers to a savings account is an effective way to automate savings because it happens without requiring action each time, making it easier to consistently save money.",
    },
  ],
  "module-3-smart-spending": [
    {
      question: "What is 'lifestyle inflation'?",
      options: [
        "The rising cost of living due to economic factors",
        "Increasing your spending as your income increases",
        "The effect of inflation on luxury goods",
        "Spending more than you earn",
      ],
      correctAnswer: 1,
      explanation:
        "Lifestyle inflation refers to increasing your spending as your income rises, rather than saving or investing the additional income. This can prevent wealth building despite earning more money.",
    },
    {
      question: "Which of these is an example of a 'money leak'?",
      options: ["Paying rent", "Buying groceries", "Unused subscription services", "Paying utility bills"],
      correctAnswer: 2,
      explanation:
        "Unused subscription services are a common 'money leak' - small, recurring expenses that drain your finances without providing value. Unlike rent, groceries, and utilities, they aren't necessary expenses.",
    },
    {
      question: "What is the 'latte factor'?",
      options: [
        "The extra cost of specialty coffee drinks",
        "The concept that small, regular expenses add up significantly over time",
        "A tax on luxury beverages",
        "The markup restaurants charge on coffee",
      ],
      correctAnswer: 1,
      explanation:
        "The 'latte factor' refers to the concept that small, regular expenses (like daily coffee) can add up to significant amounts over time, potentially impacting long-term financial goals.",
    },
    {
      question: "Which spending strategy involves waiting for sales or discounts?",
      options: ["Impulse buying", "Strategic spending", "Emotional spending", "Status spending"],
      correctAnswer: 1,
      explanation:
        "Strategic spending involves planning purchases around sales, discounts, or the best time to buy, rather than purchasing impulsively or based on emotions or status.",
    },
    {
      question: "What is 'comparison shopping'?",
      options: [
        "Buying what your friends buy",
        "Comparing your spending to others",
        "Researching and comparing prices before buying",
        "Shopping at multiple stores in one day",
      ],
      correctAnswer: 2,
      explanation:
        "Comparison shopping is the practice of researching and comparing prices, features, and reviews of products across different retailers before making a purchase to ensure you get the best value.",
    },
    {
      question: "Which of these is NOT a benefit of meal planning?",
      options: [
        "Reduces food waste",
        "Saves money on groceries",
        "Increases restaurant spending",
        "Helps avoid impulse food purchases",
      ],
      correctAnswer: 2,
      explanation:
        "Meal planning typically reduces restaurant spending, not increases it. Benefits include reducing food waste, saving money on groceries, and avoiding impulse food purchases.",
    },
    {
      question: "What is a 'spending trigger'?",
      options: [
        "A limit you set on certain categories",
        "A situation or emotion that leads to unplanned spending",
        "A notification from your bank about large purchases",
        "A sale or discount event",
      ],
      correctAnswer: 1,
      explanation:
        "A spending trigger is a situation, emotion, or environment that prompts you to spend money, often impulsively or emotionally. Common triggers include stress, boredom, social pressure, or certain locations like malls.",
    },
    {
      question: "Which of these is a smart strategy when shopping online?",
      options: [
        "Always choosing express shipping",
        "Buying immediately when you see something you like",
        "Leaving items in your cart for a day before deciding",
        "Using multiple credit cards for different purchases",
      ],
      correctAnswer: 2,
      explanation:
        "Leaving items in your cart for a day before deciding is a smart strategy that helps avoid impulse purchases and gives you time to consider if you really need or want the item.",
    },
    {
      question: "What does 'cost per use' mean?",
      options: [
        "The total cost of an item including taxes",
        "The monthly payment for a financed purchase",
        "The actual cost divided by how many times you'll use it",
        "The cost of maintaining an item over time",
      ],
      correctAnswer: 2,
      explanation:
        "Cost per use is calculated by dividing the total cost of an item by the number of times you'll use it. This helps determine the true value of a purchase - a higher-priced item used frequently may have a lower cost per use than a cheaper item used rarely.",
    },
    {
      question: "Which of these is an example of 'value-based spending'?",
      options: [
        "Buying the cheapest option available",
        "Spending money primarily on things that align with your values and priorities",
        "Only purchasing luxury brands",
        "Spending equal amounts in all budget categories",
      ],
      correctAnswer: 1,
      explanation:
        "Value-based spending means allocating your money primarily toward things that align with your personal values and priorities, rather than based solely on price, status, or impulse.",
    },
  ],
  "module-4-investments": [
    {
      question: "What is the primary difference between saving and investing?",
      options: [
        "Saving is for short-term goals, investing is for long-term goals",
        "Saving has no risk, investing always has some risk",
        "Saving earns no interest, investing always earns high returns",
        "Saving is only for emergencies, investing is for everything else",
      ],
      correctAnswer: 1,
      explanation:
        "The primary difference is that saving typically has little to no risk but lower returns, while investing involves some level of risk with the potential for higher returns. Saving is often for short-term goals, while investing is typically for long-term goals.",
    },
    {
      question: "What is compound interest?",
      options: [
        "Interest paid only on your initial deposit",
        "Interest paid on both your initial deposit and previously earned interest",
        "A fixed amount of interest paid monthly",
        "Interest that decreases over time",
      ],
      correctAnswer: 1,
      explanation:
        "Compound interest is interest earned on both your initial deposit (principal) and on the interest already accumulated. This creates a snowball effect where your money grows increasingly faster over time.",
    },
    {
      question: "Which of these is generally considered the safest investment?",
      options: ["Stocks", "Cryptocurrency", "Government bonds", "Real estate"],
      correctAnswer: 2,
      explanation:
        "Government bonds, particularly from stable governments, are generally considered among the safest investments because they're backed by the full faith and credit of the government. They typically have lower risk than stocks, cryptocurrency, or real estate.",
    },
    {
      question: "What is diversification in investing?",
      options: [
        "Investing all your money in different stocks",
        "Spreading investments across various asset classes to reduce risk",
        "Changing your investment strategy frequently",
        "Investing only in foreign markets",
      ],
      correctAnswer: 1,
      explanation:
        "Diversification means spreading your investments across different asset classes (stocks, bonds, real estate, etc.) and within those classes to reduce risk. This strategy helps protect against significant losses if one investment performs poorly.",
    },
    {
      question: "What is a mutual fund?",
      options: [
        "A loan given by multiple banks",
        "A type of savings account",
        "A pool of money from many investors used to purchase a collection of stocks, bonds, or other securities",
        "A government program for retirement savings",
      ],
      correctAnswer: 2,
      explanation:
        "A mutual fund is a professionally managed investment vehicle that pools money from many investors to purchase a diversified portfolio of stocks, bonds, or other securities. This allows individual investors to gain exposure to a broader range of investments than they could access individually.",
    },
    {
      question: "What is an index fund?",
      options: [
        "A fund that invests only in new companies",
        "A type of mutual fund designed to track a specific market index",
        "A government bond fund",
        "A high-risk investment strategy",
      ],
      correctAnswer: 1,
      explanation:
        "An index fund is a type of mutual fund or ETF (Exchange-Traded Fund) that aims to track the performance of a specific market index, such as the S&P 500 or Nifty 50. These funds typically have lower fees than actively managed funds.",
    },
    {
      question: "What is the 'Rule of 72' used for in investing?",
      options: [
        "Determining the maximum amount to invest",
        "Calculating how long it takes for an investment to double at a given interest rate",
        "Deciding when to sell an investment",
        "Calculating the minimum investment needed",
      ],
      correctAnswer: 1,
      explanation:
        "The Rule of 72 is a simple formula to estimate how long it will take for an investment to double: divide 72 by the annual rate of return. For example, at 8% interest, an investment would take approximately 9 years to double (72 ÷ 8 = 9).",
    },
    {
      question: "Which of these is NOT typically considered an investment asset class?",
      options: ["Stocks", "Bonds", "Credit card points", "Real estate"],
      correctAnswer: 2,
      explanation:
        "Credit card points are not an investment asset class. The main asset classes typically include stocks (equities), bonds (fixed income), cash and cash equivalents, real estate, and sometimes commodities and alternative investments.",
    },
    {
      question: "What is the primary advantage of starting to invest early in life?",
      options: [
        "You can invest in riskier assets",
        "You benefit more from compound interest over time",
        "You'll always pick better investments when you're younger",
        "Early investments are guaranteed to succeed",
      ],
      correctAnswer: 1,
      explanation:
        "Starting to invest early in life gives you the significant advantage of time, allowing compound interest to work more effectively. Even small amounts invested early can grow substantially over decades due to the compounding effect.",
    },
    {
      question: "What is dollar-cost averaging?",
      options: [
        "Investing a fixed amount at regular intervals regardless of price",
        "Only buying investments when prices are low",
        "Converting all investments to US dollars",
        "Calculating the average price of all your investments",
      ],
      correctAnswer: 0,
      explanation:
        "Dollar-cost averaging is an investment strategy where you invest a fixed amount at regular intervals (e.g., monthly) regardless of market prices. This reduces the impact of market volatility and eliminates the need to time the market.",
    },
  ],
  "module-5-credit-loans": [
    {
      question: "What is a credit score?",
      options: [
        "The total amount of debt you owe",
        "A numerical rating of your creditworthiness",
        "The interest rate on your credit card",
        "The maximum credit limit you can have",
      ],
      correctAnswer: 1,
      explanation:
        "A credit score is a numerical rating (typically between 300-900 in India) that represents your creditworthiness based on your credit history, including payment history, amounts owed, length of credit history, and other factors.",
    },
    {
      question: "Which factor typically has the biggest impact on your credit score?",
      options: ["Your income", "Your education level", "Your payment history", "Your age"],
      correctAnswer: 2,
      explanation:
        "Payment history—whether you've paid your bills on time—typically has the biggest impact on your credit score. Late payments, defaults, and bankruptcies can significantly lower your score.",
    },
    {
      question: "What is the difference between a secured and unsecured loan?",
      options: [
        "Secured loans have higher interest rates",
        "Secured loans require collateral, unsecured loans don't",
        "Unsecured loans are only available to people with perfect credit",
        "Secured loans are only offered by banks",
      ],
      correctAnswer: 1,
      explanation:
        "A secured loan requires collateral (like a home or car) that the lender can take if you don't repay the loan. An unsecured loan doesn't require collateral but typically has higher interest rates because it poses more risk to the lender.",
    },
    {
      question: "What is the typical consequence of making only minimum payments on credit card debt?",
      options: [
        "Your credit score will improve faster",
        "You'll pay off the debt quickly",
        "You'll pay much more in interest over time",
        "The credit card company will close your account",
      ],
      correctAnswer: 2,
      explanation:
        "Making only minimum payments on credit card debt results in paying much more in interest over time. It extends the repayment period significantly, allowing interest to accumulate on the remaining balance month after month.",
    },
    {
      question: "What is a debt-to-income ratio?",
      options: [
        "The percentage of your debt that's interest",
        "The ratio of your monthly debt payments to your monthly income",
        "The ratio of good debt to bad debt",
        "The percentage of your income that goes to taxes",
      ],
      correctAnswer: 1,
      explanation:
        "Debt-to-income (DTI) ratio is the percentage of your gross monthly income that goes toward paying debts. Lenders use this to assess your ability to manage monthly payments and repay debts. A lower DTI ratio is generally better.",
    },
    {
      question: "Which of these is generally considered 'good debt'?",
      options: ["Credit card debt", "Payday loans", "Education loans", "Loans for luxury items"],
      correctAnswer: 2,
      explanation:
        "Education loans are often considered 'good debt' because they're an investment in your future earning potential. Good debt typically helps build wealth or increase income over time. Credit card debt, payday loans, and loans for luxury items are generally considered 'bad debt.'",
    },
    {
      question: "What is the debt snowball method?",
      options: [
        "Paying off debts from highest interest rate to lowest",
        "Paying off debts from smallest balance to largest",
        "Consolidating all debts into one loan",
        "Declaring bankruptcy to eliminate debts",
      ],
      correctAnswer: 1,
      explanation:
        "The debt snowball method involves paying off debts from smallest balance to largest, regardless of interest rate. This approach provides psychological wins as debts are eliminated, building momentum and motivation to continue paying off larger debts.",
    },
    {
      question: "What is a credit utilization ratio?",
      options: [
        "The ratio of credit card debt to total debt",
        "The percentage of available credit you're using",
        "The number of credit accounts you have",
        "The ratio of your credit score to the maximum possible score",
      ],
      correctAnswer: 1,
      explanation:
        "Credit utilization ratio is the percentage of your available credit that you're currently using. For example, if you have a ₹100,000 credit limit and a ₹30,000 balance, your utilization is 30%. Lower utilization (generally below 30%) is better for your credit score.",
    },
    {
      question: "What is debt consolidation?",
      options: [
        "Paying off one debt at a time",
        "Combining multiple debts into a single loan, often at a lower interest rate",
        "Negotiating with creditors to reduce debt amounts",
        "Transferring debt between different credit cards",
      ],
      correctAnswer: 1,
      explanation:
        "Debt consolidation involves combining multiple debts into a single loan, often with a lower interest rate. This can simplify payments (one payment instead of many) and potentially reduce the total interest paid over time.",
    },
    {
      question: "What should you check before taking out a loan?",
      options: [
        "Only the monthly payment amount",
        "Only the interest rate",
        "The interest rate, fees, terms, and total cost over the life of the loan",
        "Only the loan duration",
      ],
      correctAnswer: 2,
      explanation:
        "Before taking out a loan, you should check multiple factors: the interest rate, any fees (origination, prepayment, late payment), the terms and conditions, and the total cost over the life of the loan. Looking at just one factor can lead to unexpected costs.",
    },
  ],
  "module-6-financial-planning": [
    {
      question: "What is a SMART financial goal?",
      options: [
        "A goal that focuses only on saving money",
        "A goal that is Specific, Measurable, Achievable, Relevant, and Time-bound",
        "A goal that requires using smartphone apps",
        "A goal that prioritizes investing over saving",
      ],
      correctAnswer: 1,
      explanation:
        "A SMART financial goal follows the SMART criteria: Specific (clearly defined), Measurable (trackable), Achievable (realistic), Relevant (meaningful to you), and Time-bound (has a deadline). This framework helps create effective, actionable goals.",
    },
    {
      question: "Which of these is an example of a short-term financial goal?",
      options: [
        "Retiring comfortably",
        "Paying off a mortgage",
        "Building a six-month emergency fund",
        "Funding a child's college education",
      ],
      correctAnswer: 2,
      explanation:
        "Building a six-month emergency fund is typically a short-term goal (achievable within 1-3 years). Retiring comfortably, paying off a mortgage, and funding a child's education are long-term goals that take many years to achieve.",
    },
    {
      question: "What is the purpose of a financial plan?",
      options: [
        "To eliminate all debt immediately",
        "To provide a roadmap for achieving your financial goals",
        "To maximize investment returns regardless of risk",
        "To reduce all expenses to a minimum",
      ],
      correctAnswer: 1,
      explanation:
        "A financial plan serves as a roadmap for achieving your financial goals. It takes into account your current situation, goals, timeline, risk tolerance, and available resources to create a structured approach to managing your finances.",
    },
    {
      question: "What is the first step in creating a financial plan?",
      options: [
        "Opening investment accounts",
        "Assessing your current financial situation",
        "Setting a retirement date",
        "Purchasing life insurance",
      ],
      correctAnswer: 1,
      explanation:
        "The first step in creating a financial plan is assessing your current financial situation, including your income, expenses, assets, debts, and net worth. This provides a starting point from which to build your plan.",
    },
    {
      question: "What is a sinking fund in financial planning?",
      options: [
        "Money set aside for emergencies",
        "A fund for paying off debt",
        "Money saved for a specific planned expense",
        "A retirement account",
      ],
      correctAnswer: 2,
      explanation:
        "A sinking fund is money regularly set aside for a specific planned future expense, such as a vacation, home repairs, or a new car. Unlike emergency funds (for unexpected expenses) or retirement accounts, sinking funds are for anticipated expenses with a specific purpose and timeline.",
    },
    {
      question: "What is the purpose of estate planning?",
      options: [
        "To minimize taxes on real estate",
        "To plan for buying property",
        "To determine how your assets will be distributed after death",
        "To maximize rental income from properties",
      ],
      correctAnswer: 2,
      explanation:
        "Estate planning determines how your assets will be distributed after death. It includes creating wills, trusts, designating beneficiaries, and potentially minimizing taxes and legal complications for your heirs.",
    },
    {
      question: "Which of these is NOT typically part of retirement planning?",
      options: [
        "Estimating future expenses",
        "Calculating how much to save",
        "Determining short-term trading strategies",
        "Considering inflation",
      ],
      correctAnswer: 2,
      explanation:
        "Short-term trading strategies are not typically part of retirement planning, which focuses on long-term saving and investing. Retirement planning includes estimating future expenses, calculating necessary savings, considering inflation, and creating a sustainable withdrawal strategy.",
    },
    {
      question: "What is a financial milestone?",
      options: [
        "A specific achievement in your financial journey",
        "A mandatory financial requirement",
        "The maximum amount you can save",
        "The minimum income needed to invest",
      ],
      correctAnswer: 0,
      explanation:
        "A financial milestone is a significant achievement or checkpoint in your financial journey, such as becoming debt-free, saving your first lakh, reaching a specific net worth, or making your first investment. Milestones help track progress toward larger goals.",
    },
    {
      question: "What is the purpose of having multiple financial goals?",
      options: [
        "To make financial planning more complicated",
        "To address different aspects of your financial life and different time horizons",
        "To impress financial advisors",
        "To ensure you're always saving the maximum amount",
      ],
      correctAnswer: 1,
      explanation:
        "Having multiple financial goals allows you to address different aspects of your financial life (saving, investing, debt repayment, etc.) and different time horizons (short, medium, and long-term). This creates a more comprehensive and balanced financial plan.",
    },
    {
      question: "What is the benefit of writing down your financial goals?",
      options: [
        "It makes them legally binding",
        "It increases your chances of achieving them",
        "It automatically increases your income",
        "It guarantees investment returns",
      ],
      correctAnswer: 1,
      explanation:
        "Writing down your financial goals increases your chances of achieving them by making them concrete, clarifying what you want to accomplish, creating accountability, and providing a reference point to track progress. Research shows written goals are more likely to be achieved than unwritten ones.",
    },
  ],
}

interface FinanceQuizModuleProps {
  moduleId: string
  onComplete: () => void
}

export function FinanceQuizModule({ moduleId, onComplete }: FinanceQuizModuleProps) {
  const { translate: t } = useLanguage()
  const { toast } = useToast()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const questions = quizModules[moduleId as keyof typeof quizModules] || []
  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(index)
    }
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setIsAnswerSubmitted(true)

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1)
      toast({
        title: "✅ " + t("correct"),
        description: currentQuestion.explanation,
        variant: "success",
      })
    } else {
      toast({
        title: "❌ " + t("incorrect"),
        description: currentQuestion.explanation,
        variant: "destructive",
      })
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
    } else {
      setQuizCompleted(true)

      // Show completion toast
      toast({
        title: "🎉 " + t("quiz_completed"),
        description: `${t("your_score")}: ${score}/${questions.length}`,
        variant: "success",
      })
    }
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      {!quizCompleted ? (
        <>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {t("question")} {currentQuestionIndex + 1} {t("of")} {questions.length}
              </span>
              <span>
                {t("score")}: {score}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAnswer?.toString()} className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleAnswerSelect(index)}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className={`flex-grow p-3 rounded-md ${
                        isAnswerSubmitted
                          ? index === currentQuestion.correctAnswer
                            ? "bg-green-100 dark:bg-green-900"
                            : selectedAnswer === index
                              ? "bg-red-100 dark:bg-red-900"
                              : ""
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {option}
                      {isAnswerSubmitted && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="inline ml-2 h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                      {isAnswerSubmitted && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                        <XCircle className="inline ml-2 h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              {!isAnswerSubmitted ? (
                <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
                  {t("submit_answer")}
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      {t("next_question")} <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    t("finish_quiz")
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">{t("quiz_completed")}</CardTitle>
            <CardDescription className="text-center">{t("module_completed_description")}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="text-5xl mb-2">🏆</div>
              <h3 className="text-2xl font-bold mb-2">
                {t("your_score")}: {score}/{questions.length}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {score === questions.length
                  ? t("perfect_score")
                  : score >= questions.length * 0.8
                    ? t("great_job")
                    : score >= questions.length * 0.6
                      ? t("good_effort")
                      : t("keep_learning")}
              </p>
            </div>

            <div className="flex justify-center">
              <Button onClick={onComplete} className="px-8">
                <Award className="mr-2 h-5 w-5" />
                {t("claim_reward")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
