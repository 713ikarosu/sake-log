'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'unauthenticated' }
  }

  const username = formData.get('username') as string
  const avatar_url = formData.get('avatar_url') as string

  if (!username || username.length < 3) {
    return { error: 'username_too_short' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      avatar_url: avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return { error: 'database_error' }
  }

  revalidatePath('/')
  revalidatePath('/profile')
  return { success: true }
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}
