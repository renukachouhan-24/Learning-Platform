/**
 * Streak calculation utility
 * Handles daily streak tracking logic
 */

export interface StreakData {
  currentStreak: number;
  lastActiveDate: string | null;
  longestStreak: number;
}

/**
 * Calculate streak based on last active date
 * @param lastActiveDate - ISO date string of last activity (e.g., "2026-03-23")
 * @param currentStreakCount - Current streak count to maintain
 * @returns Updated streak count
 */
export function calculateStreakUpdate(lastActiveDate: string | null, currentStreakCount: number = 0): number {
  if (!lastActiveDate) return 1; // First activity starts streak at 1

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = new Date(lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const timeDiff = today.getTime() - lastActive.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  if (daysDiff === 0) {
    // Same day, no change to streak
    return currentStreakCount;
  } else if (daysDiff === 1) {
    // Consecutive day, increment streak
    return currentStreakCount + 1;
  } else {
    // Streak broken, reset to 1
    return 1;
  }
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Check if activity happened today
 */
export function isActivityToday(lastActiveDate: string | null): boolean {
  if (!lastActiveDate) return false;
  return lastActiveDate === getTodayDateString();
}

/**
 * Format streak display string
 */
export function formatStreakDisplay(streak: number): string {
  if (streak === 0) return "Start your streak";
  if (streak === 1) return "1 day streak";
  return `${streak} day streak`;
}
