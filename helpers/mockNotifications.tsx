export const mockNotifications = [
  {
    id: 1,
    type: 'like' as const,
    message: 'liked your post',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    triggerUserId: 2,
    triggerUserDisplayName: 'Jane Smith',
    triggerUserUsername: 'jane',
    triggerUserAvatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    relatedPostId: 1,
    relatedPostContent: 'Welcome to GAJARING! This is the first post.',
    userId: 1,
  },
  {
    id: 2,
    type: 'follow' as const,
    message: 'started following you',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    triggerUserId: 3,
    triggerUserDisplayName: 'Mike Johnson',
    triggerUserUsername: 'mike',
    triggerUserAvatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    relatedPostId: null,
    relatedPostContent: null,
    userId: 1,
  },
  {
    id: 3,
    type: 'comment' as const,
    message: 'commented on your post',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    triggerUserId: 2,
    triggerUserDisplayName: 'Jane Smith',
    triggerUserUsername: 'jane',
    triggerUserAvatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    relatedPostId: 1,
    relatedPostContent: 'Welcome to GAJARING! This is the first post.',
    userId: 1,
  },
]