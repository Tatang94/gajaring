import { z } from 'zod';

export const schema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.number().optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type PostType = {
  id: number;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  userId: number;
  userDisplayName: string;
  userUsername: string | null;
  userAvatarUrl: string | null;
  isVerified: boolean | null;
};

export type OutputType = {
  posts: PostType[];
  nextCursor: number | null;
};

export const getPosts = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.cursor) searchParams.append('cursor', String(params.cursor));

  const result = await fetch(`/_api/posts?${searchParams.toString()}`, {
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