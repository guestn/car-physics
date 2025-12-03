import { useRef, useEffect, useMemo, Ref, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRaycastVehicle } from '@react-three/cannon';
import { Object3D } from 'three';
import { Wheel } from './wheel';
import { Chassis } from './chassis';
import carConfigsData from './car-configs.json';
import type { CarConfig } from './car-config-types';

const carConfigs = carConfigsData as unknown as Record<string, CarConfig>;

interface CarProps {
  position?: [number, number, number];
  resetTrigger?: number;
  carConfigKey?: keyof typeof carConfigs;
  onChassisRefReady?: (ref: RefObject<Object3D>) => void;
  onChassisApiReady?: (api: any) => void;
  onVehicleApiReady?: (api: any) => void;
  onSteeringValueReady?: (steeringValueRef: RefObject<number>) => void;
}

export const Car = ({
  position = [0, 0, 0],
  resetTrigger,
  carConfigKey = 'porsche_911_carrera_rs', //'porsche_911_gt2', //'porsche_911_carrera_rs',
  onChassisRefReady,
  onChassisApiReady,
  onVehicleApiReady,
  onSteeringValueReady,
}: CarProps) => {
  // Get car configuration
  const config = carConfigs[carConfigKey] as CarConfig;

  // Car dimensions from config
  const chassisSize = useMemo(
    () => config.dimensions.chassisSize,
    [config.dimensions.chassisSize]
  );
  const wheelRadius = config.dimensions.wheelRadius;
  const wheelWidth = config.dimensions.wheelWidth;
  const wheelbase = config.dimensions.wheelbase;
  const trackWidth = config.dimensions.trackWidth;

  // Wheel positions relative to chassis center
  const front = -wheelbase / 2 + config.dimensions.wheelPositions.frontOffset;
  const back = wheelbase / 2 + config.dimensions.wheelPositions.backOffset;
  const width = trackWidth / 2; // Half track width for sideMulti calculation
  const height = config.dimensions.wheelPositions.height;

  // Chassis position offset (raised to sit on wheels)
  const chassisYOffset = useMemo(
    () => chassisSize[1] / 2 + wheelRadius,
    [chassisSize, wheelRadius]
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
  const wheelRef1 = useRef<Object3D>(null!);
  const wheelRef2 = useRef<Object3D>(null!);
  const wheelRef3 = useRef<Object3D>(null!);
  const wheelRef4 = useRef<Object3D>(null!);
  const wheelRefs = useMemo(
    () => [wheelRef1, wheelRef2, wheelRef3, wheelRef4],
    []
  );

  const baseWheelInfo = useMemo(
    () => ({
      radius: wheelRadius,
      directionLocal: [0, -1, 0] as [number, number, number],
      axleLocal: [-1, 0, 0] as [number, number, number], // direction of rotation
      suspensionStiffness: config.physics.wheels.suspensionStiffness,
      suspensionRestLength: config.physics.wheels.suspensionRestLength,
      frictionSlip: config.physics.wheels.frictionSlip,
      dampingRelaxation: config.physics.wheels.dampingRelaxation,
      dampingCompression: config.physics.wheels.dampingCompression,
      maxSuspensionForce: config.physics.wheels.maxSuspensionForce,
      rollInfluence: config.physics.wheels.rollInfluence,
      maxSuspensionTravel: config.physics.wheels.maxSuspensionTravel,
      customSlidingRotationalSpeed:
        config.physics.wheels.customSlidingRotationalSpeed,
      useCustomSlidingRotationalSpeed:
        config.physics.wheels.useCustomSlidingRotationalSpeed,
    }),
    [wheelRadius, config.physics.wheels]
  );

  // Wheel info for raycast vehicle - map over wheels array
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

  const engineForce = config.driving.engineForce;
  const maxSteeringValue = config.driving.maxSteeringValue;
  const steeringSpeed = config.driving.steeringSpeed;
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
      // Track this reset trigger
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
      [0, 1].forEach((wheelIndex) => {
        vehicleApi.setSteeringValue(0, wheelIndex);
      });
    }
  }, [resetTrigger, position, chassisYOffset, vehicleApi]);

  useEffect(() => {
    const keyMap: Record<string, keyof typeof keysRef.current> = {
      w: 'forward',
      arrowup: 'forward',
      s: 'backward',
      arrowdown: 'backward',
      a: 'left',
      arrowleft: 'left',
      d: 'right',
      arrowright: 'right',
    };

    const handleKey = (event: KeyboardEvent, value: boolean) => {
      const key = event.key.toLowerCase();
      const keyName = keyMap[key];

      if (keyName) {
        if (key.startsWith('arrow')) {
          event.preventDefault();
        }
        keysRef.current[keyName] = value;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKey(e, false);

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
    const rearWheels = [2, 3];
    const force = keysRef.current.forward
      ? engineForce
      : keysRef.current.backward
        ? -engineForce
        : 0;
    rearWheels.forEach((wheelIndex) => {
      vehicleApi.applyEngineForce(force, wheelIndex);
    });

    // Update steering for front wheels (indices 0 and 1)
    const frontWheels = [0, 1];
    if (keysRef.current.left) {
      steeringValueRef.current = Math.min(
        steeringValueRef.current + steeringSpeed * delta,
        maxSteeringValue
      );
    } else if (keysRef.current.right) {
      steeringValueRef.current = Math.max(
        steeringValueRef.current - steeringSpeed * delta,
        -maxSteeringValue
      );
    } else {
      // Return steering to center when not steering
      const returnSpeed = steeringSpeed * 2;
      const current = steeringValueRef.current;
      if (current > 0) {
        steeringValueRef.current = Math.max(0, current - returnSpeed * delta);
      } else if (current < 0) {
        steeringValueRef.current = Math.min(0, current + returnSpeed * delta);
      }
    }

    // Apply steering to front wheels
    frontWheels.forEach((wheelIndex) => {
      vehicleApi.setSteeringValue(steeringValueRef.current, wheelIndex);
    });
  });

  return (
    <group>
      <Chassis
        ref={chassisRef}
        args={chassisSize}
        mass={config.physics.chassis.mass}
        position={[position[0], position[1] + chassisYOffset, position[2]]}
        chassisYOffset={0}
        config={config}
        onApiReady={handleChassisApiReady}
      />

      {wheelRefs.map((wheelRef, index) => (
        <Wheel
          key={index}
          ref={wheelRef}
          radius={wheelRadius}
          width={wheelWidth}
          isLeft={index % 2 === 0}
          wheelScale={config.dimensions.wheelScale}
        />
      ))}
    </group>
  );
};
