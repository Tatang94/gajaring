import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers } from '../endpoints/admin/users_GET.schema';
import { getAdminPosts } from '../endpoints/admin/posts_GET.schema';
import { postAdminPostsDelete } from '../endpoints/admin/posts/delete_POST.schema';
import { postAdminUsersRole } from '../endpoints/admin/users/role_POST.schema';

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'];
export const ADMIN_POSTS_QUERY_KEY = ['admin', 'posts'];

/**
 * Hook for fetching all users with infinite scrolling (Admin only).
 */
export const useAdminUsers = () => {
  return useInfiniteQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: ({ pageParam }) => getAdminUsers({ cursor: pageParam, limit: 20 }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook for fetching all posts with infinite scrolling (Admin only).
 */
export const useAdminPosts = () => {
  return useInfiniteQuery({
    queryKey: ADMIN_POSTS_QUERY_KEY,
    queryFn: ({ pageParam }) => getAdminPosts({ cursor: pageParam, limit: 20 }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook for deleting a post (Admin only).
 * Invalidates the admin posts query on success.
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAdminPostsDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_POSTS_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
      // Here you could show a toast notification to the user
    },
  });
};

/**
 * Hook for updating a user's role (Admin only).
 * Invalidates the admin users query on success.
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAdminUsersRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      // Here you could show a toast notification to the user
    },
  });
};