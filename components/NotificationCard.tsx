"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, AtSign, Share, Mail, Settings } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { useTimeAgo } from '../helpers/useTimeAgo';
import { NotificationType } from '../helpers/schema';
import { type Notification } from '../helpers/notificationTypes';
import styles from './NotificationCard.module.css';

interface NotificationCardProps {
  notification: Notification;
  className?: string;
}

const notificationDetails: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  like: { icon: Heart, color: 'var(--like)' },
  comment: { icon: MessageCircle, color: 'var(--comment)' },
  follow: { icon: UserPlus, color: 'var(--primary)' },
  mention: { icon: AtSign, color: 'var(--mention)' },
  share: { icon: Share, color: 'var(--share)' },
  message: { icon: Mail, color: 'var(--info)' },
  system: { icon: Settings, color: 'var(--warning)' },
};

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, className }) => {
  const timeAgo = useTimeAgo(notification.createdAt);
  const details = notificationDetails[notification.type];
  const Icon = details.icon;

  // Handle cases where triggerUser might not exist (system notifications)
  const displayName = notification.triggerUser?.displayName || 'System';
  const avatarUrl = notification.triggerUser?.avatarUrl;
  const username = notification.triggerUser?.username || 'system';

  const linkTo = notification.triggerUser ? `/profile/${notification.triggerUser.id}` : "#";
  const isLinkDisabled = !notification.triggerUser;

  const cardContent = (
    <>
      <div className={styles.iconWrapper} style={{ color: details.color }}>
        <Icon size={20} />
      </div>
      <Avatar className={styles.avatar}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : (
          <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      <div className={styles.content}>
        <p className={styles.text}>
          <span className={styles.userName}>{displayName}</span> {notification.message}
          {notification.relatedPost && (
            <span className={styles.postContent}>: "{notification.relatedPost.content}"</span>
          )}
        </p>
        <span className={styles.timeAgo}>{timeAgo}</span>
      </div>
      {!notification.isRead && <div className={styles.unreadDot} />}
    </>
  );

  if (isLinkDisabled) {
    return (
      <div className={`${styles.card} ${styles.disabled} ${notification.isRead ? '' : styles.unread} ${className || ''}`}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={linkTo} className={`${styles.card} ${notification.isRead ? '' : styles.unread} ${className || ''}`}>
      {cardContent}
    </Link>
  );

  };