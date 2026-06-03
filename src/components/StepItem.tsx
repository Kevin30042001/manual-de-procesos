import { useState } from 'react'
import { Step } from '../types'
import { WarningBox } from './WarningBox'
import { ImageLightbox } from './ImageLightbox'

interface Props {
  step: Step
  index: number
}

export function StepItem({ step, index }: Props) {
  const [lightbox, setLightbox] = useState(false)

  return (
    <div className="flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-accent-bg">
        <span className="text-xs font-bold text-accent">{index + 1}</span>
      </div>
      <div className="flex-1 pb-6">
        <p className="text-sm leading-relaxed text-ink">{step.text}</p>
        {step.warning && <WarningBox text={step.warning} />}
        {step.image_url && (
          <>
            <button
              onClick={() => setLightbox(true)}
              className="mt-3 block"
            >
              <img
                src={step.image_url}
                alt={`Captura del paso ${index + 1}`}
                className="max-w-sm cursor-zoom-in rounded-lg border border-border shadow-sm transition-shadow hover:shadow-md"
              />
              <p className="mt-1 text-xs text-muted">
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
