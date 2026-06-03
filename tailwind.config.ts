import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:         'var(--color-bg)',
        surface:    'var(--color-surface)',
        ink:        'var(--color-ink)',
        muted:      'var(--color-muted)',
        border:     'var(--color-border)',
        accent:     'var(--color-accent)',
        'accent-bg':'var(--color-accent-bg)',
        warn:       'var(--color-warn)',
        'warn-bg':  'var(--color-warn-bg)',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans:  ['Karla', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
