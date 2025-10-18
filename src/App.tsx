import Header from './components/Header'
import Footer from './components/Footer'
import MainPage from './pages/main-page/main-page'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <MainPage />
      </main>
      <Footer />
    </div>
  )
}

export default App
