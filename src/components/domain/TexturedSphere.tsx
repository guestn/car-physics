import { useRef, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Mesh, TextureLoader } from 'three'
import { useSphere } from '@react-three/cannon'
import { getCSSVariable } from '@/utils/colorUtils'

interface TexturedSphereProps {
  position?: [number, number, number]
}

export const TexturedSphere = ({
  position = [0, 0, 0],
}: TexturedSphereProps) => {
  // Add physics body to test if physics is working
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [1],
  }))

  // Debug: Check if physics is working
  useEffect(() => {
    if (api) {
      console.log('Sphere physics API ready:', api)
      // Subscribe to position to see if it's updating
      const unsubscribe = api.position.subscribe((pos) => {
        //   console.log('Sphere position:', pos)
      })
      return unsubscribe
    }
  }, [api])

  // Load textures using CSS variables
  const [diffuseTexture, bumpTexture] = useLoader(TextureLoader, [
    'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="${getCSSVariable('--color-ui-primary')}" stroke-width="1"/>
          </pattern>
          <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${getCSSVariable('--color-material-blue')};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${getCSSVariable('--color-material-purple')};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${getCSSVariable('--color-material-pink')};stop-opacity:1" />
          </radialGradient>
        </defs>
        <rect width="256" height="256" fill="url(#gradient)"/>
        <rect width="256" height="256" fill="url(#grid)"/>
      </svg>
    `),
    // Bump map texture
    'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bumpGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="30%" style="stop-color:#cccccc;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#666666;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
          </radialGradient>
        </defs>
        <rect width="256" height="256" fill="url(#bumpGradient)"/>
        <circle cx="128" cy="128" r="100" fill="#333333"/>
        <circle cx="128" cy="128" r="80" fill="#666666"/>
        <circle cx="128" cy="128" r="60" fill="#999999"/>
        <circle cx="128" cy="128" r="40" fill="#cccccc"/>
        <circle cx="128" cy="128" r="20" fill="#ffffff"/>
      </svg>
    `),
  ])

  useFrame(() => {
    if (ref.current) {
      // Slow rotation
      ref.current.rotation.x += 0.005
      ref.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        map={diffuseTexture}
        bumpMap={bumpTexture}
        bumpScale={2.5}
        roughness={0.3}
        metalness={0.1}
        emissive="#667eea"
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}
