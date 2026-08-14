// services/activityLogger.js

import { supabase } from '../supabaseClient'

function getUserLocalDate(timezone = 'UTC') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()) // YYYY-MM-DD
}

export async function trackActivity(userId, timezone = 'UTC') {
  const today = getUserLocalDate(timezone)

  // 🔥 STEP 1: Insert activity (ignore duplicates safely)
  const { error: insertError } = await supabase
    .from('daily_activity')
    .upsert(
      { user_id: userId, activity_date: today },
      { onConflict: 'user_id,activity_date' }
    )

  if (insertError) {
    console.error('activity insert error:', insertError)
    return
  }

  // 🔥 STEP 2: Fetch streak state
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('streak_count, last_active_date')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('profile fetch error:', profileError)
    return
  }

  const lastDate = profile.last_active_date
  let newStreak = profile.streak_count || 0

  // 🔥 STEP 3: Compute diff safely
  const diff = dateDiffInDays(lastDate, today)

  if (diff === 0) {
    // already processed today → EXIT (idempotent)
    return
  }

  if (diff === 1) {
    newStreak += 1
  } else {
    newStreak = 1
  }

  // 🔥 STEP 4: Update streak (atomic-ish)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      streak_count: newStreak,
      last_active_date: today,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('streak update error:', updateError)
  }
}

// 🔒 Safe date diff using UTC (no timezone bugs)
function dateDiffInDays(prev, curr) {
  if (!prev) return 1

  const d1 = new Date(prev + 'T00:00:00Z')
  const d2 = new Date(curr + 'T00:00:00Z')

  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
}