"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Challenge } from "@/types/finance"
import * as THREE from "three"

interface StockMarketGameProps {
  challenge: Challenge
  onComplete: (id: string) => void
}

// Stock data with price history
interface Stock {
  id: string
  name: string
  symbol: string
  price: number
  history: number[]
  volatility: number // 0-1, higher means more volatile
  trend: number // -1 to 1, negative means downward trend
}

// Portfolio item
interface PortfolioItem {
  stockId: string
  shares: number
}

export function StockMarketGame({ challenge, onComplete }: StockMarketGameProps) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "completed">("intro")
  const [day, setDay] = useState(1)
  const [cash, setCash] = useState(10000)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [stocks, setStocks] = useState<Stock[]>([
    {
      id: "tech1",
      name: "TechGiant",
      symbol: "TGT",
      price: 150,
      history: [150],
      volatility: 0.08,
      trend: 0.6,
    },
    {
      id: "finance1",
      name: "BankCorp",
      symbol: "BNK",
      price: 80,
      history: [80],
      volatility: 0.05,
      trend: 0.2,
    },
    {
      id: "energy1",
      name: "GreenEnergy",
      symbol: "GRN",
      price: 45,
      history: [45],
      volatility: 0.1,
      trend: 0.4,
    },
    {
      id: "retail1",
      name: "ShopMart",
      symbol: "SHM",
      price: 65,
      history: [65],
      volatility: 0.06,
      trend: -0.1,
    },
  ])

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [buyAmount, setBuyAmount] = useState(0)
  const [sellAmount, setSellAmount] = useState(0)

  // Calculate total portfolio value
  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, item) => {
      const stock = stocks.find((s) => s.id === item.stockId)
      return total + (stock ? stock.price * item.shares : 0)
    }, 0)
  }

  const totalValue = cash + calculatePortfolioValue()
  const initialValue = 10000
  const goalValue = 12000 // 20% gain
  const progress = Math.min(100, ((totalValue - initialValue) / (goalValue - initialValue)) * 100)

  // Advance to next day
  const advanceDay = () => {
    if (day >= 30) {
      // Game over
      if (totalValue >= goalValue) {
        setGameState("completed")
        onComplete(challenge.id)
      } else {
        // Failed
        alert("Game over! You didn't reach the target value of $12,000.")
        // Reset game
        setDay(1)
        setCash(10000)
        setPortfolio([])
        setStocks(
          stocks.map((stock) => ({
            ...stock,
            price: stock.history[0],
            history: [stock.history[0]],
          })),
        )
      }
      return
    }

    // Update stock prices
    setStocks(
      stocks.map((stock) => {
        // Calculate new price based on volatility and trend
        const change = (Math.random() - 0.5 + stock.trend * 0.1) * stock.volatility * stock.price
        const newPrice = Math.max(1, stock.price + change)

        return {
          ...stock,
          price: Number.parseFloat(newPrice.toFixed(2)),
          history: [...stock.history, newPrice],
        }
      }),
    )

    setDay(day + 1)
  }

  // Buy stock
  const buyStock = (stock: Stock, amount: number) => {
    if (amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    const cost = stock.price * amount

    if (cost > cash) {
      alert("Not enough cash!")
      return
    }

    // Update portfolio
    const existingItem = portfolio.find((item) => item.stockId === stock.id)

    if (existingItem) {
      setPortfolio(
        portfolio.map((item) => (item.stockId === stock.id ? { ...item, shares: item.shares + amount } : item)),
      )
    } else {
      setPortfolio([...portfolio, { stockId: stock.id, shares: amount }])
    }

    // Update cash
    setCash(cash - cost)
    setBuyAmount(0)
  }

  // Sell stock
  const sellStock = (stock: Stock, amount: number) => {
    const portfolioItem = portfolio.find((item) => item.stockId === stock.id)

    if (!portfolioItem) {
      alert("You don't own this stock!")
      return
    }

    if (amount <= 0 || amount > portfolioItem.shares) {
      alert("Please enter a valid amount")
      return
    }

    // Update portfolio
    if (amount === portfolioItem.shares) {
      setPortfolio(portfolio.filter((item) => item.stockId !== stock.id))
    } else {
      setPortfolio(
        portfolio.map((item) => (item.stockId === stock.id ? { ...item, shares: item.shares - amount } : item)),
      )
    }

    // Update cash
    setCash(cash + stock.price * amount)
    setSellAmount(0)
  }

  // Get shares owned for a stock
  const getSharesOwned = (stockId: string) => {
    const portfolioItem = portfolio.find((item) => item.stockId === stockId)
    return portfolioItem ? portfolioItem.shares : 0
  }

  // Start game
  const startGame = () => {
    setGameState("playing")
  }

  // Restart game
  const restartGame = () => {
    setDay(1)
    setCash(10000)
    setPortfolio([])
    setStocks(
      stocks.map((stock) => ({
        ...stock,
        price: stock.history[0],
        history: [stock.history[0]],
      })),
    )
    setGameState("playing")
  }

  return (
    <div className="w-full">
      {gameState === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Stock Market Challenge</CardTitle>
            <CardDescription>Grow your $10,000 investment to $12,000 in 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <h3 className="font-medium mb-2">How to Play:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Buy low, sell high to maximize your returns</li>
                <li>Watch market trends and make strategic decisions</li>
                <li>You have 30 days to reach your goal of $12,000</li>
                <li>Diversify your portfolio to manage risk</li>
              </ul>
            </div>

            <div className="h-[200px]">
              <Canvas>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Environment preset="city" />

                <StockMarketIntro />

                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startGame} className="w-full">
              Start Challenge
            </Button>
          </CardFooter>
        </Card>
      )}

      {gameState === "playing" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Stock Market Simulator</CardTitle>
                <CardDescription>Day {day} of 30</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Portfolio Value</div>
                <div className="text-xl font-bold">${totalValue.toFixed(2)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-sm font-medium">Goal Progress</div>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-[200px] h-2" />
                  <span className="text-xs">{progress.toFixed(0)}%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">Cash Available</div>
                <div className="font-medium">${cash.toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stock List */}
              <div className="border rounded-md p-3">
                <h3 className="font-medium mb-2">Market</h3>
                <div className="space-y-3">
                  {stocks.map((stock) => (
                    <div
                      key={stock.id}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${
                        selectedStock?.id === stock.id
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      onClick={() => setSelectedStock(stock)}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {stock.name} ({stock.symbol})
                        </div>
                        <div className="font-mono">${stock.price.toFixed(2)}</div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <div>Shares: {getSharesOwned(stock.id)}</div>
                        <div
                          className={
                            stock.price > stock.history[stock.history.length - 2]
                              ? "text-green-600"
                              : stock.price < stock.history[stock.history.length - 2]
                                ? "text-red-600"
                                : ""
                          }
                        >
                          {stock.price > stock.history[stock.history.length - 2]
                            ? "▲"
                            : stock.price < stock.history[stock.history.length - 2]
                              ? "▼"
                              : "—"}
                          {stock.history.length > 1 &&
                            (
                              ((stock.price - stock.history[stock.history.length - 2]) /
                                stock.history[stock.history.length - 2]) *
                              100
                            ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Detail / Trading */}
              <div className="border rounded-md p-3">
                {selectedStock ? (
                  <div>
                    <h3 className="font-medium mb-2">
                      {selectedStock.name} ({selectedStock.symbol})
                    </h3>

                    <div className="h-[100px] mb-3 border-b pb-2">
                      <Canvas>
                        <ambientLight intensity={0.5} />
                        <StockChart stock={selectedStock} />
                      </Canvas>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Current Price</div>
                        <div className="font-medium">${selectedStock.price.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Shares Owned</div>
                        <div className="font-medium">{getSharesOwned(selectedStock.id)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex mb-1">
                          <input
                            type="number"
                            min="0"
                            value={buyAmount || ""}
                            onChange={(e) => setBuyAmount(Number.parseInt(e.target.value) || 0)}
                            className="w-full p-1 text-sm border rounded-l-md"
                            placeholder="Shares"
                          />
                          <Button
                            size="sm"
                            className="rounded-l-none"
                            onClick={() => buyStock(selectedStock, buyAmount)}
                            disabled={buyAmount <= 0 || buyAmount * selectedStock.price > cash}
                          >
                            Buy
                          </Button>
                        </div>
                        <div className="text-xs text-slate-500">
                          Cost: ${(buyAmount * selectedStock.price).toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <div className="flex mb-1">
                          <input
                            type="number"
                            min="0"
                            max={getSharesOwned(selectedStock.id)}
                            value={sellAmount || ""}
                            onChange={(e) => setSellAmount(Number.parseInt(e.target.value) || 0)}
                            className="w-full p-1 text-sm border rounded-l-md"
                            placeholder="Shares"
                          />
                          <Button
                            size="sm"
                            className="rounded-l-none"
                            onClick={() => sellStock(selectedStock, sellAmount)}
                            disabled={sellAmount <= 0 || sellAmount > getSharesOwned(selectedStock.id)}
                          >
                            Sell
                          </Button>
                        </div>
                        <div className="text-xs text-slate-500">
                          Value: ${(sellAmount * selectedStock.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">Select a stock to trade</div>
                )}
              </div>
            </div>

            {/* Portfolio Summary */}
            <div className="border rounded-md p-3">
              <h3 className="font-medium mb-2">Your Portfolio</h3>
              {portfolio.length === 0 ? (
                <div className="text-center text-slate-500 py-2">You don't own any stocks yet</div>
              ) : (
                <div className="space-y-2">
                  {portfolio.map((item) => {
                    const stock = stocks.find((s) => s.id === item.stockId)
                    if (!stock) return null

                    const value = stock.price * item.shares
                    const initialPrice = stock.history[0]
                    const profit = (stock.price - initialPrice) * item.shares
                    const profitPercent = (stock.price / initialPrice - 1) * 100

                    return (
                      <div key={item.stockId} className="flex justify-between items-center text-sm">
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-xs text-slate-500">{item.shares} shares</div>
                        </div>
                        <div>
                          <div className="text-right">${value.toFixed(2)}</div>
                          <div className={`text-xs text-right ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {profit >= 0 ? "+" : ""}
                            {profit.toFixed(2)} ({profitPercent.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm">
              Target: <span className="font-medium">${goalValue.toFixed(2)}</span>
            </div>
            <Button onClick={advanceDay}>Next Day →</Button>
          </CardFooter>
        </Card>
      )}

      {gameState === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Challenge Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">${totalValue.toFixed(2)}</div>
              <div className="text-green-600">
                +${(totalValue - initialValue).toFixed(2)} ({((totalValue / initialValue - 1) * 100).toFixed(1)}%)
              </div>
            </div>

            <div className="h-[200px]">
              <Canvas>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Environment preset="city" />

                <StockMarketSuccess />

                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md text-center">
              <h3 className="font-medium mb-1">Congratulations!</h3>
              <p className="text-sm">
                You've successfully completed the Stock Market Challenge and earned {challenge.points} points!
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={restartGame} variant="outline" className="mr-2">
              Play Again
            </Button>
            <Button onClick={() => setGameState("intro")}>Back to Challenges</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

function StockMarketIntro() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2
    }
  })

  return (
    <group ref={group}>
      <Text
        position={[0, 0.5, 0]}
        fontSize={1}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
        font="/placeholder.svg?height=100&width=100" // Replace with actual font path
      >
        Stock Market
      </Text>

      <Text position={[0, -0.5, 0]} fontSize={0.5} color="#64748b" anchorX="center" anchorY="middle">
        Challenge
      </Text>

      {/* Decorative elements */}
      <mesh position={[-3, 0, -1]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>

      <mesh position={[3, 0, -1]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f87171" />
      </mesh>

      <mesh position={[0, 0, -2]}>
        <torusGeometry args={[2, 0.2, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
    </group>
  )
}

function StockMarketSuccess() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.5
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#4ade80" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0, 0]} scale={1.2}>
        <torusGeometry args={[1.5, 0.2, 16, 32]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.5} roughness={0.5} />
      </mesh>

      <Text position={[0, 2, 0]} fontSize={0.8} color="#22c55e" anchorX="center" anchorY="middle">
        Success!
      </Text>
    </group>
  )
}

function StockChart({ stock }: { stock: Stock }) {
  const { size } = useThree()
  const points = stock.history.map(
    (price, i) =>
      new THREE.Vector3(
        (i / (stock.history.length - 1)) * 4 - 2, // x from -2 to 2
        (price / stock.history[0] - 1) * 2, // y normalized to show change
        0,
      ),
  )

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: stock.price >= stock.history[0] ? "#22c55e" : "#ef4444",
    linewidth: 2,
  })

  return (
    <group>
      {/* X axis */}
      <line>
        <bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(-2, -1, 0), new THREE.Vector3(2, -1, 0)]} />
        <lineBasicMaterial attach="material" color="#94a3b8" />
      </line>

      {/* Y axis */}
      <line>
        <bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(-2, -1, 0), new THREE.Vector3(-2, 1, 0)]} />
        <lineBasicMaterial attach="material" color="#94a3b8" />
      </line>

      {/* Stock price line */}
      <line>
        <bufferGeometry attach="geometry" {...lineGeometry} />
        <lineBasicMaterial attach="material" {...lineMaterial} />
      </line>

      {/* Current price marker */}
      <mesh position={[2, points[points.length - 1].y, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={stock.price >= stock.history[0] ? "#22c55e" : "#ef4444"} />
      </mesh>
    </group>
  )
}
