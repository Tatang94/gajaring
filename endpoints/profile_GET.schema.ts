import { z } from 'zod';

export const schema = z.object({
  userId: z.number().positive(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  id: number;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: Date;
  isVerified: boolean | null;
};

export const getProfile = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  searchParams.append('userId', String(params.userId));

  const result = await fetch(`/_api/profile?${searchParams.toString()}`, {
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