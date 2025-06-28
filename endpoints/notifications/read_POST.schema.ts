import { z } from 'zod';

export const schema = z.object({
  notificationIds: z.array(z.number()).min(1, 'At least one notification ID is required.'),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  updatedCount?: number;
  message?: string;
};

export const postNotificationsRead = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/notifications/read`, {
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