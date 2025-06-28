import { z } from 'zod';

export const schema = z.object({
  userId: z.number().int().positive('User ID must be a positive integer.'),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  userId: number;
  isVerified: boolean;
  followersCount: number;
  verificationChanged: boolean;
  reason: string;
} | {
  error: string;
  issues?: z.ZodIssue[];
};

/**
 * Client-side helper to check and update user verification status based on follower count.
 * @param body - The user ID to check verification for.
 * @param init - Optional request initialization options.
 */
export const postUsersCheckVerification = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const response = await fetch(`/_api/users/check-verification`, {
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
    throw new Error(errorObject.error || 'Failed to check verification status.');
  }

  return response.json();
};