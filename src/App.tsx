import { useState } from 'react';
import { Header } from '@/components/ui/header/header';
import { Footer } from '@/components/ui/footer/footer';
import { MainPage } from '@/pages/main-page/main-page';
import styles from './App.module.css';

function App() {
  const [resetTrigger, setResetTrigger] = useState(0);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'follow'>('orbit');

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
  };

  const handleCameraToggle = () => {
    setCameraMode((prev) => (prev === 'orbit' ? 'follow' : 'orbit'));
  };

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <MainPage
          resetTrigger={resetTrigger}
          cameraMode={cameraMode}
          onCameraModeChange={setCameraMode}
        />
      </main>
      <Footer onReset={handleReset} onCameraToggle={handleCameraToggle} />
    </div>
  );
}

export default App;
