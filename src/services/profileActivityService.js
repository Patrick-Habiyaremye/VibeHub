// services/profileActivityService.js

import { supabase } from '../supabaseClient'

export async function getActivityStreak(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('streak_count')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[getActivityStreak]', error)
    throw error
  }

  return data?.streak_count ?? 0
}