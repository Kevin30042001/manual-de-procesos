interface Props {
  text: string
}

export function WarningBox({ text }: Props) {
  return (
    <div className="mt-2 flex gap-2 rounded-lg border border-warn/40 bg-warn-bg px-3 py-2">
      <span className="shrink-0 text-warn">⚠</span>
      <p className="text-sm text-warn">{text}</p>
    </div>
  )
}
