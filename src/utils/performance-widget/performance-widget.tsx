import { useState, useRef, useEffect } from 'react';
import styles from './performance-widget.module.css';
import type { PostProcessingSettings } from '@/effects/post-processing-effects';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  speed?: number; // Speed in km/h
}

export interface DebugSettings {
  wireframe: boolean;
  physicsDebug: boolean;
}

interface PerformanceWidgetProps {
  metrics: PerformanceMetrics;
  postProcessingSettings: PostProcessingSettings;
  onPostProcessingChange: (settings: PostProcessingSettings) => void;
  debugSettings?: DebugSettings;
  onDebugChange?: (settings: DebugSettings) => void;
}

export const PerformanceTracker = ({
  onMetricsUpdate,
}: {
  onMetricsUpdate: (metrics: PerformanceMetrics) => void;
}) => {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    let animationId: number;

    const updateMetrics = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;
      frameCountRef.current++;

      // Update FPS every second
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        const frameTime = deltaTime / frameCountRef.current;

        // Keep a rolling average of FPS for smoother display
        fpsHistoryRef.current.push(fps);
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }

        const avgFps = Math.round(
          fpsHistoryRef.current.reduce((sum, f) => sum + f, 0) /
            fpsHistoryRef.current.length
        );

        onMetricsUpdate({
          fps: avgFps,
          frameTime: Math.round(frameTime * 100) / 100,
          memoryUsage: getMemoryUsage(),
        });

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationId = requestAnimationFrame(updateMetrics);
    };

    animationId = requestAnimationFrame(updateMetrics);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onMetricsUpdate]);

  const getMemoryUsage = (): number | undefined => {
    // @ts-ignore - performance.memory is not in TypeScript definitions
    if (performance.memory) {
      // @ts-ignore
      return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return undefined;
  };

  return null; // This component doesn't render anything
};

// Display component that runs outside Canvas
export const PerformanceWidget = ({
  metrics,
  postProcessingSettings,
  onPostProcessingChange,
  debugSettings,
  onDebugChange,
}: PerformanceWidgetProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [showPostProcessing, setShowPostProcessing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const getFpsColor = (fps: number): string => {
    if (fps >= 55) return 'var(--color-success)';
    if (fps >= 30) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow dragging from the header, but not from buttons
    const target = e.target as HTMLElement;
    const isButton = target.tagName === 'BUTTON' || target.closest('button');

    if (!isButton) {
      e.preventDefault();
      setIsDragging(true);
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        dragOffsetRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
      // Capture pointer to track movement even outside the element
      const headerElement = e.currentTarget as HTMLElement;
      headerElement.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (widgetRef.current) {
      widgetRef.current.releasePointerCapture(e.pointerId);
    }
  };

  if (!isVisible) {
    return (
      <button
        className={styles.toggleButton}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onClick={toggleVisibility}
        title="Show Performance Widget"
      >
        📊
      </button>
    );
  }

  return (
    <div
      ref={widgetRef}
      className={`${styles.widget} ${isDragging ? styles.dragging : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className={`${styles.header} widget-header`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <h3 className={styles.title}>Performance</h3>
        <div className={styles.headerButtons}>
          <button
            className={styles.toggleButton}
            onClick={() => setShowPostProcessing(!showPostProcessing)}
            title="Toggle Post-Processing Controls"
          >
            🎨
          </button>
          {debugSettings && onDebugChange && (
            <button
              className={styles.toggleButton}
              onClick={() => setShowDebug(!showDebug)}
              title="Toggle Debug Controls"
            >
              🐛
            </button>
          )}
          <button
            className={styles.closeButton}
            onClick={toggleVisibility}
            title="Hide Performance Widget"
          >
            ×
          </button>
        </div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.label}>FPS:</span>
          <span
            className={styles.value}
            style={{ color: getFpsColor(metrics.fps) }}
          >
            {metrics.fps}
          </span>
        </div>

        <div className={styles.metric}>
          <span className={styles.label}>Frame Time:</span>
          <span className={styles.value}>{metrics.frameTime}ms</span>
        </div>

        {metrics.memoryUsage && (
          <div className={styles.metric}>
            <span className={styles.label}>Memory:</span>
            <span className={styles.value}>{metrics.memoryUsage}MB</span>
          </div>
        )}
        {metrics.speed !== undefined && (
          <div className={styles.metric}>
            <span className={styles.label}>Speed:</span>
            <span className={styles.value}>
              {Math.round(metrics.speed)} km/h
            </span>
          </div>
        )}
      </div>

      {showPostProcessing && (
        <div className={styles.postProcessingControls}>
          <h4 className={styles.sectionTitle}>Post-Processing Effects</h4>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={postProcessingSettings.bloom}
                onChange={(e) =>
                  onPostProcessingChange({
                    ...postProcessingSettings,
                    bloom: e.target.checked,
                  })
                }
              />
              <span className={styles.checkboxText}>Bloom</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={postProcessingSettings.vignette}
                onChange={(e) =>
                  onPostProcessingChange({
                    ...postProcessingSettings,
                    vignette: e.target.checked,
                  })
                }
              />
              <span className={styles.checkboxText}>Vignette</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={postProcessingSettings.noise}
                onChange={(e) =>
                  onPostProcessingChange({
                    ...postProcessingSettings,
                    noise: e.target.checked,
                  })
                }
              />
              <span className={styles.checkboxText}>Noise</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={postProcessingSettings.depthOfField}
                onChange={(e) =>
                  onPostProcessingChange({
                    ...postProcessingSettings,
                    depthOfField: e.target.checked,
                  })
                }
              />
              <span className={styles.checkboxText}>Depth of Field</span>
            </label>
          </div>
        </div>
      )}

      {showDebug && debugSettings && onDebugChange && (
        <div className={styles.postProcessingControls}>
          <h4 className={styles.sectionTitle}>Debug Options</h4>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={debugSettings.wireframe}
                onChange={(e) =>
                  onDebugChange({
                    ...debugSettings,
                    wireframe: e.target.checked,
                  })
                }
              />
              <span className={styles.checkboxText}>Car Wireframe</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={debugSettings.physicsDebug}
                onChange={(e) =>
                  onDebugChange({
                    ...debugSettings,
                    physicsDebug: e.target.checked,
                  })
                }
              />
              <span className={styles.checkboxText}>Physics Debug</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
