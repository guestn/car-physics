import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SpinningCube } from '../../components/SpinningCube'
import { FloorPlane } from '../../components/FloorPlane'
import { CustomTorus } from '../../components/CustomTorus'
import styles from './main-page.module.css'

function MainPage() {
  return (
    <div className={styles.mainPage}>
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }} shadows="soft">
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
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  )
}

export default MainPage
