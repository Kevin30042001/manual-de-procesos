import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Process } from '../types'

export function useProcesses() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const { data } = await supabase
      .from('processes')
      .select(
        `
        *,
        system:systems(*),
        step_count:steps(count)
      `
      )
      .order('created_at', { ascending: false })

    const mapped = (data ?? []).map((p: any) => ({
      ...p,
      step_count: p.step_count?.[0]?.count ?? 0,
    }))
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
    all: Process[],
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
          p.tags.some((t) => t.toLowerCase().includes(q))
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
