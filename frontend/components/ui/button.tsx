import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      default: 'bg-black text-white hover:bg-neutral-800 rounded-lg shadow-sm',
      primary: 'bg-[#00A859] text-white hover:bg-[#00924d] active:bg-[#007f43] rounded-lg shadow-sm',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-lg',
      outline: 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg',
      ghost: 'hover:bg-gray-100 text-gray-700 rounded-lg',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 rounded-lg',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-xs',
      lg: 'h-11 px-6 text-sm',
      icon: 'h-8 w-8 p-1.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
