import { useEffect } from 'react'

interface Props {
  src: string
  caption: string
  onClose: () => void
}

export function ImageLightbox({ src, caption, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/80 p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt={caption}
        className="max-h-[80vh] max-w-full rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="mt-3 text-sm text-surface/80">{caption}</p>
    </div>
  )
}
