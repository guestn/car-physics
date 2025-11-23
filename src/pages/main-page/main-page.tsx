import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { Physics, Debug } from '@react-three/cannon';
import { FloorPlane } from '@/components/domain/floor-plane/floor-plane';
import { Skybox } from '@/components/domain/skybox/skybox';
import { Car } from '@/components/domain/car/car';
import { FollowCamera } from '@/components/domain/camera/follow-camera';
import { Object3D } from 'three';
import {
  PerformanceWidget,
  PerformanceTracker,
} from '@/utils/performance-widget/performance-widget';
import type { PerformanceMetrics } from '@/utils/performance-widget/performance-widget';
import { PostProcessingEffects } from '@/effects/post-processing-effects';
import type { PostProcessingSettings } from '@/effects/post-processing-effects';
import styles from './main-page.module.css';

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

  const [postProcessingSettings, setPostProcessingSettings] =
    useState<PostProcessingSettings>({
      bloom: false,
      vignette: false,
      noise: false,
      depthOfField: false,
      outline: false,
    });

  const [debugSettings, setDebugSettings] = useState({
    wireframe: false,
    physicsDebug: true,
  });

  const [internalCameraMode, setInternalCameraMode] = useState<
    'orbit' | 'follow'
  >('orbit');
  const carChassisRef = useRef<Object3D>(null!);
  const [physicsReady, setPhysicsReady] = useState(false);

  // Use external camera mode if provided, otherwise use internal state
  const cameraMode = externalCameraMode ?? internalCameraMode;

  // Wait for next frame to ensure Canvas is ready before initializing physics
  useEffect(() => {
    // Use requestAnimationFrame to wait for Canvas to be ready
    const frameId = requestAnimationFrame(() => {
      // Then wait a bit more for worker thread
      setTimeout(() => {
        setPhysicsReady(true);
      }, 200);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Update internal state when external mode changes
  useEffect(() => {
    if (externalCameraMode !== undefined) {
      setInternalCameraMode(externalCameraMode);
    }
  }, [externalCameraMode]);

  //const ToggledDebug = useToggle(Debug, 'ToggledDebug')

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
        <Skybox position={[0, 10, 0]} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[50, 150, 50]} intensity={6.0} castShadow />
        {/* <directionalLight position={[-5, 10, -5]} intensity={1.8} /> */}
        <pointLight position={[100, 100, 100]} intensity={1.0} />

        {/* Helper lines */}
        <axesHelper args={[5]} />
        <gridHelper args={[20, 20]} />

        <Physics
          gravity={[0, -9.81, 0]}
          broadphase="SAP"
          defaultContactMaterial={{
            contactEquationRelaxation: 4,
            friction: 1e-3,
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
                    />
                  </>
                </Debug>
              )
            : physicsReady && (
                <>
                  <FloorPlane position={[0, 0, 0]} />
                  <Car
                    position={[0, 2, 0]}
                    resetTrigger={resetTrigger}
                    onChassisRefReady={(ref) => {
                      carChassisRef.current = ref.current;
                    }}
                  />
                </>
              )}
        </Physics>

        <PerformanceTracker onMetricsUpdate={setPerformanceMetrics} />
        {cameraMode === 'orbit' && <OrbitControls enableZoom={true} />}
        {cameraMode === 'follow' && (
          <FollowCamera target={carChassisRef} offset={[0, 3, 13]} />
        )}

        <PostProcessingEffects settings={postProcessingSettings} />
      </Canvas>

      <PerformanceWidget
        metrics={performanceMetrics}
        postProcessingSettings={postProcessingSettings}
        onPostProcessingChange={setPostProcessingSettings}
        debugSettings={debugSettings}
        onDebugChange={setDebugSettings}
      />
    </div>
  );
};

export default MainPage;
