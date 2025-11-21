import { Header } from '@/components/ui/header/header';
import { Footer } from '@/components/ui/footer/footer';
import { MainPage } from '@/pages/main-page/main-page';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <MainPage />
      </main>
      <Footer />
    </div>
  );
}

export default App;
