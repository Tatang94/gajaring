"use client";

import React, { useEffect } from 'react';
import { NotificationCard } from '../components/NotificationCard';
import { Skeleton } from '../components/Skeleton';
import { Button } from '../components/Button';
import { useNotifications, useMarkNotificationsRead } from '../helpers/useNotifications';
import { NOTIFICATION_TYPES, type Notification } from '../helpers/notificationTypes';
import styles from './notifications.module.css';

const NotificationsSkeleton = () => (
  <div className={styles.notificationsList}>
    {[...Array(5)].map((_, i) => (
      <div key={i} className={styles.skeletonNotification}>
        <Skeleton style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-full)' }} />
        <div className={styles.skeletonContent}>
          <Skeleton style={{ width: '80%', height: '1rem' }} />
          <Skeleton style={{ width: '40%', height: '0.8rem', marginTop: 'var(--spacing-2)' }} />
        </div>
      </div>
    ))}
  </div>
);

export default function NotificationsPage() {
  const { data: notifications, isFetching, error } = useNotifications();
  const markAsReadMutation = useMarkNotificationsRead();

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];

  const handleMarkAllAsRead = () => {
    if (unreadNotifications.length > 0) {
      markAsReadMutation.mutate({
        notificationIds: unreadNotifications.map(n => n.id),
      });
    }
  };

  // Transform API notifications to match NotificationCard interface
  const transformedNotifications: Notification[] = notifications?.map(notification => ({
    id: notification.id.toString(),
    type: notification.type,
    message: notification.message,
    createdAt: notification.createdAt.toString(),
    isRead: notification.isRead,
    userId: 'current-user-id', // This would come from auth context
    triggerUser: notification.triggerUserId ? {
      id: notification.triggerUserId.toString(),
      username: notification.triggerUserUsername || '',
      displayName: notification.triggerUserDisplayName || 'Unknown User',
      avatarUrl: notification.triggerUserAvatarUrl,
    } : undefined,
    relatedPost: notification.relatedPostId ? {
      id: notification.relatedPostId.toString(),
      content: notification.relatedPostContent || '',
    } : undefined,
  })) || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Notifications</h1>
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAsReadMutation.isPending}
              className={styles.markAllButton}
            >
              Mark all as read
            </Button>
          )}
        </div>
        {unreadNotifications.length > 0 && (
          <div className={styles.unreadBadge}>
            {unreadNotifications.length} unread
          </div>
        )}
      </header>

      {isFetching ? (
        <NotificationsSkeleton />
      ) : error ? (
        <div className={styles.errorState}>
          <p>Failed to load notifications. Please try again later.</p>
        </div>
      ) : transformedNotifications.length > 0 ? (
        <div className={styles.notificationsList}>
          {transformedNotifications.map(notification => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No notifications yet!</p>
        </div>
      )}
    </div>
  );
}