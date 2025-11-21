import styles from './Footer.module.css'
import { useTranslation } from 'react-i18next'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className={styles.footer}>
      <p className={styles.footerText}>{t('footer.copyright')}</p>
    </footer>
  )
}

export default Footer
