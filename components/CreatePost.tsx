"use client";

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, AtSign, Smile, Send, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { useCreatePost } from '../helpers/usePosts';
import { useAuth } from '../helpers/useAuth';
import styles from './CreatePost.module.css';

interface CreatePostProps {
  className?: string;
}

export const CreatePost: React.FC<CreatePostProps> = ({ className }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { authState } = useAuth();
  const createPostMutation = useCreatePost();

  const handlePost = () => {
    if (content.trim()) {
      createPostMutation.mutate(
        { content, imageUrl },
        {
          onSuccess: () => {
            setContent('');
            setImageUrl(null);
          },
        }
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a file storage service
      // For now, we'll create a local URL for demo purposes
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (authState.type !== 'authenticated') {
    return null;
  }

  const { user } = authState;

  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.inputArea}>
        <Avatar className={styles.avatar}>
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
          ) : (
            <AvatarFallback>{user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <div className={styles.inputContainer}>
          <textarea
            className={styles.textarea}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            disabled={createPostMutation.isPending}
          />
          {imageUrl && (
            <div className={styles.imagePreview}>
              <img src={imageUrl} alt="Upload preview" className={styles.previewImage} />
              <Button
                variant="ghost"
                size="icon-sm"
                className={styles.removeImageButton}
                onClick={removeImage}
              >
                <X size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.actionButtons}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={createPostMutation.isPending}
          >
            <ImageIcon size={18} />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={createPostMutation.isPending}>
            <AtSign size={18} />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={createPostMutation.isPending}>
            <Smile size={18} />
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={handlePost} 
          disabled={!content.trim() || createPostMutation.isPending}
        >
          {createPostMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Send size={16} />
              Post
            </>
          )}
        </Button>
      </div>
    </div>
  );
};