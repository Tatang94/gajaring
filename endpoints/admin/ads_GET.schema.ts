import { z } from 'zod';
import { AdSchema, AdTypeEnum, Ad } from '../../helpers/adsSchema';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  ads: Ad[];
};

export const getAdminAds = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/ads`, {
    method: 'GET',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || 'Failed to fetch ads');
  }
  const data = await result.json();
  // Manually parse dates since they come as strings from JSON
  data.ads.forEach((ad: any) => {
    ad.createdAt = new Date(ad.createdAt);
  });
  return data;
};