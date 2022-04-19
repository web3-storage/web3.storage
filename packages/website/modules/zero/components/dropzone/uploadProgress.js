import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';

/**
 * @prop {string} [label]
 * @prop {number} [progress]
 * @prop {boolean} [isRunning]
 */

const UploadProgress = ({ label, progress, isRunning = true}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const now = useRef(0);
  const then = useRef(0);
  const fps = 1;
  const fpsInterval = 1000 / fps;

  const incrementDisplayValue = () => {
    if (!isRunning) {
      return;
    }
    now.current = Date.now();
    const elapsed = now.current - then.current;
    if (elapsed > fpsInterval) {
      then.current = now.current - (elapsed % fpsInterval);
      setDisplayValue(displayValue => displayValue + 0.1);
    }
    window.requestAnimationFrame(incrementDisplayValue);
  }

  useEffect(() => {
    setDisplayValue(progress)
    then.current = Date.now();
    incrementDisplayValue()
  }, [progress]);

  return (
    <div className="loading-c">
      <span className="loading-label">{label}</span>
      <span className="loading-count">{Math.min(displayValue, 99.9).toFixed(1)}%</span>
    </div>
  );
}

export default UploadProgress;
