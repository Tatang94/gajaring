import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../helpers/useAuth';
import { Button } from '../components/Button';
import { ProfileEditModal } from '../components/ProfileEditModal';
import { Skeleton } from '../components/Skeleton';
import styles from './settings.module.css';
import { User, Lock, Bell, Shield } from 'lucide-react';

const SettingsPage = () => {
  const { authState, logout } = useAuth();
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const renderLoading = () => (
    <div className={styles.container}>
      <div className={styles.header}>
        <Skeleton style={{ width: '200px', height: '2.5rem' }} />
      </div>
      <div className={styles.content}>
        <Skeleton style={{ width: '100%', height: '4rem', marginBottom: 'var(--spacing-4)' }} />
        <Skeleton style={{ width: '100%', height: '4rem', marginBottom: 'var(--spacing-4)' }} />
        <Skeleton style={{ width: '100%', height: '4rem', marginBottom: 'var(--spacing-4)' }} />
        <Skeleton style={{ width: '100px', height: '2.5rem', marginTop: 'var(--spacing-6)' }} />
      </div>
    </div>
  );

  if (authState.type === 'loading') {
    return renderLoading();
  }

  if (authState.type === 'unauthenticated') {
    return (
      <div className={styles.container}>
        <p>You must be logged in to view settings.</p>
      </div>
    );
  }

  const { user } = authState;

  return (
    <>
      <Helmet>
        <title>Settings - GAJARING</title>
        <meta name="description" content="Manage your account settings on GAJARING." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Settings</h1>
        </header>
        <main className={styles.content}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <User className={styles.icon} />
              <h2>Account</h2>
            </div>
            <div className={styles.settingItem}>
              <div>
                <h3>Edit Profile</h3>
                <p>Update your display name, bio, and avatar.</p>
              </div>
              <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                Edit
              </Button>
            </div>
            <div className={styles.settingItem}>
              <div>
                <h3>Email</h3>
                <p>{user.email}</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Lock className={styles.icon} />
              <h2>Security</h2>
            </div>
            <div className={styles.settingItem}>
              <div>
                <h3>Change Password</h3>
                <p>Update your password regularly to keep your account secure.</p>
              </div>
              <Button variant="outline" disabled>
                Change
              </Button>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Bell className={styles.icon} />
              <h2>Notifications</h2>
            </div>
            <div className={styles.settingItem}>
              <div>
                <h3>Notification Preferences</h3>
                <p>Manage how you receive notifications.</p>
              </div>
              <Button variant="outline" disabled>
                Manage
              </Button>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Shield className={styles.icon} />
              <h2>Privacy</h2>
            </div>
            <div className={styles.settingItem}>
              <div>
                <h3>Privacy Settings</h3>
                <p>Control your account's privacy.</p>
              </div>
              <Button variant="outline" disabled>
                Manage
              </Button>
            </div>
          </section>

          <div className={styles.logoutSection}>
            <Button variant="destructive" onClick={logout}>
              Log Out
            </Button>
          </div>
        </main>
      </div>
      {isEditModalOpen && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={user}
        />
      )}
    </>
  );
};

export default SettingsPage;