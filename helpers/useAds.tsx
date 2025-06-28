import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminAds } from '../endpoints/admin/ads_GET.schema';
import { postAdminAds } from '../endpoints/admin/ads_POST.schema';
import { postAdminAdsDelete } from '../endpoints/admin/ads/delete_POST.schema';
import { toast } from 'sonner';

// Re-export types from schema files
export type { Ad } from './adsSchema';
export type { InputType as CreateAdInput } from '../endpoints/admin/ads_POST.schema';

// Query keys
export const ADS_QUERY_KEY = ['ads'];
export const ADMIN_ADS_QUERY_KEY = ['admin', 'ads'];
export const ACTIVE_ADS_QUERY_KEY = ['ads', 'active'];

/**
 * Hook for fetching all ads for display.
 */
export const useAds = () => {
  return useQuery({
    queryKey: ADS_QUERY_KEY,
    queryFn: getAdminAds,
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook for fetching all ads for admin management.
 */
export const useAdminAds = () => {
  return useQuery({
    queryKey: ADMIN_ADS_QUERY_KEY,
    queryFn: getAdminAds,
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook for fetching only active ads for public display.
 */
export const useActiveAds = () => {
  return useQuery({
    queryKey: ACTIVE_ADS_QUERY_KEY,
    queryFn: async () => {
      const data = await getAdminAds();
      return {
        ...data,
        ads: data.ads.filter(ad => ad.isActive)
      };
    },
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook for creating a new ad (Admin only).
 * Invalidates all ad queries on success.
 */
export const useCreateAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAdminAds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_ADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_ADS_QUERY_KEY });
      toast.success('Ad created successfully!');
    },
    onError: (error) => {
      console.error('Error creating ad:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create ad.');
    },
  });
};

/**
 * Hook for deleting an ad (Admin only).
 * Invalidates all ad queries on success.
 */
export const useDeleteAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAdminAdsDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_ADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_ADS_QUERY_KEY });
      toast.success('Ad deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting ad:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete ad.');
    },
  });
};