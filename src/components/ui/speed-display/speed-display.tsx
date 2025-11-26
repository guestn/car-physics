import styles from './speed-display.module.css';

interface SpeedDisplayProps {
  speed: number;
}

export const SpeedDisplay = ({ speed }: SpeedDisplayProps) => {
  return (
    <div className={styles.speedDisplay}>
      <div className={styles.speedValue}>{Math.round(speed)}</div>
      <div className={styles.speedUnit}>km/h</div>
    </div>
  );
};

