import { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header/header';
import { Footer } from '@/components/ui/footer/footer';
import { MainPage } from '@/pages/main-page/main-page';
import { getFromLocalStorage, setToLocalStorage } from '@/utils/local-storage';
import styles from './App.module.css';

const CAMERA_MODE_STORAGE_KEY = 'car-physics:camera-mode';

function App() {
  const [resetTrigger, setResetTrigger] = useState(0);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'follow'>(() => {
    return getFromLocalStorage<'orbit' | 'follow'>(
      CAMERA_MODE_STORAGE_KEY,
      'orbit'
    );
  });

  // Save camera mode to localStorage whenever it changes
  useEffect(() => {
    setToLocalStorage(CAMERA_MODE_STORAGE_KEY, cameraMode);
  }, [cameraMode]);

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
  };

  const handleCameraToggle = () => {
    setCameraMode((prev) => {
      const newMode = prev === 'orbit' ? 'follow' : 'orbit';
      setToLocalStorage(CAMERA_MODE_STORAGE_KEY, newMode);
      return newMode;
    });
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
