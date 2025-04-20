"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import type { Goal } from "@/types/finance"
import * as THREE from "three"

interface GoalVisualizerProps {
  goals: Goal[]
}

export function GoalVisualizer3D({ goals }: GoalVisualizerProps) {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <GoalScene goals={goals} />
        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  )
}

function GoalScene({ goals }: GoalVisualizerProps) {
  const completedGoals = goals.filter((goal) => goal.completed)
  const inProgressGoals = goals.filter((goal) => !goal.completed)

  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Completed Goals - Trophies */}
      {completedGoals.map((goal, index) => (
        <Trophy
          key={goal.id}
          position={[-5 + (index % 3) * 5, -2, -5 + Math.floor(index / 3) * 5]}
          name={goal.name}
          amount={goal.targetAmount}
        />
      ))}

      {/* In Progress Goals - Coin Stacks */}
      {inProgressGoals.map((goal, index) => (
        <CoinStack key={goal.id} position={[-5 + (index % 3) * 5, -2, 5 - Math.floor(index / 3) * 5]} goal={goal} />
      ))}

      {/* Welcome Text */}
      <Text position={[0, 5, 0]} fontSize={1.5} color="#3b82f6" anchorX="center" anchorY="middle">
        Your Financial Journey
      </Text>

      {/* Instructions */}
      <Text position={[0, 4, 0]} fontSize={0.7} color="#64748b" anchorX="center" anchorY="middle">
        Drag to rotate | Scroll to zoom
      </Text>
    </group>
  )
}

function Trophy({ position, name, amount }: { position: [number, number, number]; name: string; amount: number }) {
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.2

      // Scale up/down on hover
      const scale = hovered ? 1.1 : 1
      group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, scale, 0.1)
      group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, scale, 0.1)
      group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, scale, 0.1)
    }
  })

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Trophy base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[1, 1.2, 0.5, 32]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Trophy cup */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.8, 1.5, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Trophy top */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Goal Name */}
      <Text position={[0, -0.5, 0]} fontSize={0.5} color="#1e40af" anchorX="center" anchorY="middle" maxWidth={4}>
        {name}
      </Text>

      {/* Amount */}
      <Text position={[0, -1.2, 0]} fontSize={0.4} color="#64748b" anchorX="center" anchorY="middle">
        ${amount.toLocaleString()}
      </Text>

      {/* Completed Badge */}
      <Text position={[0, 4.5, 0]} fontSize={0.4} color="#16a34a" anchorX="center" anchorY="middle">
        ACHIEVED
      </Text>
    </group>
  )
}

function CoinStack({ position, goal }: { position: [number, number, number]; goal: Goal }) {
  const group = useRef<THREE.Group>(null)
  const progress = goal.currentAmount / goal.targetAmount
  const coinCount = Math.max(1, Math.floor(progress * 10))
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.1

      // Scale on hover
      const scale = hovered ? 1.1 : 1
      group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, scale, 0.1)
      group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, scale, 0.1)
      group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, scale, 0.1)
    }
  })

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Base */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 32]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Coins */}
      {Array.from({ length: coinCount }).map((_, index) => (
        <mesh key={index} position={[0, 0.3 + index * 0.2, 0]} castShadow>
          <cylinderGeometry args={[1, 1, 0.1, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Goal Name */}
      <Text position={[0, -0.5, 0]} fontSize={0.5} color="#1e40af" anchorX="center" anchorY="middle" maxWidth={4}>
        {goal.name}
      </Text>

      {/* Progress */}
      <Text position={[0, -1.2, 0]} fontSize={0.4} color="#64748b" anchorX="center" anchorY="middle">
        {Math.round(progress * 100)}% Complete
      </Text>

      {/* Amount */}
      <Text
        position={[0, 0.3 + coinCount * 0.2 + 0.5, 0]}
        fontSize={0.4}
        color="#16a34a"
        anchorX="center"
        anchorY="middle"
      >
        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
      </Text>
    </group>
  )
}
