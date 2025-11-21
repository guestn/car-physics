import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useState, useEffect } from 'react';
import { Physics } from '@react-three/cannon';
import { FloorPlane } from '@/components/domain/floor-plane/floor-plane';
import { Skybox } from '@/components/domain/skybox/skybox';
import { Car } from '@/components/domain/car/car';
import {
  PerformanceWidget,
  PerformanceTracker,
} from '@/utils/performance-widget/performance-widget';
import type { PerformanceMetrics } from '@/utils/performance-widget/performance-widget';
import { PostProcessingEffects } from '@/effects/post-processing-effects';
import type { PostProcessingSettings } from '@/effects/post-processing-effects';
import styles from './main-page.module.css';

export const MainPage = () => {
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

  const [resetTrigger, setResetTrigger] = useState(0);
  const [physicsReady, setPhysicsReady] = useState(false);

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
  };

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
          {physicsReady && (
            <>
              <FloorPlane position={[0, 0, 0]} />
              <Car position={[0, 2, 0]} resetTrigger={resetTrigger} />
            </>
          )}
        </Physics>

        <PerformanceTracker onMetricsUpdate={setPerformanceMetrics} />
        <OrbitControls enableZoom={true} />

        <PostProcessingEffects settings={postProcessingSettings} />
      </Canvas>

      <PerformanceWidget
        metrics={performanceMetrics}
        postProcessingSettings={postProcessingSettings}
        onPostProcessingChange={setPostProcessingSettings}
      />

      <button
        onClick={handleReset}
        className={styles.resetButton}
        type="button"
      >
        Reset
      </button>
    </div>
  );
};

export default MainPage;
