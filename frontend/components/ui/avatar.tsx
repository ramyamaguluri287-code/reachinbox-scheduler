import React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback = 'U',
  className,
  ...props
}) => {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 border border-emerald-200 select-none',
          sizeClasses[size],
          className
        )}
      >
        {fallback.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn('rounded-full object-cover shrink-0 border border-gray-200', sizeClasses[size], className)}
      {...props}
    />
  );
};
