"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { ProfileEditModal } from './ProfileEditModal';
import { VerifiedBadge } from './VerifiedBadge';
import { useFollowUser, useUnfollowUser, useCurrentUser } from '../helpers/useUsers';
import styles from './UserProfile.module.css';

interface UserProfileProps {
  user: {
    id: number;
    displayName: string;
    username?: string | null;
    avatarUrl?: string | null;
    isFollowing?: boolean;
    bio?: string | null;
    isVerified?: boolean | null;
  };
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, className }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const currentUser = useCurrentUser();

  const isFollowing = user.isFollowing || false;
  const isLoading = followMutation.isPending || unfollowMutation.isPending;
  const isCurrentUser = currentUser.type === 'authenticated' && currentUser.user.id === user.id;

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate({ userIdToUnfollow: user.id });
    } else {
      followMutation.mutate({ userIdToFollow: user.id });
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Link to={`/profile/${user.id}`} className={styles.profileLink}>
        <Avatar className={styles.avatar}>
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
          ) : (
            <AvatarFallback>{user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <div className={styles.userInfo}>
          <div className={styles.nameContainer}>
            <span className={styles.name}>{user.displayName}</span>
            <VerifiedBadge isVerified={user.isVerified} />
          </div>
          {user.username && <span className={styles.username}>@{user.username}</span>}
        </div>
      </Link>
      {isCurrentUser ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditProfile}
          className={styles.editButton}
        >
          <Edit size={16} />
          Edit Profile
        </Button>
      ) : (
        <Button
          variant={isFollowing ? 'outline' : 'primary'}
          size="sm"
          onClick={handleFollowToggle}
          className={styles.followButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            isFollowing ? 'Following' : 'Follow'
          )}
        </Button>
      )}
      
      {isEditModalOpen && isCurrentUser && currentUser.type === 'authenticated' && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={{
            ...currentUser.user,
            bio: user.bio,
          }}
        />
      )}
    </div>
  );
};