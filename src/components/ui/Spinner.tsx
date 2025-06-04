import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={twMerge(
          'animate-spin rounded-full border-t-transparent border-primary-500 border-4',
          sizeMap[size],
          className
        )}
      />
    </div>
  );
};