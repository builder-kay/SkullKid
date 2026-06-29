import bcrypt from "bcryptjs";
import { PrismaClient, Role, SubjectCode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.feedbackMessage.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.leaderboardSnapshot.deleteMany();
  await prisma.studentBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.progressRecord.deleteMany();
  await prisma.questionAttempt.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.classroom.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const classroom = await prisma.classroom.create({
    data: {
      name: "P6A",
      grade: 6,
    },
  });

  const admin = await prisma.user.create({
    data: {
      fullName: "Amina Okoro",
      email: "admin@afralearn.edu",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      fullName: "Mr. Kofi Mensah",
      email: "teacher@afralearn.edu",
      passwordHash,
      role: Role.TEACHER,
      teacher: { create: { bio: "Passionate STEM educator focused on mastery learning." } },
    },
  });

  const studentNames = [
    "Chiamaka Nwosu",
    "Kwame Boateng",
    "Aisha Bello",
    "Tendai Moyo",
    "Lerato Dlamini",
  ];

  const students = await Promise.all(
    studentNames.map((fullName, idx) =>
      prisma.user.create({
        data: {
          fullName,
          email: `student${idx + 1}@afralearn.edu`,
          passwordHash,
          role: Role.STUDENT,
          classroomId: classroom.id,
          student: {
            create: {
              xp: 100 + idx * 25,
              level: idx >= 3 ? "Scholar" : "Explorer",
              streakDays: 2 + idx,
            },
          },
        },
        include: { student: true },
      }),
    ),
  );

  const [math, english, science] = await Promise.all([
    prisma.subject.create({
      data: {
        code: SubjectCode.MATHEMATICS,
        title: "Mathematics",
        description: "Everyday math using market, transport, and school examples.",
        classroomId: classroom.id,
      },
    }),
    prisma.subject.create({
      data: {
        code: SubjectCode.ENGLISH,
        title: "English",
        description: "Reading and writing with relatable school-life stories.",
        classroomId: classroom.id,
      },
    }),
    prisma.subject.create({
      data: {
        code: SubjectCode.SCIENCE,
        title: "Science",
        description: "Hands-on science connected to farming, weather, and health.",
        classroomId: classroom.id,
      },
    }),
  ]);

  const mathLesson = await prisma.lesson.create({
    data: {
      subjectId: math.id,
      title: "Fractions at the Market",
      description: "Learn fractions through food portions and market buying.",
      content:
        "A fruit seller divides a tray of mangoes into equal parts. Fractions help describe each part and compare prices fairly.",
      orderIndex: 1,
      createdById: teacher.id,
      difficulty: 1,
    },
  });

  const mathQuiz = await prisma.quiz.create({
    data: {
      lessonId: mathLesson.id,
      title: "Fractions Quick Check",
      createdById: teacher.id,
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: mathQuiz.id,
        prompt: "A trader cuts a watermelon into 8 equal slices. If Musa eats 2 slices, what fraction did he eat?",
        options: ["1/8", "2/8", "3/8", "1/2"],
        correctAnswer: "2/8",
        explanation: "Musa ate 2 out of 8 slices, so the fraction is 2/8.",
        topicTag: "fractions",
        orderIndex: 1,
      },
      {
        quizId: mathQuiz.id,
        prompt: "A bus fare is shared by 4 pupils equally. If total fare is 20, each pays?",
        options: ["2", "4", "5", "8"],
        correctAnswer: "5",
        explanation: "20 divided by 4 equals 5.",
        topicTag: "division",
        orderIndex: 2,
      },
    ],
  });

  await prisma.badge.createMany({
    data: [
      { name: "Perfect Score", description: "Score 100% in a quiz.", icon: "Sparkles" },
      { name: "Math Wizard", description: "Complete 5 math lessons.", icon: "Calculator" },
      { name: "Science Explorer", description: "Master a science path.", icon: "FlaskConical" },
      { name: "7-Day Streak", description: "Learn every day for a week.", icon: "Flame" },
      { name: "Fast Learner", description: "Complete 3 lessons quickly.", icon: "Zap" },
    ],
  });

  const firstStudent = students[0];
  await prisma.recommendation.create({
    data: {
      userId: firstStudent.id,
      lessonId: mathLesson.id,
      type: "NEXT_LESSON",
      reason: "Strong performance in fractions; ready for equivalent fractions.",
    },
  });

  await prisma.progressRecord.create({
    data: {
      userId: firstStudent.id,
      lessonId: mathLesson.id,
      completion: 100,
      bestScore: 85,
      attempts: 1,
      weakTopics: ["division"],
      consistency: 0.7,
    },
  });

  await prisma.leaderboardSnapshot.createMany({
    data: students.map((student, index) => ({
      classroomId: classroom.id,
      subjectId: math.id,
      userId: student.id,
      xp: student.student?.xp ?? 0,
      score: 75 + index * 4,
      rank: index + 1,
      period: "weekly",
    })),
  });

  console.log("Seed complete.");
  console.log({
    admin: admin.email,
    teacher: teacher.email,
    student: students[0].email,
    password: "Password123!",
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
