import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Trash2, User, ShieldCheck } from 'lucide-react';
import { useAdminUsers, useAdminPosts, useDeletePost, useUpdateUserRole } from '../helpers/useAdmin';
import { AdminMenu } from '../components/AdminMenu';
import { AdminAdList } from '../components/AdminAdList';
import { AdminAdCreateForm } from '../components/AdminAdCreateForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Skeleton } from '../components/Skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '../components/Avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/Select';
import styles from './admin.module.css';
import { AdminUserView } from '../endpoints/admin/users_GET.schema';
import { PostType } from '../endpoints/posts_GET.schema';

const UserListSkeleton = () => (
  <div className={styles.list}>
    {[...Array(10)].map((_, i) => (
      <div key={i} className={styles.listItem}>
        <div className={styles.itemMain}>
          <Skeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div className={styles.itemInfo}>
            <Skeleton style={{ width: '150px', height: '1.2rem' }} />
            <Skeleton style={{ width: '200px', height: '0.8rem' }} />
          </div>
        </div>
        <Skeleton style={{ width: '100px', height: '2rem' }} />
      </div>
    ))}
  </div>
);

const PostListSkeleton = () => (
  <div className={styles.list}>
    {[...Array(5)].map((_, i) => (
      <div key={i} className={styles.listItem}>
        <div className={styles.itemMain}>
          <Skeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div className={styles.itemInfo}>
            <Skeleton style={{ width: '120px', height: '1rem' }} />
            <Skeleton style={{ width: '300px', height: '1.5rem', marginTop: 'var(--spacing-1)' }} />
          </div>
        </div>
        <Skeleton style={{ width: '40px', height: '2rem' }} />
      </div>
    ))}
  </div>
);

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  const {
    data: usersPages,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasNextUsersPage,
    isFetching: isUsersFetching,
    isFetchingNextPage: isFetchingNextUsers,
    error: usersError,
  } = useAdminUsers();

  const {
    data: postsPages,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPostsPage,
    isFetching: isPostsFetching,
    isFetchingNextPage: isFetchingNextPosts,
    error: postsError,
  } = useAdminPosts();

  const deletePostMutation = useDeletePost();
  const updateUserRoleMutation = useUpdateUserRole();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (activeTab === 'users' && isFetchingNextUsers) return;
      if (activeTab === 'posts' && isFetchingNextPosts) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (activeTab === 'users' && hasNextUsersPage) {
            fetchNextUsers();
          } else if (activeTab === 'posts' && hasNextPostsPage) {
            fetchNextPosts();
          }
        }
      });
      if (node) observer.current.observe(node);
    },
    [
      activeTab,
      isFetchingNextUsers,
      hasNextUsersPage,
      fetchNextUsers,
      isFetchingNextPosts,
      hasNextPostsPage,
      fetchNextPosts,
    ]
  );

  const handleRoleChange = (userId: number, role: 'admin' | 'user') => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | GAJARING</title>
      </Helmet>
      <div className={styles.container}>
        <AdminMenu />
        <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="posts">Manage Posts</TabsTrigger>
            <TabsTrigger value="ads">Iklan</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className={styles.content}>
            {isUsersFetching && !usersPages ? (
              <UserListSkeleton />
            ) : usersError ? (
              <div className={styles.error}>Error loading users: {(usersError as Error).message}</div>
            ) : (
              <div className={styles.list}>
                {usersPages?.pages.map((page, i) => (
                  <React.Fragment key={i}>
                    {page.users.map((user: AdminUserView, index: number) => {
                      const isLastElement = index === page.users.length - 1 && i === usersPages.pages.length - 1;
                      return (
                        <div ref={isLastElement ? lastElementRef : null} key={user.id} className={styles.listItem}>
                          <div className={styles.itemMain}>
                            <Avatar className={styles.avatar}>
                              <AvatarImage src={user.avatarUrl || undefined} />
                              <AvatarFallback>{user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className={styles.itemInfo}>
                              <Link to={`/profile/${user.id}`} className={styles.name}>{user.displayName}</Link>
                              <span className={styles.email}>{user.email}</span>
                            </div>
                          </div>
                          <div className={styles.actions}>
                            <Select
                              defaultValue={user.role || 'user'}
                              onValueChange={(value: 'admin' | 'user') => handleRoleChange(user.id, value)}
                              disabled={updateUserRoleMutation.isPending}
                            >
                              <SelectTrigger className={styles.roleSelect}>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user"><User size={14} className={styles.roleIcon} /> User</SelectItem>
                                <SelectItem value="admin"><ShieldCheck size={14} className={styles.roleIcon} /> Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
                {isFetchingNextUsers && <div className={styles.loadingMore}><Spinner /></div>}
              </div>
            )}
          </TabsContent>
          <TabsContent value="posts" className={styles.content}>
            {isPostsFetching && !postsPages ? (
              <PostListSkeleton />
            ) : postsError ? (
              <div className={styles.error}>Error loading posts: {(postsError as Error).message}</div>
            ) : (
              <div className={styles.list}>
                {postsPages?.pages.map((page, i) => (
                  <React.Fragment key={i}>
                    {page.posts.map((post: PostType, index: number) => {
                      const isLastElement = index === page.posts.length - 1 && i === postsPages.pages.length - 1;
                      return (
                        <div ref={isLastElement ? lastElementRef : null} key={post.id} className={styles.listItem}>
                          <div className={styles.itemMain}>
                            <Avatar className={styles.avatar}>
                              <AvatarImage src={post.userAvatarUrl || undefined} />
                              <AvatarFallback>{post.userDisplayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className={styles.itemInfo}>
                              <Link to={`/profile/${post.userId}`} className={styles.name}>{post.userDisplayName}</Link>
                              <p className={styles.postContent}>{post.content}</p>
                            </div>
                          </div>
                          <div className={styles.actions}>
                            <Button
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => deletePostMutation.mutate({ postId: post.id })}
                              disabled={deletePostMutation.isPending && deletePostMutation.variables?.postId === post.id}
                            >
                              {deletePostMutation.isPending && deletePostMutation.variables?.postId === post.id ? <Spinner size="sm" /> : <Trash2 size={16} />}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
                {isFetchingNextPosts && <div className={styles.loadingMore}><Spinner /></div>}
              </div>
            )}
          </TabsContent>
          <TabsContent value="ads" className={styles.content}>
            <div className={styles.adManagement}>
              <div className={styles.adHeader}>
                <h2>Ad Management</h2>
              </div>

              <AdminAdCreateForm />
              <AdminAdList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminPage;