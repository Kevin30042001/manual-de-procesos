interface Props {
  text: string
}

export function WarningBox({ text }: Props) {
  return (
    <div className="mt-3 flex items-start gap-3 rounded-xl border-l-4 border-warn bg-warn-bg px-4 py-3 shadow-sm">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 h-5 w-5 shrink-0 text-warn"
        aria-hidden
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-warn">
          Atención
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-warn/90">{text}</p>
      </div>
    </div>
  )
}
