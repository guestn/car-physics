import { useRef, useMemo } from 'react'
import { BackSide, CanvasTexture, DoubleSide } from 'three'

export const Skybox = ({
  position = [0, 0, 0],
}: {
  position?: [number, number, number]
}) => {
  const skyboxRef = useRef<THREE.Mesh>(null!)

  // Create a stable sky texture using useMemo to prevent regeneration
  const skyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    // Create a gradient from horizon to zenith
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)
    gradient.addColorStop(0, '#87CEEB') // Sky blue at horizon
    gradient.addColorStop(0.2, '#B0E0E6') // Light blue
    gradient.addColorStop(0.4, '#E0F6FF') // Very light blue
    gradient.addColorStop(0.7, '#F0F8FF') // Almost white
    gradient.addColorStop(1, '#FFFFFF') // White at zenith

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add some atmospheric haze
    ctx.fillStyle = 'rgba(135, 206, 235, 0.8)'
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3)

    return new CanvasTexture(canvas)
  }, [])

  return (
    <mesh ref={skyboxRef} position={position}>
      <boxGeometry args={[100, 100, 100]} />
      <meshBasicMaterial map={skyTexture} side={DoubleSide} fog={false} />
    </mesh>
  )
}
