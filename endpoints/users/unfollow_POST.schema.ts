import { z } from 'zod';

export const schema = z.object({
  userIdToUnfollow: z.number(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  message: string;
};

export const postUsersUnfollow = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/users/unfollow`, {
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