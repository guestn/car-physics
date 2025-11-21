import { useRef, useEffect, forwardRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useBox, useRaycastVehicle, useCylinder } from '@react-three/cannon'
import { useGLTF } from '@react-three/drei'
import { Object3D, Mesh } from 'three'
import type { RefObject } from 'react'
import type { BoxProps } from '@react-three/cannon'

// Preload the GLTF model for better performance
useGLTF.preload('/models/1972_porsche_911_carrera_rs/porsche_rs_wheel.gltf')
//useGLTF.preload('/models/porsche_rs_body.gltf')

interface CarProps {
  position?: [number, number, number]
  resetTrigger?: number
}

interface WheelProps {
  radius: number
  width: number
  isLeft?: boolean
}

interface ChassisProps extends BoxProps {
  chassisYOffset: number
  onApiReady?: (api: any) => void
}

const Chassis = forwardRef<Object3D, ChassisProps>(
  (
    {
      args = [1.5, 0.5, 4.5],
      mass = 1500,
      chassisYOffset,
      onApiReady,
      ...props
    },
    ref
  ) => {
    // Load the Porsche GLTF model
    const { scene } = useGLTF(
      '/models/1972_porsche_911_carrera_rs/porsche_rs_body.gltf'
    )

    // Clone the scene to avoid sharing state between instances
    const clonedScene = useMemo(() => scene.clone(), [scene])

    // Match the example - just pass props through, including position
    const [, api] = useBox(
      () => ({
        mass,
        args,
        allowSleep: false,
        linearDamping: 0.0,
        angularDamping: 0.4,
        ...props,
      }),
      ref as RefObject<Object3D>
    )

    useEffect(() => {
      if (onApiReady) {
        onApiReady(api)
      }
    }, [api, onApiReady])

    // Scale and position the model to match the physics body
    // The model needs to be scaled down and positioned correctly
    useEffect(() => {
      if (clonedScene) {
        // Calculate scale to fit the physics body dimensions
        // Assuming the model is roughly 4.5m long, scale to match
        const targetLength = args[2] // Z dimension (length)
        const scale = targetLength / 4.5 // Approximate model length
        clonedScene.scale.set(scale, scale, scale)

        // Rotate 180 degrees around Y axis to fix reversed Z axis
        clonedScene.rotation.y = Math.PI

        // Center the model relative to the physics body
        // The model should be positioned to align with the box physics body
        clonedScene.position.set(0, -0.75, 0)

        // Enable shadows on all meshes
        clonedScene.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      }
    }, [clonedScene, args])

    return (
      <group ref={ref} dispose={null}>
        <primitive object={clonedScene} />
      </group>
    )
  }
)

Chassis.displayName = 'Chassis'

const Wheel = forwardRef<Object3D, WheelProps>(
  ({ radius, width, isLeft = false }, ref) => {
    // Load the wheel GLTF model
    const { scene } = useGLTF(
      '/models/1972_porsche_911_carrera_rs/porsche_rs_wheel.gltf'
    )

    // Clone the scene to avoid sharing state between instances
    const clonedScene = useMemo(() => scene.clone(), [scene])

    // Create a ref for the wheel visual group to control rotation separately
    const wheelVisualRef = useRef<Object3D>(null!)

    // Create physics body for the wheel - vehicle system will control position
    useCylinder(
      () => ({
        mass: 50,
        type: 'Kinematic',
        material: 'wheel',
        collisionFilterGroup: 0,
        rotation: [0, 0, -Math.PI / 2],
        args: [radius, radius, width, 16],
      }),
      ref as RefObject<Object3D>,
      [radius, width]
    )

    // Scale and position the wheel model to match the physics body
    useEffect(() => {
      if (clonedScene) {
        // Scale the wheel to match the radius
        // The wheel model appears to be roughly 0.3 units in radius based on the GLTF bounds
        const scale = radius / 0.3
        clonedScene.scale.set(scale, scale, scale)

        // Center the wheel model
        clonedScene.position.set(0, 0, 0)

        // No rotation
        clonedScene.rotation.set(0, 0, 0)

        // Enable shadows on all meshes
        clonedScene.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      }
    }, [clonedScene, radius, isLeft])

    //  console.log({ clonedScene })

    // Counter-rotate the wheel model to fix reverse rotation direction
    // The physics system rotates the parent group, but the visual wheel rotates backwards
    // We need to make the visual wheel rotate in the same direction as physics
    useFrame(() => {
      if (ref && 'current' in ref && ref.current && wheelVisualRef.current) {
        // The physics system updates the object's quaternion directly each frame
        // Read the actual rotation from the quaternion (more reliable than euler rotation)
        const tempObject = new Object3D()
        tempObject.setRotationFromQuaternion(ref.current.quaternion)
        const parentEuler = tempObject.rotation

        // Since wheelVisualRef is a child, it inherits the parent's rotation
        // If wheels are rotating counterclockwise when they should be clockwise,
        // we need to flip the direction. Try different approaches:
        // Option 1: Cancel parent rotation and apply opposite (parent θ, child -θ, total = 0, then add our rotation)
        // Option 2: Double the rotation in opposite direction (parent θ, child -2θ, total = -θ)
        // Option 3: Just invert (parent θ, child -θ, total = 0)
        // Option 4: Apply same direction but faster (parent θ, child 2θ, total = 3θ)
        // Since it's counterclockwise when should be clockwise, try inverting with -2
        wheelVisualRef.current.rotation.z = -2 * parentEuler.z
        wheelVisualRef.current.rotation.y = isLeft ? 0 : Math.PI
        wheelVisualRef.current.rotation.x = parentEuler.x
      }
    })

    // Vehicle system controls wheel position and rotation automatically
    return (
      <group ref={ref} dispose={null}>
        <group ref={wheelVisualRef} dispose={null}>
          <primitive object={clonedScene} />
        </group>
      </group>
    )
  }
)

