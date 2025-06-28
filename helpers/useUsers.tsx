import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { postUsersFollow } from '../endpoints/users/follow_POST.schema';
import { postUsersUnfollow } from '../endpoints/users/unfollow_POST.schema';
import { getUsersSearch } from '../endpoints/users/search_GET.schema';
import { postUsersProfileUpdate, InputType } from '../endpoints/users/profile/update_POST.schema';
import { postUsersCheckVerification } from '../endpoints/users/check-verification_POST.schema';
import { useAuth, AUTH_QUERY_KEY } from './useAuth';

export const USERS_QUERY_KEY = ['users'] as const;

/**
 * Hook for following a user.
 * Invalidates relevant queries on success.
 */
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUsersFollow,
    onSuccess: async (_, variables) => {
      // Check verification status for the followed user
      try {
        await postUsersCheckVerification({ userId: variables.userIdToFollow });
      } catch (error) {
        console.error('Error checking verification after follow:', error);
      }
      
      // Invalidate queries that might display follower/following counts or status
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] }); // Current user's following count might change
    },
    onError: (error) => {
      console.error('Error following user:', error);
    },
  });
};

/**
 * Hook for unfollowing a user.
 * Invalidates relevant queries on success.
 */
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUsersUnfollow,
    onSuccess: async (_, variables) => {
      // Check verification status for the unfollowed user
      try {
        await postUsersCheckVerification({ userId: variables.userIdToUnfollow });
      } catch (error) {
        console.error('Error checking verification after unfollow:', error);
      }
      
      // Invalidate queries that might display follower/following counts or status
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] }); // Current user's following count might change
    },
    onError: (error) => {
      console.error('Error unfollowing user:', error);
    },
  });
};

/**
 * Hook for searching users with debouncing.
 * @param query The search term.
 * @param debounceMs The debounce delay in milliseconds.
 */
export const useSearchUsers = (query: string, debounceMs = 500) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  return useQuery({
    queryKey: [USERS_QUERY_KEY, 'search', debouncedQuery],
    queryFn: () => getUsersSearch({ query: debouncedQuery, limit: 10 }),
    enabled: !!debouncedQuery, // Only run query if debouncedQuery is not empty
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook for updating the current user's profile.
 * Includes optimistic updates and auth context sync.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { onLogin } = useAuth();

  return useMutation({
    mutationFn: postUsersProfileUpdate,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: AUTH_QUERY_KEY });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(AUTH_QUERY_KEY);

      // Optimistically update to the new value
      if (previousUser) {
        const optimisticUser = {
          ...previousUser,
          displayName: variables.displayName,
          bio: variables.bio,
          avatarUrl: variables.avatarUrl,
        };
        queryClient.setQueryData(AUTH_QUERY_KEY, optimisticUser);
      }

      // Return a context object with the snapshotted value
      return { previousUser };
    },
    onSuccess: (data) => {
      if ('user' in data) {
        // Update auth context with the server response
        onLogin(data.user);
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUser) {
        queryClient.setQueryData(AUTH_QUERY_KEY, context.previousUser);
      }
      console.error('Error updating profile:', error);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
};

/**
 * Hook to get the current authenticated user's data.
 * A simple wrapper around useAuth for convenience.
 */
export const useCurrentUser = () => {
  const { authState } = useAuth();
  return authState;
};