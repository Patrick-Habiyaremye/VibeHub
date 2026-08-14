// services/profileAchievements.js

import { getProfileStats } from './profileStatsService'
import { getActivityStreak } from './profileActivityService'

class ProfileAchievements {
  static ACHIEVEMENTS = [
    {
      id: 'first_post',
      title: 'First Post',
      icon: '📝',
      condition: ({ stats }) => stats.postsCount >= 1,
    },
    {
      id: 'content_creator',
      title: 'Content Creator',
      icon: '🔥',
      condition: ({ stats }) => stats.postsCount >= 10,
    },
    {
      id: 'engaged_user',
      title: 'Engaged User',
      icon: '💬',
      condition: ({ stats }) => stats.commentsReceived >= 20,
    },
    {
      id: 'popular',
      title: 'Popular',
      icon: '⭐',
      condition: ({ stats }) => stats.reactionsReceived >= 50,
    },
    {
      id: 'streak_7',
      title: '7 Day Streak',
      icon: '📆',
      condition: ({ streak }) => streak >= 7,
    },
    {
      id: 'streak_30',
      title: '30 Day Streak',
      icon: '🏆',
      condition: ({ streak }) => streak >= 30,
    },
  ]

  static async getUserAchievements(userId, contextOverride = null) {
    try {
      const stats =
        contextOverride?.stats ??
        (await getProfileStats(userId))

      const streak =
        contextOverride?.streak ??
        (await getActivityStreak(userId))

      const context = { stats, streak }

      const unlocked = []
      const locked = []

      for (const achievement of this.ACHIEVEMENTS) {
        const isUnlocked = achievement.condition(context)

        if (isUnlocked) {
          unlocked.push({ ...achievement, unlocked: true })
        } else {
          locked.push({ ...achievement, unlocked: false })
        }
      }

      return { unlocked, locked }
    } catch (err) {
      console.error('getUserAchievements error:', err)
      throw err
    }
  }

  static async evaluate(userId, contextOverride = null) {
    return this.getUserAchievements(userId, contextOverride)
  }
}

export default ProfileAchievements