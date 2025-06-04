import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon,
      rightIcon,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              'border py-2 px-3',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';