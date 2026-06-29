import { LEVELS, XP_EVENTS } from "@/lib/constants";

export function getLevelFromXp(xp: number): (typeof LEVELS)[number]["label"] {
  for (let i = LEVELS.length - 1; i >= 0; i -= 1) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i].label;
  }
  return "Explorer";
}

export function getAdaptiveRecommendation(score: number) {
  if (score >= 80) {
    return {
      type: "NEXT_LESSON" as const,
      reason: "Great job! Move to the next lesson with higher challenge.",
      xpAward: XP_EVENTS.QUIZ_COMPLETE + 20,
      nextDifficulty: 3,
    };
  }

  if (score >= 50) {
    return {
      type: "PRACTICE" as const,
      reason: "You are close. Try focused practice and attempt again.",
      xpAward: XP_EVENTS.QUIZ_COMPLETE,
      nextDifficulty: 2,
    };
  }

  return {
    type: "REMEDIAL" as const,
    reason: "Let's rebuild confidence with an easier remedial lesson.",
    xpAward: Math.floor(XP_EVENTS.QUIZ_COMPLETE / 2),
    nextDifficulty: 1,
  };
}
