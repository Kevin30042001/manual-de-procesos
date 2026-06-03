import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Step } from '../types'

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
        setSteps(data ?? [])
        setLoading(false)
      })
  }, [processId])

  return { steps, loading }
}
