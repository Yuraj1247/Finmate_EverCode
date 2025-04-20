"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Environment, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import type { Challenge } from "@/types/finance"
import type * as THREE from "three"

interface GameChallengeProps {
  challenge: Challenge
  onComplete: (id: string) => void
}

export function GameChallenge({ challenge, onComplete }: GameChallengeProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)

  const handleStartGame = () => {
    setGameStarted(true)
  }

  const handleCompleteGame = () => {
    setGameCompleted(true)
    onComplete(challenge.id)
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Environment preset="city" />

        {!gameStarted ? (
          <IntroScene challenge={challenge} onStart={handleStartGame} />
        ) : !gameCompleted ? (
          <GameScene challenge={challenge} onComplete={handleCompleteGame} />
        ) : (
          <CompletionScene challenge={challenge} />
        )}

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}

function IntroScene({ challenge, onStart }: { challenge: Challenge; onStart: () => void }) {
  return (
    <group>
      <Text position={[0, 2, 0]} fontSize={1} color="#3b82f6" anchorX="center" anchorY="middle" maxWidth={8}>
        {challenge.title}
      </Text>

      <Text position={[0, 0.5, 0]} fontSize={0.5} color="#64748b" anchorX="center" anchorY="middle" maxWidth={8}>
        {challenge.description}
      </Text>

      <Text position={[0, -0.5, 0]} fontSize={0.4} color="#16a34a" anchorX="center" anchorY="middle">
        Earn {challenge.points} points
      </Text>

      <Html position={[0, -2, 0]} center>
        <Button onClick={onStart} className="bg-blue-600 hover:bg-blue-700">
          Start Challenge
        </Button>
      </Html>
    </group>
  )
}

function GameScene({ challenge, onComplete }: { challenge: Challenge; onComplete: () => void }) {
  const [coins, setCoins] = useState<{ id: number; x: number; y: number; collected: boolean }[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const playerRef = useRef<THREE.Mesh>(null)
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: -3 })

  // Generate coins
  useEffect(() => {
    const newCoins = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 14 - 7,
      y: Math.random() * 6 - 3,
      collected: false,
    }))
    setCoins(newCoins)
  }, [])

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && score < 5) {
      // Game over - not enough coins collected
      setTimeLeft(-1)
    }
  }, [timeLeft, score])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 0.5
      let newX = playerPosition.x
      let newY = playerPosition.y

      switch (e.key) {
        case "ArrowUp":
          newY = Math.min(playerPosition.y + speed, 3)
          break
        case "ArrowDown":
          newY = Math.max(playerPosition.y - speed, -3)
          break
        case "ArrowLeft":
          newX = Math.max(playerPosition.x - speed, -7)
          break
        case "ArrowRight":
          newX = Math.min(playerPosition.x + speed, 7)
          break
      }

      setPlayerPosition({ x: newX, y: newY })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [playerPosition])

  // Check for coin collection
  useEffect(() => {
    const newCoins = [...coins]
    let collected = false

    newCoins.forEach((coin) => {
      if (!coin.collected) {
        const distance = Math.sqrt(Math.pow(playerPosition.x - coin.x, 2) + Math.pow(playerPosition.y - coin.y, 2))

        if (distance < 1) {
          coin.collected = true
          collected = true
        }
      }
    })

    if (collected) {
      setCoins(newCoins)
      const newScore = newCoins.filter((c) => c.collected).length
      setScore(newScore)

      if (newScore >= 5) {
        // Game completed successfully
        onComplete()
      }
    }
  }, [coins, playerPosition, onComplete])

  return (
    <group>
      {/* Player */}
      <mesh ref={playerRef} position={[playerPosition.x, playerPosition.y, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Coins */}
      {coins.map(
        (coin) =>
          !coin.collected && (
            <mesh key={coin.id} position={[coin.x, coin.y, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
            </mesh>
          ),
      )}

      {/* Game UI */}
      <Html position={[0, 4, 0]} center>
        <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-md text-center">
          <div className="text-sm font-bold">Collect 5 coins to complete the challenge!</div>
          <div className="flex justify-between text-sm mt-1">
            <span>Score: {score}/5</span>
            <span>Time: {timeLeft > 0 ? timeLeft : "Time's up!"}</span>
          </div>
          <div className="text-xs mt-1 text-slate-500">Use arrow keys to move</div>
        </div>
      </Html>

      {timeLeft === -1 && (
        <Html position={[0, 0, 0]} center>
          <div className="bg-white/90 dark:bg-slate-800/90 p-4 rounded-md text-center">
            <div className="text-lg font-bold text-red-500 mb-2">Game Over!</div>
            <div className="mb-3">You didn't collect enough coins in time.</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Html>
      )}
    </group>
  )
}

function CompletionScene({ challenge }: { challenge: Challenge }) {
  const coinRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (coinRef.current) {
      coinRef.current.rotation.y = state.clock.getElapsedTime()
    }
  })

  return (
    <group>
      <Text position={[0, 2, 0]} fontSize={1} color="#16a34a" anchorX="center" anchorY="middle">
        Challenge Complete!
      </Text>

      <group ref={coinRef} position={[0, 0, 0]}>
        {Array.from({ length: 5 }).map((_, index) => (
          <mesh key={index} position={[Math.cos(index * Math.PI * 0.4) * 2, Math.sin(index * Math.PI * 0.4) * 2, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>

      <Text position={[0, -2, 0]} fontSize={0.6} color="#3b82f6" anchorX="center" anchorY="middle">
        You earned {challenge.points} points!
      </Text>
    </group>
  )
}
