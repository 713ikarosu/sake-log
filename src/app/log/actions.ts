'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createLog(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'unauthenticated' }
  }

  const drink_type = formData.get('drink_type') as string
  const drink_name = formData.get('drink_name') as string
  const location_type = formData.get('location_type') as string
  const location_name = formData.get('location_name') as string
  const rating = formData.get('rating') ? parseInt(formData.get('rating') as string) : null
  const comment = formData.get('comment') as string
  const image_url = formData.get('image_url') as string
  const visibility = formData.get('visibility') as string || 'public'
  const drunk_at = formData.get('drunk_at') as string || new Date().toISOString()

  const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
  const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
  const place_id = formData.get('place_id') as string

  const { error } = await supabase.from('logs').insert({
    user_id: user.id,
    drink_type,
    drink_name: drink_name || null,
    location_type: location_type || null,
    location_name: location_name || null,
    rating,
    comment: comment || null,
    image_url: image_url || null,
    visibility,
    drunk_at,
    latitude,
    longitude,
    place_id: place_id || null,
  })

  if (error) {
    console.error(error)
    return { error: 'database_error' }
  }

  revalidatePath('/')
  return { success: true }
}
