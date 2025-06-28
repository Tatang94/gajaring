import { z } from 'zod';
import { NotificationType } from '../helpers/schema';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type Notification = {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
  triggerUserId: number | null;
  triggerUserDisplayName: string | null;
  triggerUserUsername: string | null;
  triggerUserAvatarUrl: string | null;
  relatedPostId: number | null;
  relatedPostContent: string | null;
};

export type OutputType = Notification[];

export const getNotifications = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/notifications`, {
    method: 'GET',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error);
  }
  return result.json();
};