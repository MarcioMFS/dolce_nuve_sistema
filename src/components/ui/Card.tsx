import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg',
        variant === 'bordered' && 'border border-gray-200',
        className
      )}
      {...props}
    />
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  withBorder = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'p-5',
        withBorder && 'border-b border-gray-200',
        className
      )}
      {...props}
    />
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => {
  return (
    <h3
      className={twMerge('text-lg font-medium text-gray-900', className)}
      {...props}
    />
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => {
  return (
    <p
      className={twMerge('text-sm text-gray-500 mt-1', className)}
      {...props}
    />
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div className={twMerge('p-5', className)} {...props} />;
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  withBorder = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'p-5',
        withBorder && 'border-t border-gray-200',
        className
      )}
      {...props}
    />
  );
};