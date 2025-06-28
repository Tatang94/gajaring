import { z } from 'zod';

export const schema = z.object({
  userId: z.number().int().positive('User ID must be a positive integer.'),
  isVerified: z.boolean(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  message: string;
} | {
  error: string;
  issues?: z.ZodIssue[];
};

/**
 * Client-side helper to call the user verification endpoint.
 * This is intended for admin use.
 * @param body - The user ID and their new verification status.
 * @param init - Optional request initialization options.
 */
export const postUsersVerify = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const response = await fetch(`/_api/users/verify`, {
    method: 'POST',
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorObject = await response.json();
    throw new Error(errorObject.error || 'Failed to update verification status.');
  }

  return response.json();
};