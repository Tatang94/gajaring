import { z } from 'zod';

export const schema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(50).default(10),
});

export type InputType = z.infer<typeof schema>;

export type UserSearchResult = {
  id: number;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  isVerified: boolean | null;
};

export type OutputType = UserSearchResult[];

export const getUsersSearch = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  searchParams.append('query', params.query);
  if (params.limit) searchParams.append('limit', String(params.limit));

  const result = await fetch(`/_api/users/search?${searchParams.toString()}`, {
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