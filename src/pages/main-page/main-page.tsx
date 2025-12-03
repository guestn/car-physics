import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { Physics, Debug } from '@react-three/cannon';
import { FloorPlane } from '@/components/domain/floor-plane/floor-plane';
import { Skybox } from '@/components/domain/skybox/skybox';
import { Car } from '@/components/domain/car/car';
import { Speedometer } from '@/components/domain/car/speedometer';
import { FollowCamera } from '@/components/domain/camera/follow-camera';
import { FollowShadowCamera } from '@/components/domain/camera/follow-shadow-camera';
import { Object3D, DirectionalLight } from 'three';
import {
  PerformanceWidget,
  PerformanceTracker,
} from '@/utils/performance-widget/performance-widget';
import type { PerformanceMetrics } from '@/utils/performance-widget/performance-widget';
import { SpeedDisplay } from '@/components/ui/speed-display/speed-display';
import { PostProcessingEffects } from '@/effects/post-processing-effects';
import type { PostProcessingSettings } from '@/effects/post-processing-effects';
import { getFromLocalStorage, setToLocalStorage } from '@/utils/local-storage';
import styles from './main-page.module.css';

const POST_PROCESSING_STORAGE_KEY = 'car-physics:post-processing-settings';
const CAMERA_MODE_STORAGE_KEY = 'car-physics:camera-mode';
const DEBUG_SETTINGS_STORAGE_KEY = 'car-physics:debug-settings';

interface MainPageProps {
  resetTrigger?: number;
  cameraMode?: 'orbit' | 'follow';
  onCameraModeChange?: (mode: 'orbit' | 'follow') => void;
}

