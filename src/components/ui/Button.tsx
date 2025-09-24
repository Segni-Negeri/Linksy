import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', style, ...props }: Props) {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid transparent',
    fontWeight: 600,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#111827', color: '#ffffff' },
    secondary: { background: '#e5e7eb', color: '#111827' },
  };
  return <button {...props} style={{ ...base, ...(variants[variant] || {}), ...(style || {}) }} />;
}


