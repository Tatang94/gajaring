import React from 'react';
import { Ad } from '../helpers/useAds';
import { useDeleteAd } from '../helpers/useAds';
import { Button } from './Button';
import { Badge } from './Badge';
import { Trash2, Eye, EyeOff, Code } from 'lucide-react';
import styles from './AdminAdCard.module.css';

interface AdminAdCardProps {
  ad: Ad;
  className?: string;
}

export const AdminAdCard: React.FC<AdminAdCardProps> = ({ ad, className }) => {
  const deleteAdMutation = useDeleteAd();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the ad "${ad.title}"?`)) {
      deleteAdMutation.mutate({ adId: ad.id });
    }
  };

  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{ad.title}</h3>
        <Badge variant={ad.type === 'script' ? 'secondary' : 'default'}>
          {ad.type}
        </Badge>
      </div>

      <div className={styles.content}>
        <div className={styles.status}>
          {ad.isActive ? (
            <span className={styles.active}><Eye size={14} /> Active</span>
          ) : (
            <span className={styles.inactive}><EyeOff size={14} /> Inactive</span>
          )}
        </div>
        {ad.type === 'promotional' && ad.imageUrl && (
          <div className={styles.preview}>
            <img src={ad.imageUrl} alt="Ad preview" className={styles.image} />
          </div>
        )}
        {ad.type === 'script' && (
           <div className={styles.scriptPreview}>
            <Code size={16} />
            <span>Script Ad</span>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleteAdMutation.isPending}
        >
          <Trash2 size={14} />
          {deleteAdMutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  );
};