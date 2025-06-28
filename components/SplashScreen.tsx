"use client";

import React, { useEffect, useState } from 'react';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  onFinish?: () => void;
  className?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish,
  className 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) {
        onFinish();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <svg 
            viewBox="0 0 100 100" 
            className={styles.logoSvg}
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="45" className={styles.logoCircle} />
            <path 
              d="M30,35 L70,35 L70,65 L30,65 Z" 
              className={styles.logoShape}
            />
            <path 
              d="M40,25 L60,25 L60,75 L40,75 Z" 
              className={styles.logoShape}
            />
          </svg>
        </div>
        <h1 className={styles.appName}>GAJARING</h1>
        <p className={styles.tagline}>Connect. Share. Engage.</p>
      </div>
    </div>
  );
};

export default SplashScreen;