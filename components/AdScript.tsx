import React, { useEffect, useRef } from 'react';
import { Ad } from '../helpers/adsSchema';
import styles from './AdScript.module.css';

interface AdScriptProps {
  ad: Ad;
  className?: string;
}

export const AdScript: React.FC<AdScriptProps> = ({ ad, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ad.type !== 'script' || !ad.scriptCode || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    // Clear previous content
    container.innerHTML = '';

    // Create a temporary div to hold the script content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = ad.scriptCode;

    // Find and handle script tags
    const scripts = Array.from(tempDiv.getElementsByTagName('script'));
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      
      // Copy attributes
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy content
      newScript.textContent = oldScript.textContent;
      
      // Append the new script to the container to execute it
      container.appendChild(newScript);
      
      // Remove the original script tag from the temp content
      oldScript.parentNode?.removeChild(oldScript);
    });

    // Append the rest of the HTML content
    while (tempDiv.firstChild) {
      container.appendChild(tempDiv.firstChild);
    }

  }, [ad]);

  if (ad.type !== 'script' || !ad.scriptCode) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
      // The useEffect handles injection, so this is a fallback for non-script HTML
      dangerouslySetInnerHTML={{ __html: '' }}
    />
  );
};