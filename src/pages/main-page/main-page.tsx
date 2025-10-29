import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState } from 'react'
import { SpinningCube } from '@/components/domain/SpinningCube'
import { FloorPlane } from '@/components/domain/FloorPlane'
import { CustomTorus } from '@/components/domain/CustomTorus'
import { TexturedSphere } from '@/components/domain/TexturedSphere'
import { Skybox } from '@/components/domain/Skybox'
import {
  PerformanceWidget,
  PerformanceTracker,
} from '@/utils/PerformanceWidget'
import type { PerformanceMetrics } from '@/utils/PerformanceWidget'
import { PostProcessingEffects } from '@/effects/PostProcessingEffects'
import type { PostProcessingSettings } from '@/effects/PostProcessingEffects'
import { MeshToonCube } from '@/components/domain/MeshToonCube'
import styles from './main-page.module.css'

export const MainPage = () => {
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      fps: 0,
      frameTime: 0,
    })

  const [postProcessingSettings, setPostProcessingSettings] =
    useState<PostProcessingSettings>({
      bloom: true,
      vignette: true,
      noise: false,
      depthOfField: false,
      outline: false,
    })

  return (
    <div className={styles.mainPage}>
      <Canvas
        camera={{ position: [0, 2, 20], fov: 25 }}
        shadows="soft"
        gl={{ antialias: true }}
      >
        <Skybox position={[0, 10, 0]} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 15, 5]} intensity={3.0} castShadow />
        <directionalLight position={[-5, 10, -5]} intensity={1.8} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />

        {/* Helper lines */}
        <axesHelper args={[5]} />
        <gridHelper args={[20, 20]} />

        <SpinningCube position={[0, 1, 0]} />
        <FloorPlane position={[0, -1, 0]} />
        <CustomTorus position={[3, 1, 0]} />
        <TexturedSphere position={[-3, 1, 0]} />
        <MeshToonCube position={[0, 1, -3]} />

        <PerformanceTracker onMetricsUpdate={setPerformanceMetrics} />
        <OrbitControls enableZoom={true} />

        <PostProcessingEffects settings={postProcessingSettings} />
      </Canvas>

      <PerformanceWidget
        metrics={performanceMetrics}
        postProcessingSettings={postProcessingSettings}
        onPostProcessingChange={setPostProcessingSettings}
      />
    </div>
  )
}

export default MainPage
