
import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  src: string
  caption: string
  onClose: () => void
}

const MIN_SCALE = 1
const MAX_SCALE = 5
const STEP = 0.4

export function ImageLightbox({ src, caption, onClose }: Props) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const drag = useRef({ on: false, sx: 0, sy: 0, bx: 0, by: 0 })
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

  // Teclado + bloqueo de scroll del fondo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
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
  }, [onClose, zoomBy, reset])

  // Rueda del mouse -> zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    zoomBy(e.deltaY < 0 ? STEP : -STEP)
  }

  // Arrastrar para desplazar (solo con zoom)
  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, bx: offset.x, by: offset.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.on) return
    setOffset({
      x: drag.current.bx + (e.clientX - drag.current.sx),
      y: drag.current.by + (e.clientY - drag.current.sy),
    })
  }
  const endDrag = () => {
    drag.current.on = false
  }

  // Táctil: pinch-zoom + arrastre
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/90 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Controles */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          onClick={() => zoomBy(-STEP)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface/15 text-xl text-surface transition hover:bg-surface/25"
          title="Alejar (−)"
          aria-label="Alejar"
        >
          −
        </button>
        <span className="min-w-[3.5rem] text-center font-sans text-sm tabular-nums text-surface/90">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => zoomBy(STEP)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface/15 text-xl text-surface transition hover:bg-surface/25"
          title="Acercar (+)"
          aria-label="Acercar"
        >
          +
        </button>
        <button
          onClick={reset}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface/15 text-lg text-surface transition hover:bg-surface/25"
          title="Restablecer (0)"
          aria-label="Restablecer zoom"
        >
          ⤢
        </button>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-warn/80 text-lg text-surface transition hover:bg-warn"
          title="Cerrar (Esc)"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Escenario de la imagen */}
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden"
        style={{ touchAction: 'none' }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onDoubleClick={() => (scale > 1 ? reset() : setScale(2.5))}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={src}
          alt={caption}
          draggable={false}
          className="max-h-[82vh] max-w-[90vw] rounded-lg shadow-xl select-none"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: 'transform 0.08s ease-out',
            willChange: 'transform',
            cursor: scale > 1 ? 'grab' : 'zoom-in',
          }}
        />
      </div>

      {caption && <p className="mt-3 font-sans text-sm text-surface/80">{caption}</p>}
    </div>
  )
}
