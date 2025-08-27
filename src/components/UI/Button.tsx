import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700',
    secondary:
      'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs min-h-[44px] sm:min-h-0 sm:py-1', // Touch-friendly on mobile
    md: 'px-4 sm:px-6 py-3 sm:py-2 text-sm min-h-[44px] sm:min-h-0',
    lg: 'px-4 sm:px-6 py-4 sm:py-3 text-base min-h-[44px] sm:min-h-0',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
