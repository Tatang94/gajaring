import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Helmet } from 'react-helmet';
import { Calendar, UserPlus, Users, Edit } from 'lucide-react';
import { useUserProfile, useUserPosts } from '../helpers/useUserProfile';
import { useCurrentUser } from '../helpers/useUsers';
import { Avatar, AvatarImage, AvatarFallback } from '../components/Avatar';
import { Button } from '../components/Button';
import { PostCard } from '../components/PostCard';
import { Skeleton } from '../components/Skeleton';
import { Spinner } from '../components/Spinner';
import styles from './profile.$userId.module.css';

interface ProfilePageProps {
  userId?: string;
}

const ProfilePageSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <Skeleton style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
      <div className={styles.headerInfo}>
        <Skeleton style={{ width: '200px', height: '2rem', marginBottom: 'var(--spacing-2)' }} />
        <Skeleton style={{ width: '150px', height: '1rem' }} />
        <Skeleton style={{ width: '250px', height: '1rem', marginTop: 'var(--spacing-3)' }} />
      </div>
    </div>
    <div className={styles.stats}>
      <Skeleton style={{ width: '80px', height: '2rem' }} />
      <Skeleton style={{ width: '80px', height: '2rem' }} />
      <Skeleton style={{ width: '80px', height: '2rem' }} />
    </div>
    <div className={styles.postsGrid}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className={styles.postSkeleton}>
          <Skeleton style={{ height: '40px' }} />
          <Skeleton style={{ height: '80px', marginTop: 'var(--spacing-4)' }} />
          <Skeleton style={{ height: '40px', marginTop: 'var(--spacing-4)' }} />
        </div>
      ))}
    </div>
  </div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const router = useRouter();
  
  // Get userId from props (Next.js) or from URL params (React Router)
  const numericUserId = userId ? Number(userId) : (() => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      return Number(pathParts[pathParts.length - 1]);
    }
    return 0;
  })();
  
  const authState = useCurrentUser();

  const { data: profile, isFetching: isProfileFetching, error: profileError } = useUserProfile(numericUserId);
  const {
    data: postsPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: isPostsFetching,
    error: postsError,
  } = useUserPosts(numericUserId);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  if (isProfileFetching && !profile) {
    return <ProfilePageSkeleton />;
  }

  if (profileError) {
    return <div className={styles.error}>Error loading profile: {(profileError as Error).message}</div>;
  }

  if (!profile) {
    return <div className={styles.error}>User not found.</div>;
  }

  const isOwnProfile = authState.type === 'authenticated' && authState.user.id === numericUserId;

  return (
    <>
      <Helmet>
        <title>{`${profile.displayName}'s Profile | GAJARING`}</title>
        <meta name="description" content={profile.bio || `View the profile of ${profile.displayName} on GAJARING.`} />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <Avatar className={styles.avatar}>
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName} />
            <AvatarFallback>{profile.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className={styles.headerInfo}>
            <div className={styles.nameAndAction}>
              <h1 className={styles.displayName}>{profile.displayName}</h1>
              {isOwnProfile ? (
                <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                  <Edit size={16} /> Edit Profile
                </Button>
              ) : (
                <Button size="sm"><UserPlus size={16} /> Follow</Button>
              )}
            </div>
            {profile.username && <p className={styles.username}>@{profile.username}</p>}
            <p className={styles.bio}>{profile.bio || 'No bio yet.'}</p>
            {profile.createdAt && (
              <div className={styles.joinDate}>
                <Calendar size={14} />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </header>

        <section className={styles.stats}>
          <div className={styles.statItem}>
            <strong>{profile.postsCount}</strong>
            <span>Posts</span>
          </div>
          <div className={styles.statItem}>
            <strong>{profile.followersCount}</strong>
            <span>Followers</span>
          </div>
          <div className={styles.statItem}>
            <strong>{profile.followingCount}</strong>
            <span>Following</span>
          </div>
        </section>

        <section className={styles.postsSection}>
          <h2 className={styles.sectionTitle}>Posts</h2>
          {isPostsFetching && !postsPages ? (
            <div className={styles.postsGrid}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={styles.postSkeleton}>
                  <Skeleton style={{ height: '40px' }} />
                  <Skeleton style={{ height: '80px', marginTop: 'var(--spacing-4)' }} />
                  <Skeleton style={{ height: '40px', marginTop: 'var(--spacing-4)' }} />
                </div>
              ))}
            </div>
          ) : postsError ? (
            <div className={styles.error}>Error loading posts: {(postsError as Error).message}</div>
          ) : (
            <div className={styles.postsGrid}>
              {postsPages?.pages.map((page, i) => (
                <React.Fragment key={i}>
                  {page.posts.map((post, index) => {
                    const isLastElement = index === page.posts.length - 1 && i === postsPages.pages.length - 1;
                    return (
                      <div ref={isLastElement ? lastPostElementRef : null} key={post.id}>
                        <PostCard post={{
                          ...post,
                          isVerified: profile.isVerified,
                        }} />
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
          {isFetchingNextPage && (
            <div className={styles.loadingMore}>
              <Spinner />
              <span>Loading more posts...</span>
            </div>
          )}
          {!hasNextPage && postsPages && postsPages.pages.some(p => p.posts.length > 0) && (
            <p className={styles.endOfFeed}>You've reached the end.</p>
          )}
          {postsPages?.pages.every(p => p.posts.length === 0) && (
            <p className={styles.noPosts}>This user hasn't posted anything yet.</p>
          )}
        </section>
      </div>
    </>
  );
};

export default ProfilePage;