export const MainPage = ({
  resetTrigger = 0,
  cameraMode: externalCameraMode,
}: MainPageProps) => {
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      fps: 0,
      frameTime: 0,
    });

  const defaultPostProcessingSettings: PostProcessingSettings = {
    bloom: false,
    vignette: false,
    noise: false,
    depthOfField: false,
    outline: false,
  };

  const [postProcessingSettings, setPostProcessingSettings] =
    useState<PostProcessingSettings>(() => {
      return getFromLocalStorage<PostProcessingSettings>(
        POST_PROCESSING_STORAGE_KEY,
        defaultPostProcessingSettings
      );
    });

  useEffect(() => {
    setToLocalStorage(POST_PROCESSING_STORAGE_KEY, postProcessingSettings);
  }, [postProcessingSettings]);

  const defaultDebugSettings = {
    wireframe: false,
    physicsDebug: true,
  };

  const [debugSettings, setDebugSettings] = useState(() => {
    return getFromLocalStorage(
      DEBUG_SETTINGS_STORAGE_KEY,
      defaultDebugSettings
    );
  });

  useEffect(() => {
    setToLocalStorage(DEBUG_SETTINGS_STORAGE_KEY, debugSettings);
  }, [debugSettings]);

  const [internalCameraMode, setInternalCameraMode] = useState<
    'orbit' | 'follow'
  >(() => {
    return getFromLocalStorage<'orbit' | 'follow'>(
      CAMERA_MODE_STORAGE_KEY,
      'orbit'
    );
  });

  useEffect(() => {
    if (externalCameraMode === undefined) {
      setToLocalStorage(CAMERA_MODE_STORAGE_KEY, internalCameraMode);
    }
  }, [internalCameraMode, externalCameraMode]);
  const carChassisRef = useRef<Object3D>(null!);
  const carChassisApiRef = useRef<any>(null);
  const carVehicleApiRef = useRef<any>(null);
  const carSteeringValueRef = useRef<React.RefObject<number> | null>(null);
  const directionalLightRef = useRef<DirectionalLight>(null!);
  const [physicsReady, setPhysicsReady] = useState(false);

  const cameraMode = externalCameraMode ?? internalCameraMode;

  // Wait for next frame to ensure Canvas is ready before initializing physics
  useEffect(() => {
    // Use requestAnimationFrame to wait for Canvas to be ready
    const frameId = requestAnimationFrame(() => {
      setTimeout(() => {
        setPhysicsReady(true);
      }, 100);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (externalCameraMode !== undefined) {
      setInternalCameraMode(externalCameraMode);
    }
  }, [externalCameraMode]);

  return (
    <div className={styles.mainPage}>
      <Canvas
        camera={{ position: [5, 2, 5], fov: 25 }}
        shadows="soft"
        gl={{
          antialias: true,
          alpha: true,
          //   powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false,
        }}
      >
        <Skybox position={[0, -200, 0]} />

        <ambientLight intensity={0.3} />
        <directionalLight
          ref={directionalLightRef}
          position={[50, 150, 50]}
          intensity={6.0}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          // shadow-camera-near={0.1}
          // shadow-camera-far={200}
          // shadow-camera-left={-50}
          // shadow-camera-right={50}
          // shadow-camera-top={50}
          // shadow-camera-bottom={-50}
        />
        {/* <directionalLight position={[-5, 10, -5]} intensity={1.8} /> */}
        {/* <pointLight position={[100, 100, 100]} intensity={1.0} /> */}

        {/* Helper lines */}
        <axesHelper args={[5]} />
        {/* <gridHelper args={[20, 20]} /> */}

        <Physics
          gravity={[0, -9.81, 0]}
          broadphase="SAP"
          defaultContactMaterial={{
            contactEquationRelaxation: 4,
            friction: 0.002,
          }}
          allowSleep={false}
        >
          {debugSettings.physicsDebug
            ? physicsReady && (
                <Debug color="red" scale={1.1}>
                  <>
                    <FloorPlane position={[0, 0, 0]} />
                    <Car
                      position={[0, 2, 0]}
                      resetTrigger={resetTrigger}
                      onChassisRefReady={(ref) => {
                        carChassisRef.current = ref.current;
                      }}
                      onChassisApiReady={(api) => {
                        carChassisApiRef.current = api;
                      }}
                      onVehicleApiReady={(api) => {
                        carVehicleApiRef.current = api;
                      }}
                      onSteeringValueReady={(ref) => {
                        carSteeringValueRef.current = ref;
                      }}
                    />
                  </>
                </Debug>
              )
            : physicsReady && (
                <>
                  <FloorPlane position={[0, 0, 0]} />
                  <Car
                    position={[0, 0, 0]}
                    resetTrigger={resetTrigger}
                    onChassisRefReady={(ref) => {
                      carChassisRef.current = ref.current;
                    }}
                    onChassisApiReady={(api) => {
                      carChassisApiRef.current = api;
                    }}
                    onVehicleApiReady={(api) => {
                      carVehicleApiRef.current = api;
                    }}
                    onSteeringValueReady={(ref) => {
                      carSteeringValueRef.current = ref;
                    }}
                  />
                </>
              )}
        </Physics>

        <PerformanceTracker onMetricsUpdate={setPerformanceMetrics} />

        {carChassisApiRef.current && (
          <Speedometer
            chassisApi={carChassisApiRef.current}
            onSpeedUpdate={(speedKmh: number) => {
              setPerformanceMetrics((prev) => ({
                ...prev,
                speed: speedKmh,
              }));
            }}
          />
        )}
        {cameraMode === 'orbit' && <OrbitControls enableZoom={true} />}
        {cameraMode === 'follow' && (
          <FollowCamera
            target={carChassisRef}
            offset={[0, 2.5, 13]}
            steeringValueRef={carSteeringValueRef.current}
          />
        )}
        <FollowShadowCamera
          target={carChassisRef}
          lightRef={directionalLightRef}
          shadowSize={50}
          shadowDistance={200}
        />

        <PostProcessingEffects settings={postProcessingSettings} />
      </Canvas>

      <PerformanceWidget
        metrics={performanceMetrics}
        postProcessingSettings={postProcessingSettings}
        onPostProcessingChange={setPostProcessingSettings}
        debugSettings={debugSettings}
        onDebugChange={setDebugSettings}
      />

      {performanceMetrics.speed !== undefined && (
        <SpeedDisplay speed={performanceMetrics.speed} />
      )}
    </div>
  );
};

export default MainPage;
