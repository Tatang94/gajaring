"use client";

import React, { useState } from 'react';
import { Search as SearchIcon, User, Hash, FileText } from 'lucide-react';
import { Input } from '../components/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { UserProfile } from '../components/UserProfile';
import { PostCard } from '../components/PostCard';
import { Skeleton } from '../components/Skeleton';
import { useSearchUsers } from '../helpers/useUsers';
import styles from './search.module.css';

const SearchSkeleton = () => (
  <div className={styles.resultsList}>
    <div className={styles.skeletonUser}>
      <Skeleton style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-full)' }} />
      <div className={styles.skeletonUserInfo}>
        <Skeleton style={{ width: '120px', height: '1.2rem' }} />
        <Skeleton style={{ width: '80px', height: '1rem', marginTop: 'var(--spacing-1)' }} />
      </div>
      <Skeleton style={{ width: '80px', height: '2rem', marginLeft: 'auto' }} />
    </div>
    <div className={styles.skeletonUser}>
      <Skeleton style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-full)' }} />
      <div className={styles.skeletonUserInfo}>
        <Skeleton style={{ width: '140px', height: '1.2rem' }} />
        <Skeleton style={{ width: '90px', height: '1rem', marginTop: 'var(--spacing-1)' }} />
      </div>
      <Skeleton style={{ width: '80px', height: '2rem', marginLeft: 'auto' }} />
    </div>
  </div>
);


export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: searchResults, isFetching, error } = useSearchUsers(searchTerm);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Discover</h1>
        <div className={styles.searchBar}>
          <SearchIcon size={20} className={styles.searchIcon} />
          <Input
            type="search"
            placeholder="Search for users, posts, tags..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </header>

      {searchTerm ? (
        <Tabs defaultValue="users" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="users"><User size={16} /> Users</TabsTrigger>
            <TabsTrigger value="posts"><FileText size={16} /> Posts</TabsTrigger>
            <TabsTrigger value="tags"><Hash size={16} /> Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className={styles.tabContent}>
            {isFetching ? (
              <SearchSkeleton />
            ) : error ? (
              <div className={styles.errorState}>
                <p>Failed to search users. Please try again.</p>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className={styles.resultsList}>
                {searchResults.map(user => (
                  <UserProfile 
                    key={user.id} 
                    user={{
                      id: user.id,
                      displayName: user.displayName,
                      username: user.username,
                      avatarUrl: user.avatarUrl,
                      isVerified: user.isVerified,
                    }} 
                  />
                ))}
              </div>
            ) : searchTerm ? (
              <div className={styles.emptyState}>
                <User size={48} className={styles.placeholderIcon} />
                <p>No users found for "{searchTerm}"</p>
              </div>
            ) : null}
          </TabsContent>
          
          <TabsContent value="posts" className={styles.tabContent}>
            <div className={styles.placeholder}>
              <FileText size={48} className={styles.placeholderIcon} />
              <p>Post search coming soon!</p>
            </div>
          </TabsContent>

          <TabsContent value="tags" className={styles.tabContent}>
            <div className={styles.placeholder}>
              <Hash size={48} className={styles.placeholderIcon} />
              <p>Search results for tags will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className={styles.placeholder}>
          <SearchIcon size={48} className={styles.placeholderIcon} />
          <p>Find your friends or discover new content.</p>
        </div>
      )}
    </div>
  );
}