interface Props {
  name: string
  color: string
  size?: 'sm' | 'md'
}

export function SystemBadge({ name, color, size = 'md' }: Props) {
  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center rounded-full font-sans font-medium ${sizeClass}`}
      style={{ backgroundColor: color + '22', color }}
    >
      {name}
    </span>
  )
}
