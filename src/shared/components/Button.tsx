import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) => {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
        ? 'btn-secondary'
        : 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-gold-300 hover:text-gold-100 hover:bg-ink-500/50 transition';

  return (
    <button {...rest} className={`${variantClass} ${className}`}>
      {icon}
      <span>{children}</span>
    </button>
  );
};
