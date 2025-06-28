import { z } from 'zod';

export const AdTypeEnum = z.enum(['script', 'promotional']);

export const AdSchema = z.object({
  id: z.number(),
  type: AdTypeEnum,
  title: z.string(),
  content: z.string().nullable(),
  scriptCode: z.string().nullable(),
  imageUrl: z.string().nullable(),
  linkUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type Ad = z.infer<typeof AdSchema>;