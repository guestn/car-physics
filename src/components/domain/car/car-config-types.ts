export interface CarConfig {
  name: string;
  model: {
    chassisPath: string;
    wheelPath: string;
    modelLength: number;
    modelScale: number;
    modelRotationY: number;
    modelPosition: [number, number, number];
  };
  dimensions: {
    chassisSize: [number, number, number];
    wheelRadius: number;
    wheelScale: number;
    wheelWidth: number;
    wheelbase: number;
    trackWidth: number;
    wheelPositions: {
      frontOffset: number;
      backOffset: number;
      height: number;
    };
  };
  physics: {
    chassis: {
      mass: number;
      linearDamping: number;
      angularDamping: number;
      allowSleep: boolean;
    };
    wheels: {
      suspensionStiffness: number;
      suspensionRestLength: number;
      frictionSlip: number;
      dampingRelaxation: number;
      dampingCompression: number;
      maxSuspensionForce: number;
      rollInfluence: number;
      maxSuspensionTravel: number;
      customSlidingRotationalSpeed: number;
      useCustomSlidingRotationalSpeed: boolean;
    };
  };
  driving: {
    engineForce: number;
    maxSteeringValue: number;
    steeringSpeed: number;
  };
}

export type CarConfigKey = keyof typeof import('./car-configs.json');