Wheel.displayName = 'Wheel'

export const Car = ({ position = [0, 0, 0], resetTrigger }: CarProps) => {
  // Car dimensions
  const chassisSize = useMemo(
    () => [1.5, 0.5, 4.5] as [number, number, number],
    []
  )
  const wheelRadius = 0.31
  const wheelWidth = 0.3
  const wheelbase = 2.26 // Distance between front and back wheels (Z axis - forward is -Z)
  const trackWidth = 2.8 // Distance between left and right wheels (X axis)

  // Wheel positions relative to chassis center
  const front = -wheelbase / 2 - 0.06 // Front wheels (negative Z)
  const back = wheelbase / 2 - 0.06 // Back wheels (positive Z)
  const width = trackWidth / 2 // Half track width for sideMulti calculation
  const height = -chassisSize[1] / 2 // Below chassis center

  // Chassis position offset (raised to sit on wheels)
  const chassisYOffset = useMemo(
    () => chassisSize[1] / 2 + wheelRadius,
    [chassisSize]
  )

  // Chassis ref and API
  const chassisRef = useRef<Object3D>(null!)
  const chassisApiRef = useRef<any>(null)

  // Callback to receive chassis API
  const handleChassisApiReady = (api: any) => {
    chassisApiRef.current = api
  }

  // Wheel refs for rendering - these will be controlled by the vehicle
  const frontLeftWheelRef = useRef<Object3D>(null!)
  const frontRightWheelRef = useRef<Object3D>(null!)
  const backLeftWheelRef = useRef<Object3D>(null!)
  const backRightWheelRef = useRef<Object3D>(null!)

  const wheelRefs = useMemo(
    () => [
      frontLeftWheelRef,
      frontRightWheelRef,
      backLeftWheelRef,
      backRightWheelRef,
    ],
    []
  )

  // Base wheel info - shared properties for all wheels
  const baseWheelInfo = useMemo(
    () => ({
      radius: wheelRadius,
      directionLocal: [0, -1, 0] as [number, number, number],
      axleLocal: [-1, 0, 0] as [number, number, number],
      suspensionStiffness: 50,
      suspensionRestLength: 0.3,
      frictionSlip: 1.2,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    }),
    [wheelRadius]
  )

  // Wheel info for raycast vehicle - map over wheels array like in the example
  // Memoize to prevent recreation on every render which causes vehicle re-initialization
  const wheelInfos = useMemo(
    () =>
      wheelRefs.map((_, index) => {
        const length = index < 2 ? front : back
        const sideMulti = index % 2 ? 0.5 : -0.5

        return {
          ...baseWheelInfo,
          chassisConnectionPointLocal: [width * sideMulti, height, length] as [
            number,
            number,
            number,
          ],
          isFrontWheel: index < 2,
        }
      }),
    [baseWheelInfo, width, height, front, back, wheelRefs]
  )

  // Raycast vehicle - initialize with all refs
  // The vehicle system needs the chassis and wheel refs to have UUIDs
  // It will automatically position wheels relative to the chassis physics body
  const [, vehicleApi] = useRaycastVehicle(
    () => {
      // Log initialization

      return {
        chassisBody: chassisRef as RefObject<Object3D | undefined>,
        wheels: wheelRefs as RefObject<Object3D | undefined>[],
        wheelInfos: wheelInfos,
        indexForwardAxis: 2, // Z axis is forward
        indexRightAxis: 0, // X axis is right
        indexUpAxis: 1, // Y axis is up
      }
    },
    undefined,
    [wheelInfos]
  )

  // Keyboard controls
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })

  const engineForce = 1500
  const maxSteeringValue = 0.5
  const steeringSpeed = 2.0 // radians per second
  const steeringValueRef = useRef(0)

  // Reset function - triggered when resetTrigger changes
  useEffect(() => {
    if (
      resetTrigger !== undefined &&
      resetTrigger > 0 &&
      chassisApiRef.current
    ) {
      // Reset chassis position and rotation
      chassisApiRef.current.position.set(
        position[0],
        position[1] + chassisYOffset,
        position[2]
      )
      chassisApiRef.current.rotation.set(0, 0, 0)
      chassisApiRef.current.velocity.set(0, 0, 0)
      chassisApiRef.current.angularVelocity.set(0, 0, 0)

      // Reset steering
      steeringValueRef.current = 0
      vehicleApi.setSteeringValue(0, 0)
      vehicleApi.setSteeringValue(0, 1)
    }
  }, [resetTrigger, position, chassisYOffset, vehicleApi])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright'
      ) {
        event.preventDefault()
      }

      switch (key) {
        case 'w':
        case 'arrowup':
          keysRef.current.forward = true
          break
        case 's':
        case 'arrowdown':
          keysRef.current.backward = true
          break
        case 'a':
        case 'arrowleft':
          keysRef.current.left = true
          break
        case 'd':
        case 'arrowright':
          keysRef.current.right = true
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      switch (key) {
        case 'w':
        case 'arrowup':
          keysRef.current.forward = false
          break
        case 's':
        case 'arrowdown':
          keysRef.current.backward = false
          break
        case 'a':
        case 'arrowleft':
          keysRef.current.left = false
          break
        case 'd':
        case 'arrowright':
          keysRef.current.right = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Track frame count to debug initialization
  const frameCountRef = useRef(0)
  const initializedRef = useRef(false)
  const vehicleInitializedRef = useRef(false)

  // Track when vehicle API is ready
  useEffect(() => {
    if (vehicleApi) {
      console.log('Vehicle API ready')
      vehicleInitializedRef.current = true
    }
  }, [vehicleApi])

  // Drive the car
  useFrame((_, delta) => {
    frameCountRef.current++

    // Only apply controls if vehicle API is ready
    if (!vehicleApi) return

    // Apply engine force to rear wheels (indices 2 and 3)
    if (keysRef.current.forward) {
      vehicleApi.applyEngineForce(engineForce, 2)
      vehicleApi.applyEngineForce(engineForce, 3)
    } else if (keysRef.current.backward) {
      vehicleApi.applyEngineForce(-engineForce, 2)
      vehicleApi.applyEngineForce(-engineForce, 3)
    } else {
      vehicleApi.applyEngineForce(0, 2)
      vehicleApi.applyEngineForce(0, 3)
    }

    // Update steering for front wheels (indices 0 and 1)
    if (keysRef.current.left) {
      steeringValueRef.current = Math.min(
        steeringValueRef.current + steeringSpeed * delta,
        maxSteeringValue
      )
      vehicleApi.setSteeringValue(steeringValueRef.current, 0)
      vehicleApi.setSteeringValue(steeringValueRef.current, 1)
    } else if (keysRef.current.right) {
      steeringValueRef.current = Math.max(
        steeringValueRef.current - steeringSpeed * delta,
        -maxSteeringValue
      )
      vehicleApi.setSteeringValue(steeringValueRef.current, 0)
      vehicleApi.setSteeringValue(steeringValueRef.current, 1)
    } else {
      // Return steering to center when not steering
      const returnSpeed = steeringSpeed * 2
      if (steeringValueRef.current > 0) {
        steeringValueRef.current = Math.max(
          0,
          steeringValueRef.current - returnSpeed * delta
        )
      } else if (steeringValueRef.current < 0) {
        steeringValueRef.current = Math.min(
          0,
          steeringValueRef.current + returnSpeed * delta
        )
      }
      vehicleApi.setSteeringValue(steeringValueRef.current, 0)
      vehicleApi.setSteeringValue(steeringValueRef.current, 1)
    }
  })

  return (
    <group>
      {/* Chassis */}
      <Chassis
        ref={chassisRef}
        args={chassisSize}
        position={[position[0], position[1] + chassisYOffset, position[2]]}
        chassisYOffset={0}
        onApiReady={handleChassisApiReady}
      />

      {/* Wheels */}
      {/* Vehicle system automatically positions and rotates wheel meshes */}
      {wheelRefs.map((wheelRef, index) => (
        <Wheel
          key={index}
          ref={wheelRef}
          radius={wheelRadius}
          width={wheelWidth}
          isLeft={index % 2 === 0}
        />
      ))}
    </group>
  )
}
