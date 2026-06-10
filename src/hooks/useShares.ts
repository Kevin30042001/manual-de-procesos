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
    const { data } = await supabase
      .from('process_shares')
      .select('id, shared_with, profile:profiles(id, full_name, email, puesto)')
      .eq('process_id', processId)
    // Supabase returns the FK join as array; normalize to single object
    const normalized: Share[] = (data ?? []).map((row: any) => ({
      ...row,
      profile: Array.isArray(row.profile) ? row.profile[0] : row.profile,
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
