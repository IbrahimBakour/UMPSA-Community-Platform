import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'w-full px-3 py-2 border border-surface-300 rounded-lg text-sm placeholder-surface-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-white hover:border-primary-300',
        filled: 'bg-surface-50 border-surface-200 hover:border-primary-300',
        error: 'border-state-error focus:ring-state-error focus:border-state-error',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  help?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, help, leftIcon, rightIcon, ...props }, ref) => {
    const inputId = React.useId();
    const errorId = React.useId();
    const helpId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-surface-400">{leftIcon}</span>
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              inputVariants({ variant: error ? 'error' : variant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-describedby={error ? errorId : help ? helpId : undefined}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-surface-400">{rightIcon}</span>
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-sm text-state-error mt-1">
            {error}
          </p>
        )}
        {help && !error && (
          <p id={helpId} className="text-sm text-surface-500 mt-1">
            {help}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
