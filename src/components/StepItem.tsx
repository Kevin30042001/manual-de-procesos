import { useState } from 'react'
import { Step } from '../types'
import { WarningBox } from './WarningBox'
import { ImageLightbox } from './ImageLightbox'

interface Props {
  step: Step
  index: number
  isLast: boolean
}

export function StepItem({ step, index, isLast }: Props) {
  // Abre el visor en una imagen concreta; null = cerrado
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Soporta pasos viejos (image_url) y nuevos (image_urls)
  const images =
    step.image_urls?.length > 0
      ? step.image_urls
      : step.image_url
        ? [step.image_url]
        : []

  return (
    <div className="relative flex gap-5">
      {/* Timeline column */}
      <div className="relative flex flex-col items-center">
        <div className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-accent-bg shadow-sm">
          <span className="font-serif text-xl font-semibold leading-none text-accent">
            {index + 1}
          </span>
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 border-l-2 border-dashed border-border"
            style={{ minHeight: '1.5rem' }}
          />
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 pb-8 pt-1.5">
        <p className="text-[15px] leading-relaxed text-ink">{step.text}</p>

        {/* Sub-pasos */}
        {step.substeps?.length > 0 && (
          <ol className="mt-3 flex flex-col gap-1.5 border-l-2 border-accent-bg pl-4">
            {step.substeps.map((sub, i) => (
              <li key={i} className="flex gap-2 text-[14px] leading-relaxed text-ink/90">
                <span className="font-serif font-semibold text-accent">
                  {String.fromCharCode(97 + i)}.
                </span>
                <span>{sub.text}</span>
              </li>
            ))}
          </ol>
        )}

        {step.warning && <WarningBox text={step.warning} />}

        {/* Galería de capturas */}
        {images.length > 0 && (
          <>
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="group relative overflow-hidden rounded-lg border border-border shadow-sm transition-transform hover:scale-[1.02]"
                  title="Ver en grande"
                >
                  <img
                    src={url}
                    alt={`Captura ${i + 1} del paso ${index + 1}`}
                    className="h-28 w-auto max-w-[14rem] cursor-zoom-in object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    ⤢
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-1.5 font-serif text-xs italic text-muted">
              {images.length > 1
                ? `${images.length} capturas del paso ${index + 1}`
                : `Captura del paso ${index + 1}`}
            </p>

            {lightboxIndex !== null && (
              <ImageLightbox
                images={images}
                startIndex={lightboxIndex}
                caption={`Captura del paso ${index + 1}`}
                onClose={() => setLightboxIndex(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
