import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';
import styles from './VerifiedBadge.module.css';

interface VerifiedBadgeProps {
  /**
   * If true, the badge will be rendered.
   */
  isVerified?: boolean | null;
  /**
   * Optional class name for custom styling.
   */
  className?: string;
  /**
   * The size of the icon.
   * @default 16
   */
  size?: number;
}

/**
 * A component that displays a "verified" checkmark badge.
 * It includes a tooltip explaining its meaning.
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  isVerified,
  className,
  size = 16,
}) => {
  if (!isVerified) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`${styles.badgeContainer} ${className || ''}`}>
          <BadgeCheck
            size={size}
            className={styles.icon}
            aria-label="Verified Account"
          />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Verified Account</p>
      </TooltipContent>
    </Tooltip>
  );
};