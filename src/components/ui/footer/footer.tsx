import styles from './Footer.module.css';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  onReset?: () => void;
  onCameraToggle?: () => void;
}

export const Footer = ({ onReset, onCameraToggle }: FooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.footerText}>{t('footer.copyright')}</p>
        <div className={styles.footerButtons}>
          {onCameraToggle && (
            <button
              onClick={onCameraToggle}
              className={styles.resetButton}
              type="button"
            >
              Toggle Camera
            </button>
          )}
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
      </div>
    </footer>
  );
};

export default Footer;
