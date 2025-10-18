import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SpinningCube } from '../../components/domain/SpinningCube'
import { FloorPlane } from '../../components/domain/FloorPlane'
import { CustomTorus } from '../../components/domain/CustomTorus'
import { TexturedSphere } from '../../components/domain/TexturedSphere'
import { Skybox } from '../../components/domain/Skybox'
import styles from './main-page.module.css'

export const MainPage = () => {
  return (
    <div className={styles.mainPage}>
      <Canvas camera={{ position: [0, 2, 20], fov: 25 }} shadows="soft">
        <Skybox position={[0, 10, 0]} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.0} castShadow />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Helper lines */}
        <axesHelper args={[5]} />
        <gridHelper args={[20, 20]} />

        <SpinningCube position={[0, 1, 0]} />
        <FloorPlane position={[0, -1, 0]} />
        <CustomTorus position={[3, 1, 0]} />
        <TexturedSphere position={[-3, 1, 0]} />
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  )
}

export default MainPage
