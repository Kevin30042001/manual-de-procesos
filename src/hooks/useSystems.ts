import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { System } from '../types'
export function useSystems() {
  const [systems, setSystems] = useState<System[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const { data } = await supabase.from('systems').select('*').order('name')
    setSystems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [])

  const create = async (name: string, color: string) => {
    await supabase.from('systems').insert({ name, color })
    await fetch()
  }

  const update = async (id: string, name: string, color: string) => {
    await supabase.from('systems').update({ name, color }).eq('id', id)
    await fetch()
  }

  const remove = async (id: string) => {
    await supabase.from('systems').delete().eq('id', id)
    await fetch()
  }

  const countBySystem = async (id: string): Promise<number> => {
    const { count } = await supabase
      .from('processes')
      .select('*', { count: 'exact', head: true })
      .eq('system_id', id)
    return count ?? 0
  }

  return {
    systems,
    loading,
    create,
    update,
    remove,
    countBySystem,
    refetch: fetch,
  }
}
