"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Star, Coins } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

// This is a placeholder for Phaser.js integration
// In a real implementation, you would import Phaser and use it properly
declare global {
  interface Window {
    Phaser: any
  }
}

type GameProps = {
  gameType: string
  challengeId: string
  onComplete: (score: number) => void
}

export function GameEngine({ gameType, challengeId, onComplete }: GameProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const [gameLoaded, setGameLoaded] = useState(false)
  const [score, setScore] = useState(0)
  const [gameInstance, setGameInstance] = useState<any>(null)
  const [gameScript, setGameScript] = useState<HTMLScriptElement | null>(null)
  const [userProgress, setUserProgress] = useLocalStorage("game-progress", {})

  // Load Phaser.js dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Phaser) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"
      script.async = true
      script.onload = () => {
        setGameLoaded(true)
      }
      document.body.appendChild(script)
      setGameScript(script)
    } else if (typeof window !== "undefined" && window.Phaser) {
      setGameLoaded(true)
    }

    return () => {
      if (gameScript) {
        document.body.removeChild(gameScript)
      }
      if (gameInstance) {
        gameInstance.destroy(true)
      }
    }
  }, [])

  // Initialize the appropriate game based on gameType
  useEffect(() => {
    if (gameLoaded && gameContainerRef.current && !gameInstance) {
      let game

      const config = {
        type: window.Phaser.AUTO,
        width: 800,
        height: 400,
        parent: gameContainerRef.current,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 300 },
            debug: false,
          },
        },
        scene: {
          preload: function () {
            // Preload assets based on game type
            this.load.image("sky", "/placeholder.svg?height=400&width=800")
            this.load.image("ground", "/placeholder.svg?height=50&width=800")
            this.load.image("coin", "/placeholder.svg?height=30&width=30")
            this.load.image("player", "/placeholder.svg?height=50&width=50")
            this.load.image("obstacle", "/placeholder.svg?height=50&width=50")
          },
          create: function () {
            // Create game elements based on game type
            this.add.image(400, 200, "sky")

            const platforms = this.physics.add.staticGroup()
            platforms.create(400, 375, "ground")

            const player = this.physics.add.sprite(100, 300, "player")
            player.setBounce(0.2)
            player.setCollideWorldBounds(true)

            this.physics.add.collider(player, platforms)

            // Create game-specific elements
            if (gameType === "no-spend-day") {
              createCoinTapGame(this, player)
            } else if (gameType === "weekly-budget") {
              createObstacleJumpGame(this, player, platforms)
            } else if (gameType === "track-days") {
              createBudgetTetrisGame(this, player)
            } else if (gameType === "avoid-impulse") {
              createFruitNinjaGame(this, player)
            } else if (gameType === "save-money") {
              createFarmBuilderGame(this, player)
            }

            // Score text
            this.scoreText = this.add.text(16, 16, "Score: 0", {
              fontSize: "32px",
              color: "#000",
            })

            // Update score function
            this.updateScore = (points) => {
              this.score = (this.score || 0) + points
              this.scoreText.setText("Score: " + this.score)
              setScore(this.score)
            }
          },
          update: () => {
            // Game update logic
          },
        },
      }

      // Game-specific creation functions
      function createCoinTapGame(scene, player) {
        const coins = scene.physics.add.group({
          key: "coin",
          repeat: 11,
          setXY: { x: 12, y: 0, stepX: 70 },
        })

        coins.children.iterate((child) => {
          child.setBounceY(window.Phaser.Math.FloatBetween(0.4, 0.8))
        })

        scene.physics.add.collider(coins, scene.platforms)

        scene.physics.add.overlap(player, coins, collectCoin, null, scene)

        function collectCoin(player, coin) {
          coin.disableBody(true, true)
          scene.updateScore(10)

          if (coins.countActive(true) === 0) {
            coins.children.iterate((child) => {
              child.enableBody(true, child.x, 0, true, true)
            })
          }
        }
      }

      function createObstacleJumpGame(scene, player, platforms) {
        // Create obstacles
        const obstacles = scene.physics.add.group()

        // Timer for spawning obstacles
        scene.time.addEvent({
          delay: 2000,
          callback: () => {
            const obstacle = obstacles.create(800, 330, "obstacle")
            obstacle.setVelocityX(-200)
            obstacle.body.allowGravity = false
          },
          callbackScope: scene,
          loop: true,
        })

        // Jump control
        scene.input.keyboard.on("keydown-SPACE", () => {
          if (player.body.touching.down) {
            player.setVelocityY(-330)
          }
        })

        // Collision with obstacles
        scene.physics.add.collider(player, obstacles, hitObstacle, null, scene)

        function hitObstacle(player, obstacle) {
          scene.physics.pause()
          player.setTint(0xff0000)

          scene.time.addEvent({
            delay: 1000,
            callback: () => {
              scene.scene.restart()
            },
            callbackScope: scene,
            loop: false,
          })
        }

        // Score increases over time
        scene.time.addEvent({
          delay: 1000,
          callback: () => {
            scene.updateScore(1)
          },
          callbackScope: scene,
          loop: true,
        })
      }

      function createBudgetTetrisGame(scene, player) {
        // Simplified Tetris-like game
        // This would be more complex in a real implementation
        const blocks = scene.physics.add.group()

        scene.input.keyboard.on("keydown-LEFT", () => {
          player.setVelocityX(-160)
        })

        scene.input.keyboard.on("keydown-RIGHT", () => {
          player.setVelocityX(160)
        })

        scene.input.keyboard.on("keyup", () => {
          player.setVelocityX(0)
        })

        // Timer for spawning blocks
        scene.time.addEvent({
          delay: 3000,
          callback: () => {
            const x = window.Phaser.Math.Between(0, 800)
            const block = blocks.create(x, 0, "obstacle")
            block.setScale(2)

            scene.physics.add.collider(player, block, collectBlock, null, scene)
          },
          callbackScope: scene,
          loop: true,
        })

        function collectBlock(player, block) {
          block.disableBody(true, true)
          scene.updateScore(5)
        }
      }

      function createFruitNinjaGame(scene, player) {
        // Simplified Fruit Ninja-like game
        const items = scene.physics.add.group()

        // Make player follow pointer
        scene.input.on("pointermove", (pointer) => {
          player.x = pointer.x
          player.y = pointer.y
        })

        // Timer for spawning items
        scene.time.addEvent({
          delay: 1000,
          callback: () => {
            const x = window.Phaser.Math.Between(0, 800)
            const item = items.create(x, 600, "coin")
            item.setVelocityY(-300)
            item.setVelocityX(window.Phaser.Math.Between(-100, 100))

            scene.physics.add.overlap(player, item, sliceItem, null, scene)

            // Remove items that go off screen
            scene.time.addEvent({
              delay: 3000,
              callback: () => {
                item.disableBody(true, true)
              },
              callbackScope: scene,
              loop: false,
            })
          },
          callbackScope: scene,
          loop: true,
        })

        function sliceItem(player, item) {
          item.disableBody(true, true)
          scene.updateScore(1)
        }
      }

      function createFarmBuilderGame(scene, player) {
        // Simplified Farm Builder game
        const resources = scene.physics.add.group()
        const crops = scene.physics.add.staticGroup()

        // Make player follow pointer
        scene.input.on("pointermove", (pointer) => {
          player.x = pointer.x
          player.y = pointer.y
        })

        // Timer for spawning resources
        scene.time.addEvent({
          delay: 2000,
          callback: () => {
            const x = window.Phaser.Math.Between(100, 700)
            const y = window.Phaser.Math.Between(100, 300)
            const resource = resources.create(x, y, "coin")

            scene.physics.add.overlap(player, resource, collectResource, null, scene)
          },
          callbackScope: scene,
          loop: true,
        })

        // Plant crops on click
        scene.input.on("pointerdown", (pointer) => {
          if (scene.score >= 10) {
            crops.create(pointer.x, pointer.y, "obstacle")
            scene.updateScore(-10)
            scene.updateScore(15) // Net gain of 5
          }
        })

        function collectResource(player, resource) {
          resource.disableBody(true, true)
          scene.updateScore(5)
        }
      }

      game = new window.Phaser.Game(config)
      setGameInstance(game)
    }
  }, [gameLoaded, gameType])

  // Handle game completion
  useEffect(() => {
    if (score >= 100) {
      // Save progress
      setUserProgress((prev) => ({
        ...prev,
        [challengeId]: {
          completed: true,
          score: score,
        },
      }))

      // Call the completion callback
      onComplete(score)
    }
  }, [score, challengeId, onComplete])

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold">Score: {score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Target: 100</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span>Reward: ₹50</span>
          </div>
        </div>

        <div ref={gameContainerRef} className="w-full h-[400px] bg-slate-100 rounded-md overflow-hidden">
          {!gameLoaded && (
            <div className="w-full h-full flex items-center justify-center">
              <p>Loading game...</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={() => setScore(0)}>
            Restart
          </Button>
          <Button variant="default" onClick={() => onComplete(score)} disabled={score < 100}>
            Complete Challenge
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
