import { z } from 'zod';
import { AdSchema, AdTypeEnum } from '../../helpers/adsSchema';

// Re-export for other components
export { AdSchema, AdTypeEnum };
export type Ad = z.infer<typeof AdSchema>;

const baseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  isActive: z.boolean().default(true),
});

const scriptAdSchema = baseSchema.extend({
  type: z.literal('script'),
  scriptCode: z.string().min(1, 'Script code cannot be empty.'),
});

const promotionalAdSchema = baseSchema.extend({
  type: z.literal('promotional'),
  content: z.string().min(1, 'Content cannot be empty.'),
  imageUrl: z.string().url('Must be a valid URL.').optional().nullable(),
  linkUrl: z.string().url('Must be a valid URL.'),
});

export const schema = z.discriminatedUnion('type', [
  scriptAdSchema,
  promotionalAdSchema,
]);

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  ad: Ad;
};

export const postAdminAds = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/ads`, {
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
    throw new Error(errorObject.error || 'Failed to create ad');
  }
  const data = await result.json();
  // Manually parse dates since they come as strings from JSON
  data.ad.createdAt = new Date(data.ad.createdAt);
  return data;
};