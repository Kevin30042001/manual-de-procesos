import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Process } from '../types'

// Extended type used internally — includes steps' text/warning for search
interface ProcessWithSearch extends Process {
  _search_blob?: string
}

export function useProcesses() {
  const [processes, setProcesses] = useState<ProcessWithSearch[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const { data } = await supabase
      .from('processes')
      .select(
        `
        *,
        system:systems(*),
        steps(text, warning)
      `
      )
      .order('created_at', { ascending: false })

    const mapped: ProcessWithSearch[] = (data ?? []).map((p: any) => {
      const stepsArr = Array.isArray(p.steps) ? p.steps : []
      const searchBlob = stepsArr
        .map(
          (s: { text: string; warning: string | null }) =>
            `${s.text ?? ''} ${s.warning ?? ''}`
        )
        .join(' ')
        .toLowerCase()
      return {
        ...p,
        step_count: stepsArr.length,
        _search_blob: searchBlob,
      }
    })
    setProcesses(mapped)
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [])

  const toggleFavorite = async (id: string, current: boolean) => {
    setProcesses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_favorite: !current } : p))
    )
    await supabase
      .from('processes')
      .update({ is_favorite: !current })
      .eq('id', id)
  }

  const remove = async (id: string) => {
    await supabase.from('processes').delete().eq('id', id)
    setProcesses((prev) => prev.filter((p) => p.id !== id))
  }

  const filter = (
    all: ProcessWithSearch[],
    systemId: string | null,
    search: string,
    favOnly: boolean
  ): Process[] => {
    return all.filter((p) => {
      if (favOnly && !p.is_favorite) return false
      if (systemId && p.system_id !== systemId) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          (p.category ?? '').toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (p._search_blob ?? '').includes(q)
        )
      }
      return true
    })
  }

  return {
    processes,
    loading,
    toggleFavorite,
    remove,
    refetch: fetch,
    filter,
  }
}
