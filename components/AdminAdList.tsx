import React from 'react';
import { useAdminAds } from '../helpers/useAds';
import { AdminAdCard } from './AdminAdCard';
import { Skeleton } from './Skeleton';
import styles from './AdminAdList.module.css';

export const AdminAdList = () => {
  const { data, isFetching, error } = useAdminAds();

  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className={styles.skeletonCard}>
        <div className={styles.skeletonHeader}>
          <Skeleton style={{ height: '1.5rem', width: '60%' }} />
          <Skeleton style={{ height: '1.5rem', width: '80px' }} />
        </div>
        <div className={styles.skeletonBody}>
          <Skeleton style={{ height: '1rem', width: '90%' }} />
          <Skeleton style={{ height: '1rem', width: '70%' }} />
        </div>
        <div className={styles.skeletonFooter}>
          <Skeleton style={{ height: '2rem', width: '80px' }} />
        </div>
      </div>
    ))
  );

  if (isFetching) {
    return (
      <div className={styles.listContainer}>
        {renderSkeletons()}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.listContainer} ${styles.errorContainer}`}>
        <p>Error fetching ads: {error instanceof Error ? error.message : 'An unknown error occurred'}</p>
      </div>
    );
  }

  if (!data || data.ads.length === 0) {
    return (
      <div className={`${styles.listContainer} ${styles.emptyContainer}`}>
        <p>No advertisements found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {data.ads.map(ad => (
        <AdminAdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
};