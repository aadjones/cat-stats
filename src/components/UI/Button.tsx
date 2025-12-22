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
    'font-bold font-body rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-theme-accent text-text-primary hover:bg-theme-accent-hover',
    secondary:
      'bg-glass backdrop-blur-md border border-glass-border text-text-primary hover:bg-glass-hover',
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
