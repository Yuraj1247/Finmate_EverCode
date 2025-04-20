"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Cloud, Stars, Text, Float, Html, Sparkles } from "@react-three/drei"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import * as THREE from "three"
import { gsap } from "gsap"
import type { Goal } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"
import { useNotifications } from "@/hooks/use-notifications"

interface IslandVisualizerProps {
  goal: Goal
  onContribute: (amount: number) => void
}

export function IslandVisualizer({ goal, onContribute }: IslandVisualizerProps) {
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [contributeAmount, setContributeAmount] = useState("")
  const [showMotivationalQuote, setShowMotivationalQuote] = useState(false)
  const { notificationService } = useNotifications()

  // Calculate progress percentage
  const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))

  // Track previous progress for animations
  const [previousProgress, setPreviousProgress] = useState(progress)
  const [showGrowthAnimation, setShowGrowthAnimation] = useState(false)

  // Determine growth stage based on progress
  const getGrowthStage = (progressValue: number = progress) => {
    if (progressValue < 5) return "seed"
    if (progressValue < 25) return "seedling"
    if (progressValue < 50) return "small-tree"
    if (progressValue < 75) return "medium-tree"
    if (progressValue < 95) return "large-tree"
    if (progressValue < 100) return "paradise"
    return "completed"
  }

  const growthStage = getGrowthStage()

  // Motivational quotes
  const motivationalQuotes = [
    "The best time to start saving was yesterday. The second best time is now.",
    "Small steps lead to big achievements. Keep going!",
    "Financial freedom is a journey, not a destination.",
    "Every dollar saved is a step toward your dreams.",
    "Your future self will thank you for the sacrifices you make today.",
    "Wealth is not about having a lot of money; it's about having a lot of options.",
    "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order.",
    "Do not save what is left after spending, but spend what is left after saving.",
    "It's not how much money you make, but how much money you keep.",
    "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.",
  ]

  // Handle contribution
  const handleContribute = () => {
    const amount = Number.parseFloat(contributeAmount)
    if (!isNaN(amount) && amount > 0) {
      setPreviousProgress(progress)
      onContribute(amount)
      setContributeAmount("")
      setShowContributeModal(false)
      setShowGrowthAnimation(true)

      // Create a notification for goal progress
      const newProgress = Math.min(100, Math.round(((goal.currentAmount + amount) / goal.targetAmount) * 100))
      if (
        (newProgress >= 25 && previousProgress < 25) ||
        (newProgress >= 50 && previousProgress < 50) ||
        (newProgress >= 75 && previousProgress < 75) ||
        (newProgress >= 100 && previousProgress < 100)
      ) {
        notificationService.goalProgress(goal.name, newProgress)
      }

      // Hide animation after it completes
      setTimeout(() => {
        setShowGrowthAnimation(false)
      }, 3000)
    }
  }

  // Show motivational quote when island is clicked
  const handleIslandClick = () => {
    setShowMotivationalQuote(true)
    setTimeout(() => {
      setShowMotivationalQuote(false)
    }, 5000)
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <color attach="background" args={["#87CEEB"]} />
        <fog attach="fog" args={["#87CEEB", 10, 50]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Island Scene */}
        <Island
          growthStage={growthStage}
          progress={progress}
          goalName={goal.name}
          showGrowthAnimation={showGrowthAnimation}
          previousProgress={previousProgress}
          onClick={handleIslandClick}
        />

        {/* Environment */}
        <Environment preset="sunset" />
        <CloudLayer />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Motivational Quote Overlay */}
      {showMotivationalQuote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div className="bg-white/90 dark:bg-slate-800/90 p-6 rounded-lg max-w-md text-center">
            <p className="text-lg font-medium italic mb-4">
              "{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}"
            </p>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p>Goal: {goal.name}</p>
              <p>Progress: {progress}%</p>
              <p>Current: {formatCurrency(goal.currentAmount)}</p>
              <p>Target: {formatCurrency(goal.targetAmount)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{goal.name}</h3>
          <span className="text-sm">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {progress < 10 && "Plant the seed of your financial future!"}
              {progress >= 10 && progress < 30 && "Your goal is starting to grow!"}
              {progress >= 30 && progress < 50 && "Keep going, your island is developing!"}
              {progress >= 50 && progress < 75 && "You're making great progress!"}
              {progress >= 75 && progress < 100 && "Almost there, your paradise awaits!"}
              {progress >= 100 && "Congratulations! You've reached your goal!"}
            </p>
          </div>

          <Button size="sm" onClick={() => setShowContributeModal(true)} disabled={progress >= 100}>
            Add Funds
          </Button>
        </div>
      </div>

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg w-64"
          >
            <h3 className="font-bold mb-2">Add to your goal</h3>
            <input
              type="number"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 border rounded mb-3 dark:bg-slate-700 dark:border-slate-600"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowContributeModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleContribute}>
                Add
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Island component with different growth stages
function Island({
  growthStage,
  progress,
  goalName,
  showGrowthAnimation,
  previousProgress,
  onClick,
}: {
  growthStage: string
  progress: number
  goalName: string
  showGrowthAnimation: boolean
  previousProgress: number
  onClick: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const treeRef = useRef<THREE.Group>(null)
  const { scene } = useThree()

  // Animate island based on progress
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1

      // Gentle rotation
      if (progress < 100) {
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
      } else {
        // Celebration rotation when completed
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
      }
    }
  })

  // Growth animation when funds are added
  useEffect(() => {
    if (showGrowthAnimation && treeRef.current) {
      // Animate tree growth
      gsap.fromTo(
        treeRef.current.scale,
        {
          x: treeRef.current.scale.x * 0.8,
          y: treeRef.current.scale.y * 0.8,
          z: treeRef.current.scale.z * 0.8,
        },
        {
          x: treeRef.current.scale.x,
          y: treeRef.current.scale.y,
          z: treeRef.current.scale.z,
          duration: 1.5,
          ease: "elastic.out(1, 0.3)",
        },
      )
    }
  }, [showGrowthAnimation])

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* Base Island */}
      <BaseIsland />

      {/* Growth Elements based on stage */}
      {growthStage !== "seed" && <WaterArea />}

      <group ref={treeRef}>
        {growthStage === "seed" && <Seed />}
        {growthStage === "seedling" && <Seedling />}
        {growthStage === "small-tree" && <SmallTree />}
        {growthStage === "medium-tree" && <MediumTree />}
        {growthStage === "large-tree" && <LargeTree />}
        {growthStage === "paradise" && <Paradise />}
        {growthStage === "completed" && <CompletedIsland />}
      </group>

      {/* Goal Name */}
      <Float floatIntensity={0.5} rotationIntensity={0.2} speed={2}>
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {goalName}
        </Text>
      </Float>

      {/* Progress Indicator */}
      {progress < 100 && (
        <Html position={[0, 2, 0]} center transform occlude>
          <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded-full text-xs font-bold">{progress}%</div>
        </Html>
      )}

      {/* Celebration elements when completed */}
      {progress >= 100 && <CelebrationEffects />}
    </group>
  )
}

