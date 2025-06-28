import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getProfile } from '../endpoints/profile_GET.schema';
import { getPostsUser } from '../endpoints/posts/user_GET.schema';

export const USER_PROFILE_QUERY_KEY = 'userProfile';
export const USER_POSTS_QUERY_KEY = 'userPosts';

/**
 * Hook to fetch a user's public profile.
 * @param userId The ID of the user to fetch.
 */
export const useUserProfile = (userId: number) => {
  return useQuery({
    queryKey: [USER_PROFILE_QUERY_KEY, userId],
    queryFn: () => getProfile({ userId }),
    enabled: !!userId,
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook to fetch a user's posts with infinite scrolling.
 * @param userId The ID of the user whose posts to fetch.
 */
export const useUserPosts = (userId: number) => {
  return useInfiniteQuery({
    queryKey: [USER_POSTS_QUERY_KEY, userId],
    queryFn: ({ pageParam }) => getPostsUser({ userId, cursor: pageParam, limit: 10 }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
    placeholderData: (prev) => prev,
  });
};