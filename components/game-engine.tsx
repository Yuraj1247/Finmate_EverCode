"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, RefreshCw, Pause, Play } from "lucide-react"
import type { GameState, GameConfig } from "@/types/finance"

// We'll load Phaser dynamically on the client side
let Phaser: any

interface GameEngineProps {
  gameType: "coin" | "obstacle" | "tetris" | "ninja" | "farm"
  config: GameConfig
  onComplete: (score: number) => void
  onProgress?: (progress: number) => void
}

export function GameEngine({ gameType, config, onComplete, onProgress }: GameEngineProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameInstanceRef = useRef<any>(null)
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    paused: false,
  })
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  // Load Phaser dynamically on the client
  useEffect(() => {
    const loadPhaser = async () => {
      try {
        // Dynamic import for Phaser
        const phaserModule = await import("phaser")
        Phaser = phaserModule.default
        setLoading(false)
        initGame()
      } catch (error) {
        console.error("Failed to load Phaser:", error)
      }
    }

    loadPhaser()

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true)
      }
    }
  }, [])

  // Initialize the game based on the game type
  const initGame = () => {
    if (!gameContainerRef.current || !Phaser) return

    // Clean up any existing game
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy(true)
    }

    // Reset game state
    setGameState({
      score: 0,
      level: 1,
      lives: 3,
      gameOver: false,
      paused: false,
    })
    setProgress(0)

    // Create game configuration
    const gameConfig = {
      type: Phaser.AUTO,
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
        preload: function (this: any) {
          // Preload game assets based on game type
          this.load.image("background", "/placeholder.svg?height=400&width=800")

          switch (gameType) {
            case "coin":
              this.load.image("player", "/placeholder.svg?height=50&width=50")
              this.load.image("coin", "/placeholder.svg?height=30&width=30")
              this.load.image("platform", "/placeholder.svg?height=20&width=200")
              break
            case "obstacle":
              this.load.image("player", "/placeholder.svg?height=50&width=50")
              this.load.image("obstacle", "/placeholder.svg?height=50&width=30")
              this.load.image("platform", "/placeholder.svg?height=20&width=800")
              break
            case "tetris":
              this.load.image("block", "/placeholder.svg?height=30&width=30")
              break
            case "ninja":
              this.load.image("player", "/placeholder.svg?height=100&width=50")
              this.load.image("fruit", "/placeholder.svg?height=40&width=40")
              this.load.image("temptation", "/placeholder.svg?height=40&width=40")
              break
            case "farm":
              this.load.image("plot", "/placeholder.svg?height=60&width=60")
              this.load.image("crop", "/placeholder.svg?height=40&width=40")
              this.load.image("coin", "/placeholder.svg?height=30&width=30")
              break
          }
        },
        create: function (this: any) {
          // Set up the game scene based on game type
          this.add.image(400, 200, "background")

          // Game-specific setup
          switch (gameType) {
            case "coin":
              setupCoinGame(this)
              break
            case "obstacle":
              setupObstacleGame(this)
              break
            case "tetris":
              setupTetrisGame(this)
              break
            case "ninja":
              setupNinjaGame(this)
              break
            case "farm":
              setupFarmGame(this)
              break
          }

          // Set up score display
          this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "24px",
            fill: "#fff",
            stroke: "#000",
            strokeThickness: 4,
          })

          // Set up lives display
          this.livesText = this.add.text(650, 16, "Lives: 3", {
            fontSize: "24px",
            fill: "#fff",
            stroke: "#000",
            strokeThickness: 4,
          })
        },
        update: function (this: any) {
          // Game-specific update logic
          switch (gameType) {
            case "coin":
              updateCoinGame(this)
              break
            case "obstacle":
              updateObstacleGame(this)
              break
            case "tetris":
              updateTetrisGame(this)
              break
            case "ninja":
              updateNinjaGame(this)
              break
            case "farm":
              updateFarmGame(this)
              break
          }

          // Update game state
          setGameState((prev) => ({
            ...prev,
            score: this.score || 0,
            lives: this.lives || 3,
            gameOver: this.gameOver || false,
          }))

          // Update progress
          const newProgress = Math.min(100, Math.floor((this.score / config.targetScore) * 100))
          setProgress(newProgress)
          if (onProgress) onProgress(newProgress)

          // Check for game completion
          if (this.score >= config.targetScore && !this.gameCompleted) {
            this.gameCompleted = true
            onComplete(this.score)
          }

          // Check for game over
          if (this.lives <= 0 && !this.gameOver) {
            this.gameOver = true
            this.physics.pause()
          }
        },
      },
    }

    // Create the game instance
    gameInstanceRef.current = new Phaser.Game(gameConfig)
  }

  // Game-specific setup functions
  const setupCoinGame = (scene: any) => {
    // Create platforms
    scene.platforms = scene.physics.add.staticGroup()
    scene.platforms.create(400, 390, "platform").setScale(4, 1).refreshBody()
    scene.platforms.create(600, 250, "platform")
    scene.platforms.create(50, 250, "platform")
    scene.platforms.create(750, 150, "platform")

    // Create player
    scene.player = scene.physics.add.sprite(100, 300, "player")
    scene.player.setBounce(0.2)
    scene.player.setCollideWorldBounds(true)

    // Create coins
    scene.coins = scene.physics.add.group({
      key: "coin",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    })

    scene.coins.children.iterate((child: any) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })

    // Set up collisions
    scene.physics.add.collider(scene.player, scene.platforms)
    scene.physics.add.collider(scene.coins, scene.platforms)
    scene.physics.add.overlap(scene.player, scene.coins, collectCoin, null, scene)

    // Set up controls
    scene.cursors = scene.input.keyboard.createCursorKeys()

    // Set up game variables
    scene.score = 0
    scene.lives = 3
    scene.gameOver = false

    // Collect coin function
    function collectCoin(player: any, coin: any) {
      coin.disableBody(true, true)
      scene.score += 10
      scene.scoreText.setText("Score: " + scene.score)

      if (scene.coins.countActive(true) === 0) {
        scene.coins.children.iterate((child: any) => {
          child.enableBody(true, child.x, 0, true, true)
        })
      }
    }
  }

  const updateCoinGame = (scene: any) => {
    if (scene.gameOver) return

    // Player movement
    if (scene.cursors.left.isDown) {
      scene.player.setVelocityX(-160)
    } else if (scene.cursors.right.isDown) {
      scene.player.setVelocityX(160)
    } else {
      scene.player.setVelocityX(0)
    }

    if (scene.cursors.up.isDown && scene.player.body.touching.down) {
      scene.player.setVelocityY(-330)
    }
  }

  const setupObstacleGame = (scene: any) => {
    // Create platform
    scene.platforms = scene.physics.add.staticGroup()
    scene.platforms.create(400, 390, "platform").setScale(4, 1).refreshBody()

    // Create player
    scene.player = scene.physics.add.sprite(100, 300, "player")
    scene.player.setBounce(0.2)
    scene.player.setCollideWorldBounds(true)

    // Create obstacles
    scene.obstacles = scene.physics.add.group()

    // Set up timer for obstacles
    scene.obstacleTimer = scene.time.addEvent({
      delay: 1500,
      callback: () => {
        const obstacle = scene.obstacles.create(800, 330, "obstacle")
        obstacle.setVelocityX(-200)
        obstacle.setCollideWorldBounds(false)
      },
      callbackScope: scene,
      loop: true,
    })

    // Set up collisions
    scene.physics.add.collider(scene.player, scene.platforms)
    scene.physics.add.collider(scene.obstacles, scene.platforms)
    scene.physics.add.overlap(scene.player, scene.obstacles, hitObstacle, null, scene)

    // Set up controls
    scene.cursors = scene.input.keyboard.createCursorKeys()

    // Set up game variables
    scene.score = 0
    scene.lives = 3
    scene.gameOver = false

    // Score increment timer
    scene.scoreTimer = scene.time.addEvent({
      delay: 1000,
      callback: () => {
        scene.score += 1
        scene.scoreText.setText("Score: " + scene.score)
      },
      callbackScope: scene,
      loop: true,
    })

    // Hit obstacle function
    function hitObstacle(player: any, obstacle: any) {
      obstacle.disableBody(true, true)
      scene.lives -= 1
      scene.livesText.setText("Lives: " + scene.lives)

      if (scene.lives <= 0) {
        scene.gameOver = true
        scene.physics.pause()
      }
    }
  }

  const updateObstacleGame = (scene: any) => {
    if (scene.gameOver) return

    // Player movement
    if (scene.cursors.up.isDown && scene.player.body.touching.down) {
      scene.player.setVelocityY(-330)
    }

    // Clean up obstacles that have left the screen
    scene.obstacles.children.iterate((child: any) => {
      if (child && child.x < -50) {
        child.disableBody(true, true)
      }
    })
  }

  // Placeholder functions for other game types
  const setupTetrisGame = (scene: any) => {
    // Simplified Tetris-like game setup
    scene.score = 0
    scene.lives = 3
    scene.gameOver = false

    // Create grid
    scene.grid = []
    for (let i = 0; i < 10; i++) {
      scene.grid[i] = []
      for (let j = 0; j < 20; j++) {
        scene.grid[i][j] = 0
      }
    }

    // Create blocks group
    scene.blocks = scene.add.group()

    // Create active piece
    scene.createNewPiece()

    // Set up controls
    scene.cursors = scene.input.keyboard.createCursorKeys()
    scene.lastMoveTime = 0
  }

  const updateTetrisGame = (scene: any) => {
    // Simplified Tetris update logic
    if (scene.gameOver) return

    const time = scene.time.now
    if (time > scene.lastMoveTime + 1000) {
      scene.movePieceDown()
      scene.lastMoveTime = time
    }

    // Handle controls
    if (scene.cursors.left.isDown && scene.cursors.left.getDuration() < 100) {
      scene.movePieceLeft()
    } else if (scene.cursors.right.isDown && scene.cursors.right.getDuration() < 100) {
      scene.movePieceRight()
    } else if (scene.cursors.down.isDown) {
      scene.movePieceDown()
      scene.lastMoveTime = time
    } else if (scene.cursors.up.isDown && scene.cursors.up.getDuration() < 100) {
      scene.rotatePiece()
    }
  }

  const setupNinjaGame = (scene: any) => {
    // Fruit Ninja style game
    scene.score = 0
    scene.lives = 3
    scene.gameOver = false

    // Create groups for fruits and temptations
    scene.fruits = scene.physics.add.group()
    scene.temptations = scene.physics.add.group()

    // Set up timer for launching items
    scene.launchTimer = scene.time.addEvent({
      delay: 1200,
      callback: () => {
        // Launch a fruit or temptation
        const x = Phaser.Math.Between(100, 700)
        const isTemptation = Phaser.Math.Between(0, 3) === 0 // 25% chance for temptation

        const item = isTemptation
          ? scene.temptations.create(x, 600, "temptation")
          : scene.fruits.create(x, 600, "fruit")

        item.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-600, -300))
        item.setAngularVelocity(Phaser.Math.Between(-100, 100))
        item.setCollideWorldBounds(false)
      },
      callbackScope: scene,
      loop: true,
    })

    // Set up input for slicing
    scene.input.on("pointermove", (pointer: any) => {
      if (pointer.isDown) {
        // Check for collision with fruits
        scene.fruits.children.iterate((fruit: any) => {
          if (fruit && Phaser.Geom.Rectangle.ContainsPoint(fruit.getBounds(), pointer)) {
            fruit.disableBody(true, true)
            scene.score += 10
            scene.scoreText.setText("Score: " + scene.score)
          }
        })

        // Check for collision with temptations
        scene.temptations.children.iterate((temptation: any) => {
          if (temptation && Phaser.Geom.Rectangle.ContainsPoint(temptation.getBounds(), pointer)) {
            temptation.disableBody(true, true)
            scene.lives -= 1
            scene.livesText.setText("Lives: " + scene.lives)

            if (scene.lives <= 0) {
              scene.gameOver = true
              scene.physics.pause()
            }
          }
        })
      }
    })
  }

  const updateNinjaGame = (scene: any) => {
    if (scene.gameOver) return

    // Remove items that have fallen off the screen
    scene.fruits.children.iterate((fruit: any) => {
      if (fruit && fruit.y > 600) {
        fruit.disableBody(true, true)
        scene.lives -= 1
        scene.livesText.setText("Lives: " + scene.lives)

        if (scene.lives <= 0) {
          scene.gameOver = true
          scene.physics.pause()
        }
      }
    })

    scene.temptations.children.iterate((temptation: any) => {
      if (temptation && temptation.y > 600) {
        temptation.disableBody(true, true)
      }
    })
  }

  const setupFarmGame = (scene: any) => {
    // Farm builder game
    scene.score = 0
    scene.lives = 3
    scene.gameOver = false
    scene.money = 100

    // Create grid of plots
    scene.plots = []
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        const plot = scene.add.image(150 + i * 120, 150 + j * 120, "plot")
        plot.setInteractive()
        plot.on("pointerdown", () => {
          if (scene.money >= 50 && !plot.data.has("planted")) {
            scene.money -= 50
            plot.setData("planted", true)
            plot.setData("growthStage", 0)
            plot.setData("growthTimer", scene.time.now)

            // Add crop to the plot
            const crop = scene.add.image(plot.x, plot.y - 10, "crop")
            crop.setScale(0.5)
            plot.setData("crop", crop)
          }
        })
        scene.plots.push(plot)
      }
    }

    // Create money display
    scene.moneyText = scene.add.text(16, 50, "Money: ₹100", {
      fontSize: "20px",
      fill: "#fff",
      stroke: "#000",
      strokeThickness: 3,
    })

    // Create instruction text
    scene.add
      .text(400, 50, "Click on plots to plant (₹50)", {
        fontSize: "18px",
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
  }

  const updateFarmGame = (scene: any) => {
    if (scene.gameOver) return

    const currentTime = scene.time.now

    // Update plots and crops
    scene.plots.forEach((plot: any) => {
      if (plot.data.has("planted")) {
        const growthStage = plot.getData("growthStage")
        const growthTimer = plot.getData("growthTimer")

        // Check if it's time to grow
        if (currentTime > growthTimer + 3000 && growthStage < 3) {
          plot.setData("growthStage", growthStage + 1)
          plot.setData("growthTimer", currentTime)

          const crop = plot.getData("crop")
          crop.setScale(0.5 + growthStage * 0.2)

          // If fully grown, make it harvestable
          if (growthStage + 1 === 3) {
            crop.setInteractive()
            crop.on("pointerdown", () => {
              // Harvest the crop
              scene.money += 100
              scene.moneyText.setText("Money: ₹" + scene.money)
              scene.score += 10
              scene.scoreText.setText("Score: " + scene.score)

              // Reset the plot
              plot.setData("planted", false)
              crop.destroy()
            })
          }
        }
      }
    })

    // Update money display
    scene.moneyText.setText("Money: ₹" + scene.money)
  }

  // Handle restart game
  const handleRestart = () => {
    initGame()
  }

  // Handle pause/resume game
  const handlePauseResume = () => {
    if (!gameInstanceRef.current) return

    setGameState((prev) => {
      const newPaused = !prev.paused

      if (newPaused) {
        gameInstanceRef.current.scene.pause()
      } else {
        gameInstanceRef.current.scene.resume()
      }

      return { ...prev, paused: newPaused }
    })
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center h-[400px] bg-slate-100 dark:bg-slate-800 rounded-lg">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading game engine...</p>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={gameContainerRef}
            className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
          ></div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-sm font-medium">Progress</div>
                <Progress value={progress} className="h-2 w-[200px]" />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRestart}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Restart
                </Button>

                <Button variant="outline" size="sm" onClick={handlePauseResume}>
                  {gameState.paused ? (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Card className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">{gameState.score}</div>
                  <div className="text-sm text-slate-500">Score</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-500">Target</div>
                  <div className="text-2xl font-bold">{config.targetScore}</div>
                </div>
              </div>

              {gameState.gameOver && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-md text-center">
                  <p className="font-medium text-red-600 dark:text-red-400">Game Over!</p>
                  <p className="text-sm mt-1">Try again to complete the challenge</p>
                </div>
              )}

              {gameState.score >= config.targetScore && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-md text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="font-medium text-green-600 dark:text-green-400">Challenge Complete!</p>
                  </div>
                  <p className="text-sm mt-1">Great job! You've earned {gameState.score} points</p>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
