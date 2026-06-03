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
    'inline-flex items-center justify-center font-sans font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
  }
  const variants = {
    primary:
      'bg-accent text-white shadow-sm hover:bg-accent/90 hover:-translate-y-0.5 hover:shadow-md',
    secondary:
      'bg-surface border border-border text-ink shadow-sm hover:bg-accent-bg hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-md',
    danger:
      'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-md',
    ghost: 'text-muted hover:text-ink hover:bg-surface',
  }
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
