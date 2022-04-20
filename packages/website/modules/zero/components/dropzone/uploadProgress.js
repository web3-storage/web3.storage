import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';

/**
 * @prop {string} [label]
 * @prop {number} [progress]
 * @prop {number} [rate]
 */

const UploadProgress = ({ label, progress }) => {
  const [displayValue, setDisplayValue] = useState(0);
  // const [running, setRunning] = useState(true);
  const lastChunkProgress = useRef(0);
  const lastChunkTime = useRef(0);
  const rate = useRef(0.1);
  // const now = useRef(0);
  // const then = useRef(0);
  const fps = 1;
  const fpsInterval = 1000 / fps;

  const incrementDisplayValue = () => {
    // if (!running) {
    //   return;
    // }
    // now.current = Date.now();
    // const elapsed = now.current - then.current;
    // if (elapsed > fpsInterval) {
    //   then.current = now.current - (elapsed % fpsInterval);
    //   setDisplayValue(displayValue => displayValue + rate.current);
    // }
    // window.requestAnimationFrame(incrementDisplayValue);
    setDisplayValue(displayValue => displayValue + rate.current);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      incrementDisplayValue();
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (lastChunkProgress.current === 0 || lastChunkTime.current === 0) {
      rate.current = 0.1;
    } else {
      rate.current = Math.min(10, Math.max(0.1, ((progress - lastChunkProgress.current) / (Date.now() - lastChunkTime.current)) * 100));
    }

    setDisplayValue(progress);
    // then.current = Date.now();
    // incrementDisplayValue();

    lastChunkProgress.current = progress;
    lastChunkTime.current = Date.now();

    // return () => {
    //   setRunning(false);
    // };
  }, [progress]);

  console.log(rate);
  return (
    <div className="loading-c">
      <span className="loading-label">{label}</span>
      <span className="loading-count">{Math.min(displayValue, 99.9).toFixed(1)}%</span>
    </div>
  );
}

export default UploadProgress;
