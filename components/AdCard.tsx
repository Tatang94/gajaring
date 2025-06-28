import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Ad } from '../helpers/adsSchema';
import styles from './AdCard.module.css';

interface AdCardProps {
  ad: Ad;
  className?: string;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, className }) => {
  // Guard against undefined/null ad
  if (!ad || ad.type !== 'promotional') {
    return null;
  }

  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{ad.title}</h3>
        <span className={styles.badge}>Iklan</span>
      </div>
      
      <a href={ad.linkUrl ?? '#'} target="_blank" rel="noopener noreferrer" className={styles.linkWrapper}>
        {ad.imageUrl && (
          <div className={styles.imageContainer}>
            <img src={ad.imageUrl} alt={ad.title} className={styles.image} />
          </div>
        )}
        <div className={styles.content}>
          <p className={styles.text}>{ad.content}</p>
          <div className={styles.footer}>
            <span>Visit Site</span>
            <ExternalLink size={16} />
          </div>
        </div>
      </a>
    </div>
  );
};