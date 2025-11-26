import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRaycastVehicle } from '@react-three/cannon';
import { Object3D } from 'three';
import type { Ref, RefObject } from 'react';
import { Wheel } from './wheel';
import { Chassis } from './chassis';

interface CarProps {
  position?: [number, number, number];
  resetTrigger?: number;
  onChassisRefReady?: (ref: RefObject<Object3D>) => void;
  onChassisApiReady?: (api: any) => void;
  onVehicleApiReady?: (api: any) => void;
  onSteeringValueReady?: (steeringValueRef: RefObject<number>) => void;
}

export const Car = ({
  position = [0, 0, 0],
  resetTrigger,
  onChassisRefReady,
  onChassisApiReady,
  onVehicleApiReady,
  onSteeringValueReady,
}: CarProps) => {
  // Car dimensions
  const chassisSize = useMemo(
    () => [1.65, 1.33, 4.1] as [number, number, number],
    []
  );
  const wheelRadius = 0.3;
  const wheelWidth = 0.25;
  const wheelbase = 2.5; // Distance between front and back wheels (Z axis - forward is -Z)
  const trackWidth = 3.6; // Distance between left and right wheels (X axis)

  // Wheel positions relative to chassis center
  const front = -wheelbase / 2 - 0.06; // Front wheels (negative Z)
  const back = wheelbase / 2 - 0.09; // Back wheels (positive Z)
  const width = trackWidth / 2; // Half track width for sideMulti calculation
  const height = -0.2; //-chassisSize[1] / 2 + 0.05; // Below chassis center

  // Chassis position offset (raised to sit on wheels)
  const chassisYOffset = useMemo(
    () => chassisSize[1] / 2 + wheelRadius,
    [chassisSize]
  );

  // Chassis ref and API
  const chassisRef = useRef<Object3D>(null!);
  const chassisApiRef = useRef<any>(null);
  const vehicleApiRef = useRef<any>(null);

  // Expose chassis ref to parent
  useEffect(() => {
    if (onChassisRefReady) {
      onChassisRefReady(chassisRef);
    }
  }, [onChassisRefReady]);

  // Callback to receive chassis API
  const handleChassisApiReady = (api: any) => {
    chassisApiRef.current = api;
    if (onChassisApiReady) {
      onChassisApiReady(api);
    }
  };

  // Wheel refs for rendering - controlled by the vehicle
  const frontLeftWheelRef = useRef<Object3D>(null!);
  const frontRightWheelRef = useRef<Object3D>(null!);
  const backLeftWheelRef = useRef<Object3D>(null!);
  const backRightWheelRef = useRef<Object3D>(null!);

  const wheelRefs = useMemo(
    () => [
      frontLeftWheelRef,
      frontRightWheelRef,
      backLeftWheelRef,
      backRightWheelRef,
    ],
    []
  );

  const baseWheelInfo = useMemo(
    () => ({
      radius: wheelRadius,
      directionLocal: [0, -1, 0] as [number, number, number],
      axleLocal: [-1, 0, 0] as [number, number, number], // direction of rotation
      suspensionStiffness: 100,
      suspensionRestLength: 0.2,
      frictionSlip: 3,
      dampingRelaxation: 1,
      dampingCompression: 1.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.06,
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    }),
    [wheelRadius]
  );

  // Wheel info for raycast vehicle - map over wheels array like in the example
  const wheelInfos = useMemo(
    () =>
      wheelRefs.map((_, index) => {
        const length = index < 2 ? front : back;
        const sideMulti = index % 2 ? 0.5 : -0.5;

        return {
          ...baseWheelInfo,
          chassisConnectionPointLocal: [width * sideMulti, height, length] as [
            number,
            number,
            number,
          ],
          isFrontWheel: index < 2,
        };
      }),
    [baseWheelInfo, width, height, front, back, wheelRefs]
  );

  // Raycast vehicle - initialize with all refs
  // The vehicle system needs the chassis and wheel refs to have UUIDs
  const [, vehicleApi] = useRaycastVehicle(
    () => {
      return {
        chassisBody: chassisRef as Ref<Object3D>,
        wheels: wheelRefs as Ref<Object3D>[],
        wheelInfos,
        indexForwardAxis: 2, // Z axis is forward
        indexRightAxis: 0, // X axis is right
        indexUpAxis: 1, // Y axis is up
      };
    },
    undefined,
    [wheelInfos]
  );

  // Store vehicleApi in ref and expose to parent
  useEffect(() => {
    if (vehicleApi) {
      vehicleApiRef.current = vehicleApi;
      if (onVehicleApiReady) {
        onVehicleApiReady(vehicleApi);
      }
    }
  }, [vehicleApi, onVehicleApiReady]);

  // Expose steering value ref to parent
  useEffect(() => {
    if (onSteeringValueReady) {
      onSteeringValueReady(steeringValueRef);
    }
  }, [onSteeringValueReady]);

  // Keyboard controls
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const engineForce = 4000;
  const maxSteeringValue = 0.5;
  const steeringSpeed = 1.0; // radians per second
  const steeringValueRef = useRef(0);
  const lastResetTriggerRef = useRef(0);

  // Reset function - triggered when resetTrigger changes
  useEffect(() => {
    if (
      resetTrigger !== undefined &&
      resetTrigger > 0 &&
      resetTrigger !== lastResetTriggerRef.current &&
      chassisApiRef.current &&
      vehicleApi
    ) {
      // Track that we've processed this reset trigger
      lastResetTriggerRef.current = resetTrigger;

      // Reset chassis position and rotation
      chassisApiRef.current.position.set(
        position[0],
        position[1] + chassisYOffset,
        position[2]
      );
      chassisApiRef.current.rotation.set(0, 0, 0);
      chassisApiRef.current.velocity.set(0, 0, 0);
      chassisApiRef.current.angularVelocity.set(0, 0, 0);

      // Reset steering
      steeringValueRef.current = 0;
      vehicleApi.setSteeringValue(0, 0);
      vehicleApi.setSteeringValue(0, 1);
    }
  }, [resetTrigger, position, chassisYOffset, vehicleApi]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright'
      ) {
        event.preventDefault();
      }

      switch (key) {
        case 'w':
        case 'arrowup':
          keysRef.current.forward = true;
          break;
        case 's':
        case 'arrowdown':
          keysRef.current.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          keysRef.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          keysRef.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      switch (key) {
        case 'w':
        case 'arrowup':
          keysRef.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          keysRef.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          keysRef.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          keysRef.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Drive the car
  useFrame((_, delta) => {
    if (!vehicleApi) return;

    // Apply engine force to rear wheels (indices 2 and 3)
    if (keysRef.current.forward) {
      vehicleApi.applyEngineForce(engineForce, 2);
      vehicleApi.applyEngineForce(engineForce, 3);
    } else if (keysRef.current.backward) {
      vehicleApi.applyEngineForce(-engineForce, 2);
      vehicleApi.applyEngineForce(-engineForce, 3);
    } else {
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
    }

    // Update steering for front wheels (indices 0 and 1)
    if (keysRef.current.left) {
      steeringValueRef.current = Math.min(
        steeringValueRef.current + steeringSpeed * delta,
        maxSteeringValue
      );
      vehicleApi.setSteeringValue(steeringValueRef.current, 0);
      vehicleApi.setSteeringValue(steeringValueRef.current, 1);
    } else if (keysRef.current.right) {
      steeringValueRef.current = Math.max(
        steeringValueRef.current - steeringSpeed * delta,
        -maxSteeringValue
      );
      vehicleApi.setSteeringValue(steeringValueRef.current, 0);
      vehicleApi.setSteeringValue(steeringValueRef.current, 1);
    } else {
      // Return steering to center when not steering
      const returnSpeed = steeringSpeed * 2;
      if (steeringValueRef.current > 0) {
        steeringValueRef.current = Math.max(
          0,
          steeringValueRef.current - returnSpeed * delta
        );
      } else if (steeringValueRef.current < 0) {
        steeringValueRef.current = Math.min(
          0,
          steeringValueRef.current + returnSpeed * delta
        );
      }
      vehicleApi.setSteeringValue(steeringValueRef.current, 0);
      vehicleApi.setSteeringValue(steeringValueRef.current, 1);
    }
  });

  return (
    <group>
      <Chassis
        ref={chassisRef}
        args={chassisSize}
        mass={1500}
        position={[position[0], position[1] + chassisYOffset, position[2]]}
        chassisYOffset={0}
        onApiReady={handleChassisApiReady}
      />

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
  );
};
