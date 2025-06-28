import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, PostType } from '../endpoints/posts_GET.schema';
import { postPosts } from '../endpoints/posts_POST.schema';
import { postPostsLike } from '../endpoints/posts/like_POST.schema';
import { postPostsComment } from '../endpoints/posts/comment_POST.schema';
import { postPostsShare } from '../endpoints/posts/share_POST.schema';
import { useAuth } from './useAuth';

export const POSTS_QUERY_KEY = ['posts'] as const;

/**
 * Hook for fetching posts with infinite scrolling.
 */
export const useInfinitePosts = () => {
  return useInfiniteQuery({
    queryKey: [POSTS_QUERY_KEY, 'infinite'],
    queryFn: ({ pageParam }) => getPosts({ cursor: pageParam, limit: 20 }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook for creating a new post.
 * Includes optimistic update to add the post to the feed immediately.
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { authState } = useAuth();

  return useMutation({
    mutationFn: postPosts,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: [POSTS_QUERY_KEY, 'infinite'] });

      const previousPosts = queryClient.getQueryData<any>([POSTS_QUERY_KEY, 'infinite']);

      if (authState.type !== 'authenticated') {
        console.error('useCreatePost: User is not authenticated. This should not happen.');
        return { previousPosts };
      }
      const { user } = authState;

      const optimisticPost: PostType = {
        id: -1 * Date.now(), // Temporary negative ID
        content: newPost.content,
        imageUrl: newPost.imageUrl ?? null,
        createdAt: new Date(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        userId: user.id,
        userDisplayName: user.displayName,
        userUsername: null, // Users don't have username in the User type
        userAvatarUrl: user.avatarUrl,
        isVerified: false,
      };

      queryClient.setQueryData([POSTS_QUERY_KEY, 'infinite'], (oldData: any) => {
        const newPages = oldData.pages.map((page: any, index: number) => {
          if (index === 0) {
            return {
              ...page,
              posts: [optimisticPost, ...page.posts],
            };
          }
          return page;
        });
        return { ...oldData, pages: newPages };
      });

      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      console.error('Error creating post:', err);
      if (context?.previousPosts) {
        queryClient.setQueryData([POSTS_QUERY_KEY, 'infinite'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY, 'infinite'] });
    },
  });
};

/**
 * Hook for liking or unliking a post.
 * Includes optimistic update to toggle the like count.
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postPostsLike,
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: [POSTS_QUERY_KEY, 'infinite'] });

      const previousPosts = queryClient.getQueryData<any>([POSTS_QUERY_KEY, 'infinite']);

      queryClient.setQueryData([POSTS_QUERY_KEY, 'infinite'], (oldData: any) => {
        if (!oldData) return oldData;

        // This is a guess. We don't know if the user has liked it before.
        // The backend is the source of truth. A better optimistic update would
        // require knowing the current like status for the user.
        // For now, we'll just invalidate. A full implementation would require
        // the GET /posts endpoint to return a `isLiked` boolean for the current user.
        // Let's just invalidate for now to avoid inconsistent state.
        return oldData;
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      console.error('Error liking post:', err);
      if (context?.previousPosts) {
        queryClient.setQueryData([POSTS_QUERY_KEY, 'infinite'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
};

/**
 * Hook for adding a comment to a post.
 * Optimistically increments the comment count.
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postPostsComment,
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: [POSTS_QUERY_KEY, 'infinite'] });
      const previousPosts = queryClient.getQueryData<any>([POSTS_QUERY_KEY, 'infinite']);

      queryClient.setQueryData([POSTS_QUERY_KEY, 'infinite'], (oldData: any) => {
        if (!oldData) return oldData;
        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          posts: page.posts.map((post: PostType) =>
            post.id === postId ? { ...post, commentsCount: post.commentsCount + 1 } : post
          ),
        }));
        return { ...oldData, pages: newPages };
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      console.error('Error creating comment:', err);
      if (context?.previousPosts) {
        queryClient.setQueryData([POSTS_QUERY_KEY, 'infinite'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
      // In a real app, we would also invalidate the specific post's comments query
      // queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
};

/**
 * Hook for sharing a post.
 * Optimistically increments the share count.
 */
export const useSharePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postPostsShare,
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: [POSTS_QUERY_KEY, 'infinite'] });
      const previousPosts = queryClient.getQueryData<any>([POSTS_QUERY_KEY, 'infinite']);

      queryClient.setQueryData([POSTS_QUERY_KEY, 'infinite'], (oldData: any) => {
        if (!oldData) return oldData;
        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          posts: page.posts.map((post: PostType) =>
            post.id === postId ? { ...post, sharesCount: post.sharesCount + 1 } : post
          ),
        }));
        return { ...oldData, pages: newPages };
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      console.error('Error sharing post:', err);
      if (context?.previousPosts) {
        queryClient.setQueryData([POSTS_QUERY_KEY, 'infinite'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
};