// Seed stage (0-5%)
function Seed() {
  return (
    <group position={[0, 0.05, 0]}>
      {/* Small dirt mound */}
      <mesh position={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.3, 0.3, 16]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>

      {/* Tiny seed */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  )
}

// Seedling stage (5-25%)
function Seedling() {
  return (
    <group position={[0, 0.05, 0]}>
      {/* Small dirt mound */}
      <mesh position={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.3, 0.3, 16]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>

      {/* Tiny seedling */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#7CFC00" />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

// Small tree stage (25-50%)
function SmallTree() {
  return (
    <group position={[0, 0.05, 0]}>
      {/* Tree trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Tree foliage */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[0.6, 1.2, 16]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

// Medium tree stage (50-75%)
function MediumTree() {
  return (
    <group>
      {/* Tree trunk */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.6, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Tree foliage layers */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.8, 1.4, 16]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[0.6, 1, 16]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>

      {/* Small pond */}
      <mesh position={[1, 0.05, 1]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#4169E1" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

// Large tree stage (75-95%)
function LargeTree() {
  return (
    <group>
      {/* Main tree */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* Secondary trees */}
      <mesh position={[1.5, 0.4, 1]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[1.5, 0.9, 1]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>

      <mesh position={[-1.2, 0.4, -0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[-1.2, 0.9, -0.5]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>

      {/* River */}
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1, 4]} />
        <meshStandardMaterial color="#4169E1" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

// Paradise stage (95-99%)
function Paradise() {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waterRef.current) {
      // Animate water
      waterRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.05 + 0.06
    }
  })

  return (
    <group>
      {/* Main tree */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 2.4, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[0, 2.6, 0]} castShadow>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* Multiple trees */}
      {[
        [1.8, 0, 1.2],
        [-1.5, 0, 1],
        [-1.2, 0, -1.5],
        [1.5, 0, -1],
        [0, 0, 2],
      ].map((position, index) => (
        <group key={index} position={[position[0], position[1], position[2]]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>

          <mesh position={[0, 1.1, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color={index % 2 === 0 ? "#228B22" : "#32CD32"} />
          </mesh>
        </group>
      ))}

      {/* Lake */}
      <mesh ref={waterRef} position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#4169E1" transparent opacity={0.8} />
      </mesh>

      {/* Waterfall */}
      <mesh position={[-1, 0.5, -1]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#A9A9A9" />
      </mesh>

      <mesh position={[-1, 1.1, -1]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.9} />
      </mesh>

      {/* Hut */}
      <mesh position={[1.5, 0.3, -1.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 8]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>

      <mesh position={[1.5, 0.8, -1.5]} castShadow>
        <coneGeometry args={[0.5, 0.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  )
}

// Completed island (100%)
function CompletedIsland() {
  const waterRef = useRef<THREE.Mesh>(null)
  const palmRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (waterRef.current) {
      // Animate water
      waterRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.05 + 0.06
    }

    if (palmRef.current) {
      // Animate palm trees swaying
      palmRef.current.children.forEach((child, i) => {
        child.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5 + i) * 0.05
        child.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.5 + i) * 0.05
      })
    }
  })

  return (
    <group>
      {/* Lush vegetation */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.2, 32]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* Palm trees */}
      <group ref={palmRef}>
        {[
          [2, 0, 0],
          [-2, 0, 0],
          [0, 0, 2],
          [0, 0, -2],
          [1.5, 0, 1.5],
          [-1.5, 0, -1.5],
          [1.5, 0, -1.5],
          [-1.5, 0, 1.5],
        ].map((position, index) => (
          <group key={index} position={[position[0], position[1], position[2]]}>
            {/* Trunk */}
            <mesh position={[0, 1, 0]} rotation={[0.1, 0, 0.1]} castShadow>
              <cylinderGeometry args={[0.1, 0.2, 2, 8]} />
              <meshStandardMaterial color="#A0522D" />
            </mesh>

            {/* Leaves */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <mesh
                key={i}
                position={[0.3 * Math.cos((i * Math.PI) / 3), 2, 0.3 * Math.sin((i * Math.PI) / 3)]}
                rotation={[0.5, (i * Math.PI) / 3, 0]}
                castShadow
              >
                <planeGeometry args={[0.8, 1.2]} />
                <meshStandardMaterial color="#FF69B4" side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Central structure - Trophy/Monument */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 1, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Tropical lagoon */}
      <mesh ref={waterRef} position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1, 2.5, 32]} />
        <meshStandardMaterial color="#00BFFF" transparent opacity={0.8} metalness={0.3} roughness={0.1} />
      </mesh>

      {/* Beach chairs */}
      <mesh position={[1, 0.15, 1]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.3]} />
        <meshStandardMaterial color="#FF6347" />
      </mesh>

      <mesh position={[-1, 0.15, -1]} rotation={[0, -Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.3]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>

      {/* Falling petals */}
      <Sparkles count={50} scale={5} size={0.4} speed={0.3} color="#FF69B4" opacity={0.7} />
    </group>
  )
}

// Base island component
function BaseIsland() {
  return (
    <group>
      {/* Island base */}
      <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3, 3.5, 1, 32]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Island top surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.1, 32]} />
        <meshStandardMaterial color="#7CFC00" />
      </mesh>

      {/* Beach around the edges */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <ringGeometry args={[2.5, 3, 32]} />
        <meshStandardMaterial color="#F5DEB3" />
      </mesh>
    </group>
  )
}

// Water area around the island
function WaterArea() {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waterRef.current) {
      // Animate water
      waterRef.current.rotation.z = state.clock.getElapsedTime() * 0.1
    }
  })

  return (
    <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]} ref={waterRef}>
      <ringGeometry args={[3.5, 8, 64]} />
      <meshStandardMaterial color="#1E90FF" transparent opacity={0.8} metalness={0.2} roughness={0.1} />
    </mesh>
  )
}

// Cloud layer
function CloudLayer() {
  return (
    <group position={[0, 8, 0]}>
      <Cloud position={[-10, 0, -15]} speed={0.2} opacity={0.7} />
      <Cloud position={[10, 0, -10]} speed={0.1} opacity={0.7} />
      <Cloud position={[0, 0, -20]} speed={0.3} opacity={0.7} />
      <Cloud position={[-15, 0, 5]} speed={0.2} opacity={0.7} />
      <Cloud position={[15, 0, 10]} speed={0.1} opacity={0.7} />
    </group>
  )
}

// Celebration effects for completed goals
function CelebrationEffects() {
  const particlesRef = useRef<THREE.Points>(null)

  // Create particles
  const particleCount = 100
  const particlePositions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    particlePositions[i3] = (Math.random() - 0.5) * 10
    particlePositions[i3 + 1] = Math.random() * 10
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 10
  }

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))

  useFrame((state) => {
    if (particlesRef.current) {
      // Animate particles
      const positions = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions.array[i3 + 1] -= 0.05 // Fall down

        // Reset particles that fall below the island
        if (positions.array[i3 + 1] < -1) {
          positions.array[i3 + 1] = 10
          positions.array[i3] = (Math.random() - 0.5) * 10
          positions.array[i3 + 2] = (Math.random() - 0.5) * 10
        }
      }
      positions.needsUpdate = true

      // Rotate particles
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })

  return (
    <group>
      {/* Celebration text */}
      <Float floatIntensity={1} rotationIntensity={0.5} speed={3}>
        <Text
          position={[0, 5, 0]}
          fontSize={0.8}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          GOAL ACHIEVED!
        </Text>
      </Float>

      {/* Confetti particles */}
      <points ref={particlesRef}>
        <primitive object={particleGeometry} />
        <pointsMaterial
          size={0.2}
          vertexColors={false}
          color="#FFD700"
          transparent
          opacity={0.8}
          sizeAttenuation={true}
        />
      </points>

      {/* Sparkles */}
      <Sparkles count={100} scale={10} size={0.6} speed={0.4} color="#FFD700" />
    </group>
  )
}
