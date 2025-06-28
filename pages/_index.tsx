"use client";

import React, { useEffect } from 'react';
import { PostCard } from '../components/PostCard';
import { AdCard } from '../components/AdCard';
import { CreatePost } from '../components/CreatePost';
import { Skeleton } from '../components/Skeleton';
import { useInfinitePosts } from '../helpers/usePosts';
import { useActiveAds } from '../helpers/useAds';
import styles from './_index.module.css';

const PostSkeleton = () => (
  <div className={styles.postSkeleton}>
    <div className={styles.skeletonHeader}>
      <Skeleton style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-full)' }} />
      <div className={styles.skeletonUserInfo}>
        <Skeleton style={{ width: '120px', height: '1.2rem' }} />
        <Skeleton style={{ width: '80px', height: '1rem', marginTop: 'var(--spacing-1)' }} />
      </div>
    </div>
    <Skeleton style={{ width: '100%', height: '4rem', marginTop: 'var(--spacing-3)' }} />
    <Skeleton style={{ width: '100%', height: '200px', marginTop: 'var(--spacing-3)' }} />
    <div className={styles.skeletonActions}>
      <Skeleton style={{ width: '60px', height: '2rem' }} />
      <Skeleton style={{ width: '60px', height: '2rem' }} />
      <Skeleton style={{ width: '60px', height: '2rem' }} />
    </div>
  </div>
);

export default function HomePage() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfinitePosts();

  const { data: adsData, error: adsError } = useActiveAds();
  const promotionalAds = adsData?.ads.filter(ad => ad.type === 'promotional') ?? [];

// Define discriminated union type for mixed feed items
  type MixedFeedItem = 
    | { type: 'post'; data: any; key: string }
    | { type: 'ad'; data: any; key: string };

  // Function to mix posts with promotional ads
  const mixPostsWithAds = (posts: any[]): MixedFeedItem[] => {
    // Return posts only if no promotional ads available
    if (promotionalAds.length === 0) {
      return posts.map(post => ({
        type: 'post' as const,
        data: post,
        key: `post-${post.id}`
      }));
    }
    
    const mixedContent: MixedFeedItem[] = [];
    let adIndex = 0;
    
    posts.forEach((post, index) => {
      // Add the post
      mixedContent.push({
        type: 'post' as const,
        data: post,
        key: `post-${post.id}`
      });
      
      // Add an ad every 4 posts (after posts at index 3, 7, 11, etc.)
      // Safe ad cycling with proper bounds checking
      if ((index + 1) % 4 === 0 && promotionalAds.length > 0) {
        const selectedAd = promotionalAds[adIndex % promotionalAds.length];
        if (selectedAd) {
          mixedContent.push({
            type: 'ad' as const,
            data: selectedAd,
            key: `ad-${selectedAd.id}-${index}`
          });
          adIndex++;
        }
      }
    });
    
    return mixedContent;
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === 'error') {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>GAJARING</h1>
        </header>
        <div className={styles.errorState}>
          <p>Failed to load posts. Please try again later.</p>
          <p className={styles.errorMessage}>{error?.message}</p>
          {adsError && (
            <p className={styles.errorMessage}>Also failed to load ads: {adsError.message}</p>
          )}
        </div>
      </div>
    );
  }

  const posts = data?.pages.flatMap(page => page.posts) ?? [];
  const mixedContent = mixPostsWithAds(posts);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>GAJARING</h1>
      </header>
      
      <div className={styles.feed}>
        <CreatePost />
        
        {status === 'pending' ? (
          // Show loading skeletons
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          <>
            {mixedContent.map(item => {
              if (item.type === 'post') {
                return <PostCard key={item.key} post={item.data} />;
              } else if (item.type === 'ad' && item.data) {
                return <AdCard key={item.key} ad={item.data} />;
              }
              return null;
            })}
            
            {isFetchingNextPage && (
              <>
                <PostSkeleton />
                <PostSkeleton />
              </>
            )}
            
            {!hasNextPage && posts.length > 0 && (
              <div className={styles.endMessage}>
                <p>You've reached the end of your feed!</p>
              </div>
            )}
            
            {posts.length === 0 && !isFetching && (
              <div className={styles.emptyState}>
                <p>No posts yet. Be the first to share something!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}