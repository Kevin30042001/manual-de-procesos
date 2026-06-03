interface Props {
  name: string
  color: string
  size?: 'sm' | 'md'
}

export function SystemBadge({ name, color, size = 'md' }: Props) {
  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-sans font-semibold uppercase tracking-wider ${sizeClass}`}
      style={{
        backgroundColor: color + '1f',
        color,
        border: `1px solid ${color}33`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  )
}
