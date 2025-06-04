import React from 'react';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  success: 'bg-success-100 text-success-800',
  warning: 'bg-warning-100 text-warning-800',
  error: 'bg-error-100 text-error-800',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className,
  ...props
}) => {
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};