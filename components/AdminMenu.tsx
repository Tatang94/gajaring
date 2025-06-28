import React from 'react';
import { Shield } from 'lucide-react';
import styles from './AdminMenu.module.css';

export const AdminMenu: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Shield size={32} className={styles.icon} />
      <div className={styles.textContainer}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Manage users, posts, and system settings.</p>
      </div>
    </div>
  );
};