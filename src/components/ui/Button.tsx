import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center font-sans font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
  }
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent/90',
    secondary:
      'bg-surface border border-border text-ink hover:bg-accent-bg',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-muted hover:text-ink hover:bg-surface',
  }
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
