import { SubjectCode } from "@prisma/client";

export const demoStudent = {
  xp: 240,
  level: "Explorer",
  streakDays: 5,
  badges: [{ name: "Fast Learner" }, { name: "7-Day Streak" }],
};

export const demoProgress = [
  { title: "Fractions at the Market", bestScore: 82 },
  { title: "English Story Mapping", bestScore: 76 },
  { title: "Plant Growth Basics", bestScore: 88 },
];

export const demoLeaderboard = [
  { rank: 1, userId: "u1", name: "Chiamaka Nwosu", xp: 520, score: 91 },
  { rank: 2, userId: "u2", name: "Kwame Boateng", xp: 490, score: 89 },
  { rank: 3, userId: "u3", name: "Aisha Bello", xp: 470, score: 87 },
  { rank: 4, userId: "u4", name: "Tendai Moyo", xp: 430, score: 83 },
  { rank: 5, userId: "u5", name: "Lerato Dlamini", xp: 395, score: 80 },
];

export const demoSubjectLessons = [
  {
    id: "s1",
    code: SubjectCode.MATHEMATICS,
    title: "Mathematics",
    lessons: [
      {
        id: "l1",
        quizId: "demo-quiz-1",
        title: "Fractions at the Market",
        description: "Use fruit portions and market sales to learn fractions.",
        difficulty: 1,
      },
      {
        id: "l2",
        quizId: "demo-quiz-2",
        title: "Transport Fare Division",
        description: "Share transport costs and practice division.",
        difficulty: 2,
      },
    ],
  },
  {
    id: "s2",
    code: SubjectCode.ENGLISH,
    title: "English",
    lessons: [
      {
        id: "l3",
        quizId: "demo-quiz-3",
        title: "School Debate Vocabulary",
        description: "Strengthen vocabulary from school-life discussions.",
        difficulty: 1,
      },
    ],
  },
  {
    id: "s3",
    code: SubjectCode.SCIENCE,
    title: "Science",
    lessons: [
      {
        id: "l4",
        quizId: "demo-quiz-4",
        title: "Healthy Food and Energy",
        description: "Explore nutrients using local food examples.",
        difficulty: 1,
      },
    ],
  },
];
