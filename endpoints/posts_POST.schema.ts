import { z } from 'zod';
import { Posts } from '../helpers/schema';

export const schema = z.object({
  content: z.string().min(1, 'Post content cannot be empty.').max(1000),
  imageUrl: z.string().url('Invalid image URL.').optional().nullable(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Posts;

export const postPosts = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/posts`, {
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