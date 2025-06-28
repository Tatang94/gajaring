// Import and re-export types from notification endpoint schema
import { type Notification as EndpointNotification } from '../endpoints/notifications_GET.schema';
import { NotificationType } from './schema';

export const NOTIFICATION_TYPES = {
  LIKE: 'like' as const,
  COMMENT: 'comment' as const,
  FOLLOW: 'follow' as const,
  MENTION: 'mention' as const,
  SHARE: 'share' as const,
  MESSAGE: 'message' as const,
  SYSTEM: 'system' as const,
} as const;

export interface NotificationUser {
  id: string;
  username: string;
  avatarUrl: string | null; // Fixed to match database schema
  displayName: string;
}

export interface NotificationPost {
  id: string;
  content: string;
  imageUrl?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  isRead: boolean;
  userId: string; // The user who will receive this notification
  triggerUser?: NotificationUser; // The user who triggered this notification (e.g., who liked the post)
  relatedPost?: NotificationPost; // The post this notification relates to (if applicable)
  metadata?: Record<string, unknown>; // Additional data for specific notification types
}

export interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  shares: boolean;
  messages: boolean;
  system: boolean;
}

// Re-export the endpoint notification type for direct use
export type { EndpointNotification };