import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Step, SubStep } from '../types'

// Normaliza filas que pueden venir de la BD vieja (solo image_url, sin substeps)
function normalizeStep(row: Record<string, unknown>): Step {
  const imageUrls = Array.isArray(row.image_urls) ? (row.image_urls as string[]) : []
  const fallback = row.image_url ? [row.image_url as string] : []
  return {
    id: row.id as string,
    process_id: row.process_id as string,
    order: row.order as number,
    text: row.text as string,
    warning: (row.warning as string) ?? null,
    image_url: (row.image_url as string) ?? null,
    image_urls: imageUrls.length > 0 ? imageUrls : fallback,
    substeps: Array.isArray(row.substeps) ? (row.substeps as SubStep[]) : [],
  }
}

export function useSteps(processId: string | undefined) {
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!processId) return
    supabase
      .from('steps')
      .select('*')
      .eq('process_id', processId)
      .order('order')
      .then(({ data }) => {
        setSteps((data ?? []).map(normalizeStep))
        setLoading(false)
      })
  }, [processId])

  return { steps, loading }
}
