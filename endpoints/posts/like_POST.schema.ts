import { z } from 'zod';

export const schema = z.object({
  postId: z.number(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  liked: boolean;
  message: string;
};

export const postPostsLike = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/posts/like`, {
    method: 'POST',
    body: JSON.stringify(validatedInput),
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