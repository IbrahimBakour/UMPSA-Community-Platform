import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
  {
    variants: {
      size: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
      },
      variant: {
        primary: 'border-t-primary-600',
        secondary: 'border-t-secondary-600',
        white: 'border-gray-200 border-t-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

const LoadingOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10',
          className
        )}
        {...props}
      >
        <Spinner size="lg" />
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('animate-pulse bg-gray-200 rounded', className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

const SkeletonText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        className={cn('h-4 w-full', className)}
        {...props}
      />
    );
  }
);

SkeletonText.displayName = 'SkeletonText';

const SkeletonTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        className={cn('h-6 w-3/4', className)}
        {...props}
      />
    );
  }
);

SkeletonTitle.displayName = 'SkeletonTitle';

const SkeletonAvatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        className={cn('rounded-full w-10 h-10', className)}
        {...props}
      />
    );
  }
);

SkeletonAvatar.displayName = 'SkeletonAvatar';

const LoadingPage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen flex items-center justify-center bg-gray-50',
          className
        )}
        {...props}
      >
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
);

LoadingPage.displayName = 'LoadingPage';

export {
  Spinner,
  LoadingOverlay,
  Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonAvatar,
  LoadingPage,
};
