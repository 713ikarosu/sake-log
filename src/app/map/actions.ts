'use server'

import { createClient } from '@/lib/supabase/server'

export async function getMapLogs() {
  const supabase = await createClient()
  const { data: logs, error } = await supabase
    .from('logs')
    .select(`
      id,
      drink_type,
      drink_name,
      location_name,
      latitude,
      longitude,
      image_url,
      rating,
      drunk_at,
      profiles (username)
    `)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('drunk_at', { ascending: false })

  if (error) {
    console.error('Error fetching map logs:', error)
    return []
  }

  return logs
}
