'use client'

import { Component, Suspense, useRef, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Image from 'next/image'

// ── Error boundary ────────────────────────────────────────────────────────────

interface EBState { hasError: boolean }
class ViewerErrorBoundary extends Component<{ children: ReactNode; imageUrl: string }, EBState> {
  state: EBState = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full rounded-[10px] overflow-hidden bg-[#f2f2f4] flex items-center justify-center" style={{ minHeight: 400 }}>
          <div className="relative w-full" style={{ minHeight: 400 }}>
            <Image
              src={this.props.imageUrl}
              alt="Ghost mannequin result"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── 3-D garment mesh ──────────────────────────────────────────────────────────

function GarmentPlane({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl)
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3
  })

  const img = texture.image as HTMLImageElement | undefined
  const aspect = img?.naturalWidth && img?.naturalHeight ? img.naturalWidth / img.naturalHeight : 0.75

  return (
    <mesh ref={meshRef} castShadow>
      <planeGeometry args={[aspect * 2, 2, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.01}
        side={THREE.DoubleSide}
        roughness={0.6}
        metalness={0.05}
      />
    </mesh>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

interface MannequinViewerProps {
  imageUrl: string
}

export function MannequinViewer({ imageUrl }: MannequinViewerProps) {
  return (
    <ViewerErrorBoundary imageUrl={imageUrl}>
      <div className="w-full rounded-[10px] overflow-hidden bg-[#f2f2f4]" style={{ height: 400 }}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          shadows={{ type: THREE.PCFShadowMap }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 4, 3]} intensity={1.2} castShadow />
          <directionalLight position={[-2, -1, -3]} intensity={0.4} />
          <Suspense fallback={null}>
            <GarmentPlane imageUrl={imageUrl} />
            <Environment preset="studio" />
          </Suspense>
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={(3 * Math.PI) / 4}
            rotateSpeed={0.6}
          />
        </Canvas>
      </div>
    </ViewerErrorBoundary>
  )
}

export function MannequinViewerSkeleton() {
  return (
    <div
      className="w-full rounded-[10px] bg-[#f2f2f4] flex items-center justify-center"
      style={{ minHeight: 400 }}
    >
      <div className="flex flex-col items-center gap-3 text-[#8f8f8f]">
        <div className="w-16 h-16 rounded-full bg-[#e8ddd0] animate-pulse" />
        <p className="text-[13px] tracking-[-0.02em]">Processing garment...</p>
      </div>
    </div>
  )
}
