// services/profileService.js

import { supabase } from '../supabaseClient'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error

  return data
}

/**
 * Uploads a new avatar image to the "avatars" bucket and updates
 * the user's profile row. Returns the updated profile row.
 */
export async function uploadAvatar(userId, file) {
  if (!userId) throw new Error('uploadAvatar: userId is required')
  if (!file) throw new Error('uploadAvatar: file is required')

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath)

  const { data, error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)
    .select()
    .single()

  if (updateError) throw updateError

  return data
}

/**
 * Uploads a new cover image to the "covers" bucket and updates
 * the user's profile row. Returns the updated profile row.
 */
export async function uploadCover(userId, file) {
  if (!userId) throw new Error('uploadCover: userId is required')
  if (!file) throw new Error('uploadCover: file is required')

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('covers')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from('covers').getPublicUrl(filePath)

  const { data, error: updateError } = await supabase
    .from('profiles')
    .update({ cover_image: publicUrl })
    .eq('id', userId)
    .select()
    .single()

  if (updateError) throw updateError

  return data
}