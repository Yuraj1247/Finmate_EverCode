"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Text, Float, Environment, Stars } from "@react-three/drei"
import { formatCurrency } from "@/lib/utils"

interface FinancialData {
  currentSavings: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  investmentReturn: number
  inflationRate: number
  years: number
}

interface FutureValues {
  futureValue: number
  inflationAdjustedValue: number
  monthlyContribution: number
  totalContributions: number
  interestEarned: number
}

interface FinancialTimeTunnelProps {
  financialData: FinancialData
  futureValues: FutureValues
}

export function FinancialTimeTunnel({ financialData, futureValues }: FinancialTimeTunnelProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#000", 5, 30]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <TimeTunnel financialData={financialData} futureValues={futureValues} />
    </Canvas>
  )
}

function TimeTunnel({ financialData, futureValues }: FinancialTimeTunnelProps) {
  const { camera } = useThree()
  const tunnelRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const numbersRef = useRef<THREE.Group>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [showFutureValue, setShowFutureValue] = useState(false)

  // Create tunnel segments
  const tunnelSegments = 20
  const tunnelRadius = 5
  const tunnelLength = 50

  // Animation timing
  useEffect(() => {
    // Start animation
    const timer = setTimeout(() => {
      setShowFutureValue(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Move camera through tunnel
  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Calculate animation progress (0 to 1)
    const progress = Math.min(1, time / 10)
    setAnimationProgress(progress)

    // Move camera through tunnel
    camera.position.z = 5 - progress * 20

    // Rotate tunnel
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z = time * 0.1
    }

    // Animate particles
    if (particlesRef.current) {
      particlesRef.current.rotation.z = time * 0.05

      const positions = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        const z = positions.getZ(i)
        positions.setZ(i, z + 0.1)

        // Reset particles that go too far
        if (positions.getZ(i) > 20) {
          positions.setZ(i, -30)
        }
      }
      positions.needsUpdate = true
    }

    // Animate numbers
    if (numbersRef.current) {
      numbersRef.current.children.forEach((child, i) => {
        child.position.z += 0.1

        // Reset numbers that go too far
        if (child.position.z > 10) {
          child.position.z = -30 + Math.random() * 10
          child.position.x = (Math.random() - 0.5) * 8
          child.position.y = (Math.random() - 0.5) * 8
        }
      })
    }
  })

  // Create tunnel geometry
  const tunnelGeometry = new THREE.CylinderGeometry(tunnelRadius, tunnelRadius, tunnelLength, 32, tunnelSegments, true)
  tunnelGeometry.rotateX(Math.PI / 2)

  // Create particles
  const particleCount = 500
  const particlePositions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    particlePositions[i3] = (Math.random() - 0.5) * 20
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 20
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 50 - 10
  }

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))

  // Create financial milestones
  const milestones = [
    { year: 1, value: calculateValueAtYear(1) },
    { year: Math.floor(financialData.years / 3), value: calculateValueAtYear(Math.floor(financialData.years / 3)) },
    { year: Math.floor(financialData.years / 2), value: calculateValueAtYear(Math.floor(financialData.years / 2)) },
    { year: financialData.years, value: futureValues.futureValue },
  ]

  // Calculate value at specific year
  function calculateValueAtYear(year: number): number {
    const { currentSavings, monthlySavings, investmentReturn } = financialData

    // Calculate future savings with compound interest
    const monthlyRate = investmentReturn / 100 / 12
    const months = year * 12

    // Future value of current savings
    const futureCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, months)

    // Future value of monthly contributions
    let futureContributions = 0
    for (let i = 0; i < months; i++) {
      futureContributions += monthlySavings * Math.pow(1 + monthlyRate, months - i)
    }

    return futureCurrentSavings + futureContributions
  }

  return (
    <group>
      {/* Tunnel */}
      <group ref={tunnelRef}>
        <mesh>
          <primitive object={tunnelGeometry} />
          <meshStandardMaterial
            color="#0f172a"
            side={THREE.BackSide}
            wireframe={true}
            emissive="#3b82f6"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* Particles */}
      <points ref={particlesRef}>
        <primitive object={particleGeometry} />
        <pointsMaterial size={0.2} color="#60a5fa" transparent opacity={0.8} sizeAttenuation={true} />
      </points>

      {/* Floating Numbers */}
      <group ref={numbersRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Float key={i} speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <Text
              position={[(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, -30 + Math.random() * 20]}
              fontSize={0.5}
              color="#60a5fa"
              anchorX="center"
              anchorY="middle"
            >
              {`$${Math.floor(Math.random() * 1000)}`}
            </Text>
          </Float>
        ))}
      </group>

      {/* Current Value */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 0, 0]}
          fontSize={1.5}
          color="#22c55e"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#0f172a"
        >
          {formatCurrency(financialData.currentSavings)}
        </Text>
        <Text position={[0, -1.5, 0]} fontSize={0.8} color="#94a3b8" anchorX="center" anchorY="middle">
          Current Savings
        </Text>
      </Float>

      {/* Milestones */}
      {milestones.map((milestone, index) => (
        <group key={index} position={[0, 0, -5 - index * 5]}>
          <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <Text
              position={[0, 0, 0]}
              fontSize={1 + index * 0.2}
              color="#3b82f6"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05}
              outlineColor="#0f172a"
              opacity={animationProgress > index * 0.25 ? 1 : 0}
              visible={animationProgress > index * 0.25}
            >
              {formatCurrency(milestone.value)}
            </Text>
            <Text
              position={[0, -1.5, 0]}
              fontSize={0.7}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
              opacity={animationProgress > index * 0.25 ? 1 : 0}
              visible={animationProgress > index * 0.25}
            >
              Year {milestone.year}
            </Text>
          </Float>
        </group>
      ))}

      {/* Future Value */}
      {showFutureValue && (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text
            position={[0, 0, -25]}
            fontSize={2.5}
            color="#22c55e"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#0f172a"
          >
            {formatCurrency(futureValues.futureValue)}
          </Text>
          <Text position={[0, -2, -25]} fontSize={1} color="#f59e0b" anchorX="center" anchorY="middle">
            Your Future Wealth
          </Text>
          <Text position={[0, -3.5, -25]} fontSize={0.8} color="#94a3b8" anchorX="center" anchorY="middle">
            After {financialData.years} Years
          </Text>
        </Float>
      )}

      {/* Income Trees */}
      <IncomeTree
        position={[-4, -3, -15]}
        scale={[1, financialData.monthlyIncome / 1000, 1]}
        visible={animationProgress > 0.5}
      />

      {/* Expense Warning */}
      {financialData.monthlyExpenses > financialData.monthlyIncome * 0.7 && (
        <DangerSign position={[4, -3, -10]} visible={animationProgress > 0.4} />
      )}
    </group>
  )
}

function IncomeTree({
  position,
  scale,
  visible,
}: { position: [number, number, number]; scale: [number, number, number]; visible: boolean }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.2
    }
  })

  if (!visible) return null

  return (
    <group ref={group} position={position} scale={scale}>
      {/* Tree trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Tree leaves */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>

      {/* Coins around tree */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[Math.cos((i / 5) * Math.PI * 2) * 1.2, 0.5, Math.sin((i / 5) * Math.PI * 2) * 1.2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function DangerSign({ position, visible }: { position: [number, number, number]; visible: boolean }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      // Pulsing effect
      const pulse = Math.sin(state.clock.getElapsedTime() * 3) * 0.2 + 1
      group.current.scale.set(pulse, pulse, pulse)
    }
  })

  if (!visible) return null

  return (
    <group ref={group} position={position}>
      <mesh rotation={[0, 0, Math.PI]}>
        <cylinderGeometry args={[0, 1, 1.5, 3]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      <Text
        position={[0, 0, 0.1]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter_Bold.json"
      >
        !
      </Text>

      <Text position={[0, -1.5, 0]} fontSize={0.4} color="#ef4444" anchorX="center" anchorY="middle">
        High Expenses
      </Text>
    </group>
  )
}
