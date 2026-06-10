import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  full_name: string | null
  email: string
  puesto: string | null
}

export interface Share {
  id: string
  shared_with: string
  profile: Profile
}

export function useShares(processId: string | undefined) {
  const [shares, setShares] = useState<Share[]>([])
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  const fetchShares = async () => {
    if (!processId) return
    const { data: rawShares } = await supabase
      .from('process_shares')
      .select('id, shared_with')
      .eq('process_id', processId)
    if (!rawShares || rawShares.length === 0) { setShares([]); return }

    const ids = rawShares.map((s) => s.shared_with)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, puesto')
      .in('id', ids)

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
    const normalized: Share[] = rawShares.map((s) => ({
      id: s.id,
      shared_with: s.shared_with,
      profile: profileMap[s.shared_with] ?? { id: s.shared_with, full_name: null, email: '', puesto: null },
    }))
    setShares(normalized)
  }

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, puesto')
      .order('full_name')
    setAllProfiles(data ?? [])
  }

  useEffect(() => {
    if (!processId) return
    setLoading(true)
    Promise.all([fetchShares(), fetchProfiles()]).then(() => setLoading(false))
  }, [processId])

  const addShare = async (processId: string, sharedWithId: string, sharedById: string) => {
    await supabase.from('process_shares').insert({
      process_id: processId,
      shared_with: sharedWithId,
      shared_by: sharedById,
    })
    await fetchShares()
  }

  const removeShare = async (shareId: string) => {
    await supabase.from('process_shares').delete().eq('id', shareId)
    await fetchShares()
  }

  return { shares, allProfiles, loading, addShare, removeShare }
}
