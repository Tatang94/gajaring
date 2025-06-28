import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications } from '../endpoints/notifications_GET.schema';
import { postNotificationsRead } from '../endpoints/notifications/read_POST.schema';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

/**
 * Hook for fetching the current user's notifications.
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY],
    queryFn: getNotifications,
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook for marking notifications as read.
 * Includes an optimistic update to immediately reflect the change in the UI.
 */
export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postNotificationsRead,
    onMutate: async ({ notificationIds }) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });

      const previousNotifications = queryClient.getQueryData<any>([NOTIFICATIONS_QUERY_KEY]);

      queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY], (oldData: any[] | undefined) => {
        if (!oldData) return [];
        return oldData.map((notification) =>
          notificationIds.includes(notification.id) ? { ...notification, isRead: true } : notification
        );
      });

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      console.error('Error marking notifications as read:', err);
      if (context?.previousNotifications) {
        queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });
};