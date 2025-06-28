"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { VerifiedBadge } from './VerifiedBadge';
import { useTimeAgo } from '../helpers/useTimeAgo';
import { useLikePost, useCreateComment, useSharePost } from '../helpers/usePosts';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: {
    id: number;
    content: string;
    imageUrl?: string | null;
    createdAt: string | number | Date;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    userId: number;
    userDisplayName: string;
    userAvatarUrl?: string | null;
    isVerified?: boolean | null;
  };
  className?: string;
}

export const PostCard: React.FC<PostCardProps> = ({ post, className }) => {
  const timeAgo = useTimeAgo(post.createdAt);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const likeMutation = useLikePost();
  const commentMutation = useCreateComment();
  const shareMutation = useSharePost();

  const handleLike = () => {
    likeMutation.mutate({ postId: post.id });
  };

  const handleComment = () => {
    if (showCommentInput && commentText.trim()) {
      commentMutation.mutate(
        { postId: post.id, content: commentText },
        {
          onSuccess: () => {
            setCommentText('');
            setShowCommentInput(false);
          },
        }
      );
    } else {
      setShowCommentInput(!showCommentInput);
    }
  };

  const handleShare = () => {
    shareMutation.mutate({ postId: post.id });
  };

  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <Link to={`/profile/${post.userId}`} className={styles.avatarLink}>
          <Avatar className={styles.avatar}>
            {post.userAvatarUrl ? (
              <AvatarImage src={post.userAvatarUrl} alt={post.userDisplayName} />
            ) : (
              <AvatarFallback>{post.userDisplayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
        </Link>
        
        <div className={styles.userInfo}>
          <div className={styles.userNameContainer}>
            <Link to={`/profile/${post.userId}`} className={styles.userNameLink}>
              <h3 className={styles.userName}>{post.userDisplayName}</h3>
            </Link>
            <VerifiedBadge isVerified={post.isVerified} />
          </div>
          <span className={styles.timeAgo}>{timeAgo}</span>
        </div>
      </div>
      
      <div className={styles.content}>
        <p className={styles.text}>{post.content}</p>
        {post.imageUrl && (
          <div className={styles.imageContainer}>
            <img src={post.imageUrl} alt="Post content" className={styles.image} />
          </div>
        )}
      </div>
      
      <div className={styles.actions}>
        <Button 
          variant="ghost" 
          size="sm" 
          className={styles.actionButton}
          onClick={handleLike}
          disabled={likeMutation.isPending}
        >
          {likeMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Heart size={18} className={styles.actionIcon} />
          )}
          <span>{post.likesCount}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={styles.actionButton}
          onClick={handleComment}
          disabled={commentMutation.isPending}
        >
          {commentMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <MessageCircle size={18} className={styles.actionIcon} />
          )}
          <span>{post.commentsCount}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={styles.actionButton}
          onClick={handleShare}
          disabled={shareMutation.isPending}
        >
          {shareMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Share2 size={18} className={styles.actionIcon} />
          )}
          <span>{post.sharesCount}</span>
        </Button>
      </div>

      {showCommentInput && (
        <div className={styles.commentInput}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className={styles.commentTextarea}
            rows={2}
          />
          <div className={styles.commentActions}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCommentInput(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleComment}
              disabled={!commentText.trim() || commentMutation.isPending}
            >
              {commentMutation.isPending ? <Spinner size="sm" /> : 'Comment'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};