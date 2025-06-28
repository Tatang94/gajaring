import React from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../helpers/useAuth';
import { Skeleton } from '../components/Skeleton';
import styles from './profile.module.css';

const ProfileRedirectPage = () => {
  const { authState } = useAuth();

  if (authState.type === 'loading') {
    return (
      <>
        <Helmet>
          <title>Profile | GAJARING</title>
        </Helmet>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <Skeleton style={{ width: '6rem', height: '6rem', borderRadius: '50%', margin: '0 auto var(--spacing-4)' }} />
            <Skeleton style={{ width: '200px', height: '1.5rem', margin: '0 auto var(--spacing-2)' }} />
            <Skeleton style={{ width: '150px', height: '1rem', margin: '0 auto var(--spacing-4)' }} />
            <div className={styles.statsLoading}>
              <Skeleton style={{ width: '60px', height: '2rem' }} />
              <Skeleton style={{ width: '60px', height: '2rem' }} />
              <Skeleton style={{ width: '60px', height: '2rem' }} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (authState.type === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // Redirect to the current user's profile page
  return <Navigate to={`/profile/${authState.user.id}`} replace />;
};

export default ProfileRedirectPage;