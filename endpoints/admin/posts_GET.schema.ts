import { z } from 'zod';
import { type PostType } from '../posts_GET.schema';

export const schema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.number().optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  posts: PostType[];
  nextCursor: number | null;
};

export const getAdminPosts = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.cursor) searchParams.append('cursor', String(params.cursor));

  const result = await fetch(`/_api/admin/posts?${searchParams.toString()}`, {
    method: 'GET',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || 'Failed to fetch posts for admin');
  }
  return result.json();
};