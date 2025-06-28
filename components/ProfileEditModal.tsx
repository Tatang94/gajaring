import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './Dialog';
import { EditProfileForm } from './EditProfileForm';
import { postUsersProfileUpdate, InputType } from '../endpoints/users/profile/update_POST.schema';
import { AUTH_QUERY_KEY, useAuth } from '../helpers/useAuth';
import { User } from '../helpers/User';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User & { bio?: string | null };
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, user }) => {
  const queryClient = useQueryClient();
  const { onLogin } = useAuth();

  const mutation = useMutation({
    mutationFn: (values: InputType) => postUsersProfileUpdate(values),
    onSuccess: (data) => {
      if ('user' in data) {
        toast.success('Profile updated successfully!');
        
        // Optimistically update the auth context
        onLogin(data.user);

        // Invalidate queries that depend on user data
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        // Example of invalidating a user profile query
        // queryClient.invalidateQueries({ queryKey: ['userProfile', user.id] });
        
        onClose();
      } else {
        toast.error(data.error || 'An unknown error occurred.');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile.');
    },
  });

  const handleSubmit = (values: InputType) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditProfileForm
          initialValues={{
            displayName: user.displayName,
            bio: user.bio ?? '',
            avatarUrl: user.avatarUrl ?? '',
          }}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};