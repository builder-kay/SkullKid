export const LEVELS = [
  { label: "Explorer", minXp: 0 },
  { label: "Scholar", minXp: 300 },
  { label: "Champion", minXp: 700 },
  { label: "Legend", minXp: 1200 },
] as const;

export const XP_EVENTS = {
  LESSON_COMPLETE: 30,
  QUIZ_COMPLETE: 50,
  PERFECT_SCORE_BONUS: 20,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 5,
} as const;
