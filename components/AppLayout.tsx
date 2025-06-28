"use client";

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Bell, LogOut, Settings, Shield } from 'lucide-react';
import styles from './AppLayout.module.css';
import { Button } from './Button';
import { useNotifications } from '../helpers/useNotifications';
import { useAuth } from '../helpers/useAuth';
import { Badge } from './Badge';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './DropdownMenu';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: notifications, isFetching } = useNotifications();
  const { authState, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (user: any) => {
    if (!user?.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <main className={styles.content}>
        {children}
      </main>
      
      <nav className={styles.navigation}>
        <Button 
          variant={isActive('/') ? 'primary' : 'ghost'} 
          size="icon-md" 
          onClick={() => navigate('/')}
          className={styles.navButton}
        >
          <Home size={24} />
        </Button>
        
        <Button 
          variant={isActive('/search') ? 'primary' : 'ghost'} 
          size="icon-md" 
          onClick={() => navigate('/search')}
          className={styles.navButton}
        >
          <Search size={24} />
        </Button>
        
        <div className={styles.notificationContainer}>
          <Button 
            variant={isActive('/notifications') ? 'primary' : 'ghost'} 
            size="icon-md" 
            onClick={() => navigate('/notifications')}
            className={styles.navButton}
          >
            <Bell size={24} />
          </Button>
          {unreadCount > 0 && (
            <Badge variant="destructive" className={styles.notificationBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
        
        {authState.type === 'authenticated' ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={`${styles.navButton} ${styles.avatarButton} ${isActive('/profile') ? styles.activeAvatar : ''}`}>
                <Avatar>
                  <AvatarImage 
                    src={authState.user.avatarUrl || ''} 
                    alt={authState.user.displayName || 'User'} 
                  />
                  <AvatarFallback>
                    {getUserInitials(authState.user)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuLabel>
                {authState.user.displayName || 'User'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/settings')}>
                <Settings size={16} style={{ marginRight: 8 }} />
                Settings
              </DropdownMenuItem>
              {authState.user.role === 'admin' && (
                <DropdownMenuItem onSelect={() => navigate('/admin')}>
                  <Shield size={16} style={{ marginRight: 8 }} />
                  Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut size={16} style={{ marginRight: 8 }} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="ghost" 
            size="icon-md" 
            onClick={() => navigate('/login')}
            className={styles.navButton}
          >
            <LogOut size={24} />
          </Button>
        )}
      </nav>
    </div>
  );
};