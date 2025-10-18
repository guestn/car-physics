import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, ShaderMaterial } from 'three'

interface CustomTorusProps {
  position?: [number, number, number]
}

export const CustomTorus = ({ position = [0, 0, 0] }: CustomTorusProps) => {
  const meshRef = useRef<Mesh>(null!)

  // Custom vertex shader
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  // Custom fragment shader
  const fragmentShader = `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Create a wave pattern based on position and time
      float wave = sin(vPosition.x * 2.0 + time) * 0.5 + 0.5;
      
      // Mix colors based on UV coordinates and wave
      vec3 color = mix(color1, color2, wave);
      
      // Add some UV-based pattern
      float pattern = sin(vUv.x * 10.0) * sin(vUv.y * 10.0);
      color += pattern * 0.2;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as ShaderMaterial
      material.uniforms.time.value = state.clock.elapsedTime

      // Slow rotation
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <torusGeometry args={[1, 0.3, 16, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 },
          color1: { value: { r: 0.2, g: 0.6, b: 1.0 } },
          color2: { value: { r: 1.0, g: 0.3, b: 0.8 } },
        }}
      />
    </mesh>
  )
}
