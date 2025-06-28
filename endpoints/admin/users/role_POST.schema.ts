import { z } from 'zod';

// Manually define the enum values for Zod validation
const userRoleEnum = z.enum(['admin', 'user']);

export const schema = z.object({
  userId: z.number().int().positive(),
  role: userRoleEnum,
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  message: string;
};

export const postAdminUsersRole = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/users/role`, {
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
    throw new Error(errorObject.error || 'Failed to update user role');
  }
  return result.json();
};