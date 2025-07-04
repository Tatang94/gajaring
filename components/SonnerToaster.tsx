"use client";

import { Toaster as Sonner } from "sonner";
import styles from "./SonnerToaster.module.css";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * This is already included in the global context providers so should not be rendered again.
 */
export const SonnerToaster = ({ className, ...props }: ToasterProps) => {
  return (
    <Sonner
      className={`${styles.toaster} ${className ?? ""}`}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: styles.toast,
          content: styles.content,
          title: styles.title,
          actionButton: styles.actionButton,
          cancelButton: styles.cancelButton,
          closeButton: styles.closeButton,
          description: styles.description,
          icon: styles.icon,
        },
      }}
      {...props}
    />
  );
};
