"use client"

import { useRef } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

interface FinBotAvatarProps {
  isSpeaking: boolean
}

export function FinBotAvatar({ isSpeaking }: FinBotAvatarProps) {
  return (
    <div className="w-full h-full max-h-[300px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AvatarCore isSpeaking={isSpeaking} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  )
}

function AvatarCore({ isSpeaking }: { isSpeaking: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  const ringsRef = useRef<THREE.Group>(null)

  // Animation for speaking effect
  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.1
    }

    if (sphereRef.current) {
      // Pulsing effect when speaking
      if (isSpeaking) {
        sphereRef.current.scale.set(
          1 + Math.sin(time * 10) * 0.05,
          1 + Math.sin(time * 10) * 0.05,
          1 + Math.sin(time * 10) * 0.05,
        )
      } else {
        // Gentle pulsing when not speaking
        sphereRef.current.scale.set(1 + Math.sin(time) * 0.02, 1 + Math.sin(time) * 0.02, 1 + Math.sin(time) * 0.02)
      }
    }

    if (ringsRef.current) {
      // Rotate rings
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.z = time * (0.2 + i * 0.1)
        ring.rotation.x = time * 0.1 + i * 0.2

        // Pulse rings when speaking
        if (isSpeaking) {
          const scale = 1 + Math.sin(time * 5 + i) * 0.05
          ring.scale.set(scale, scale, 1)
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {/* Core sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </mesh>

      {/* Orbiting rings */}
      <group ref={ringsRef}>
        {[1.2, 1.5, 1.8].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / (i + 2), Math.PI / 4, 0]}>
            <torusGeometry args={[radius, 0.03, 16, 100]} />
            <meshStandardMaterial
              color={i === 0 ? "#3b82f6" : i === 1 ? "#60a5fa" : "#93c5fd"}
              emissive={i === 0 ? "#1d4ed8" : i === 1 ? "#3b82f6" : "#60a5fa"}
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Particles */}
      <ParticleField isSpeaking={isSpeaking} />
    </group>
  )
}

function ParticleField({ isSpeaking }: { isSpeaking: boolean }) {
  const particlesRef = useRef<THREE.Points>(null)

  // Create particles
  const particleCount = 100
  const particlePositions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const radius = 2 + Math.random() * 0.5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    particlePositions[i * 3 + 2] = radius * Math.cos(phi)
  }

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (particlesRef.current) {
      // Rotate particles
      particlesRef.current.rotation.y = time * 0.1

      // Update particle positions when speaking
      if (isSpeaking) {
        const positions = particlesRef.current.geometry.attributes.position
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3
          const x = positions.getX(i)
          const y = positions.getY(i)
          const z = positions.getZ(i)

          // Calculate distance from center
          const distance = Math.sqrt(x * x + y * y + z * z)

          // Move particles outward when speaking
          const factor = 1 + Math.sin(time * 5 + distance) * 0.1

          positions.setX(i, x * factor)
          positions.setY(i, y * factor)
          positions.setZ(i, z * factor)
        }

        positions.needsUpdate = true
      }
    }
  })

  return (
    <points ref={particlesRef}>
      <primitive object={particleGeometry} />
      <pointsMaterial size={0.05} color="#60a5fa" transparent opacity={0.8} sizeAttenuation={true} />
    </points>
  )
}
