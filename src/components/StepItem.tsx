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
  const [lightbox, setLightbox] = useState(false)

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
        {step.warning && <WarningBox text={step.warning} />}
        {step.image_url && (
          <>
            <button
              onClick={() => setLightbox(true)}
              className="mt-4 block text-left transition-transform hover:scale-[1.01]"
            >
              <img
                src={step.image_url}
                alt={`Captura del paso ${index + 1}`}
                className="max-w-sm cursor-zoom-in rounded-lg border border-border shadow-sm"
              />
              <p className="mt-1.5 font-serif text-xs italic text-muted">
                Captura del paso {index + 1}
              </p>
            </button>
            {lightbox && (
              <ImageLightbox
                src={step.image_url}
                caption={`Captura del paso ${index + 1}`}
                onClose={() => setLightbox(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
