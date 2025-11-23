import styles from './Footer.module.css';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  onReset?: () => void;
}

export const Footer = ({ onReset }: FooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.footerText}>{t('footer.copyright')}</p>
        {onReset && (
          <button
            onClick={onReset}
            className={styles.resetButton}
            type="button"
          >
            Reset
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;
