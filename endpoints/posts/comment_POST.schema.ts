import { z } from 'zod';
import { Comments } from '../../helpers/schema';

export const schema = z.object({
  postId: z.number(),
  content: z.string().min(1, 'Comment cannot be empty.').max(500),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Comments;

export const postPostsComment = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/posts/comment`, {
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