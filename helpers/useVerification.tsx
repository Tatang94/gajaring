import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postUsersVerify } from '../endpoints/users/verify_POST.schema';
import { AUTH_QUERY_KEY } from './useAuth';
import { USERS_QUERY_KEY } from './useUsers';

/**
 * Hook for an admin to verify or unverify a user.
 *
 * This mutation is intended for administrative purposes to manually set a user's
 * verification status. It invalidates user-related queries to ensure the UI
 * reflects the change.
 */
export const useVerifyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUsersVerify,
    onSuccess: (_, variables) => {
      console.log(`Successfully updated verification status for user ${variables.userId}.`);
      // Invalidate all queries related to users to refresh their verification status
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      // Invalidate the specific user's profile data if it's cached separately
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, 'profile', variables.userId] });
      // Invalidate auth session if the modified user is the current user
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
    },
    onError: (error, variables) => {
      console.error(`Error updating verification status for user ${variables.userId}:`, error);
      // Optionally, you could show a toast notification to the admin here.
    },
  });
};