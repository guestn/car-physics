import { useTranslation } from 'react-i18next'
import styles from './Header.module.css'

export const Header = () => {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{t('app.title')}</h1>
      <div className={styles.headerRight}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <a href="/" className={styles.navLink}>
                {t('navigation.home')}
              </a>
            </li>
            <li>
              <a href="/about" className={styles.navLink}>
                {t('navigation.about')}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
