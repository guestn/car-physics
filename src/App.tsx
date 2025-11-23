import { useState } from 'react';
import { Header } from '@/components/ui/header/header';
import { Footer } from '@/components/ui/footer/footer';
import { MainPage } from '@/pages/main-page/main-page';
import styles from './App.module.css';

function App() {
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <MainPage resetTrigger={resetTrigger} />
      </main>
      <Footer onReset={handleReset} />
    </div>
  );
}

export default App;
