import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  images: string[]
  startIndex?: number
  caption?: string
  onClose: () => void
}

const MIN_SCALE = 1
const MAX_SCALE = 5
const STEP = 0.4

export function ImageLightbox({ images, startIndex = 0, caption, onClose }: Props) {
  const [index, setIndex] = useState(startIndex)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const drag = useRef({ on: false, sx: 0, sy: 0, bx: 0, by: 0, moved: false })
  const pinch = useRef({ on: false, dist: 0, base: 1 })

  const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

  const reset = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => {
      const next = clamp(s + delta)
      if (next === 1) setOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  const goTo = useCallback(
    (next: number) => {
      if (images.length < 2) return
      setIndex((next + images.length) % images.length)
      // Reinicia el zoom al cambiar de imagen
      setScale(1)
      setOffset({ x: 0, y: 0 })
    },
    [images.length]
  )

  // Teclado + bloqueo de scroll del fondo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goTo(index + 1)
      else if (e.key === 'ArrowLeft') goTo(index - 1)
      else if (e.key === '+' || e.key === '=') zoomBy(STEP)
      else if (e.key === '-') zoomBy(-STEP)
      else if (e.key === '0') reset()
    }
    window.addEventListener('keydown', handler)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = prev
    }
  }, [index, onClose, goTo, zoomBy, reset])

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    zoomBy(e.deltaY < 0 ? STEP : -STEP)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    drag.current = {
      on: scale > 1,
      sx: e.clientX,
      sy: e.clientY,
      bx: offset.x,
      by: offset.y,
      moved: false,
    }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.on) return
    const dx = e.clientX - drag.current.sx
    const dy = e.clientY - drag.current.sy
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.current.moved = true
    setOffset({ x: drag.current.bx + dx, y: drag.current.by + dy })
  }
  const endDrag = () => {
    drag.current.on = false
  }

  const onStageClick = (e: React.MouseEvent) => {
    const clickedImage = (e.target as HTMLElement).tagName === 'IMG'
    if (!clickedImage && !drag.current.moved) onClose()
  }

  const distOf = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinch.current = { on: true, dist: distOf(e.touches), base: scale }
    } else if (e.touches.length === 1 && scale > 1) {
      drag.current = {
        on: true,
        sx: e.touches[0].clientX,
        sy: e.touches[0].clientY,
        bx: offset.x,
        by: offset.y,
        moved: false,
      }
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (pinch.current.on && e.touches.length === 2) {
      setScale(clamp(pinch.current.base * (distOf(e.touches) / pinch.current.dist)))
    } else if (drag.current.on && e.touches.length === 1) {
      setOffset({
        x: drag.current.bx + (e.touches[0].clientX - drag.current.sx),
        y: drag.current.by + (e.touches[0].clientY - drag.current.sy),
      })
    }
  }
  const onTouchEnd = () => {
    pinch.current.on = false
    drag.current.on = false
  }

  const multiple = images.length > 1
  const src = images[index]

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4">
      {/* Controles */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
        {multiple && (
          <span className="mr-1 font-sans text-sm tabular-nums text-white/80">
            {index + 1} / {images.length}
          </span>
        )}
        <button
          onClick={() => zoomBy(-STEP)}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-2xl text-white backdrop-blur transition hover:bg-white/30"
          title="Alejar (−)"
          aria-label="Alejar"
        >
          −
        </button>
        <span className="min-w-[3.5rem] text-center font-sans text-sm tabular-nums text-white/90">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => zoomBy(STEP)}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-2xl text-white backdrop-blur transition hover:bg-white/30"
          title="Acercar (+)"
          aria-label="Acercar"
        >
          +
        </button>
        <button
          onClick={reset}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-lg text-white backdrop-blur transition hover:bg-white/30"
          title="Restablecer (0)"
          aria-label="Restablecer zoom"
        >
          ⤢
        </button>
        <button
          onClick={onClose}
          className="ml-1 flex h-11 w-11 items-center justify-center rounded-lg bg-red-500 text-xl font-bold text-white shadow-lg transition hover:bg-red-600"
          title="Cerrar (Esc)"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Flechas de navegación */}
      {multiple && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-3xl text-white backdrop-blur transition hover:bg-white/30"
            title="Anterior (←)"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-3xl text-white backdrop-blur transition hover:bg-white/30"
            title="Siguiente (→)"
            aria-label="Siguiente"
          >
            ›
          </button>
        </>
      )}

      {/* Escenario de la imagen */}
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden"
        style={{ touchAction: 'none' }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onClick={onStageClick}
        onDoubleClick={() => (scale > 1 ? reset() : setScale(2.5))}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={src}
          alt={caption ?? `Imagen ${index + 1}`}
          draggable={false}
          className="max-h-[78vh] max-w-[90vw] select-none rounded-lg shadow-2xl"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: 'transform 0.08s ease-out',
            willChange: 'transform',
            cursor: scale > 1 ? 'grab' : 'zoom-in',
          }}
        />
      </div>

      {/* Pie: caption + ayuda */}
      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        {caption && <p className="font-sans text-sm text-white/85">{caption}</p>}
        <p className="font-sans text-xs text-white/50">
          {multiple ? 'Usa ← → para cambiar · ' : ''}Toca fuera de la imagen o Esc para cerrar
        </p>
      </div>
    </div>
  )
}
