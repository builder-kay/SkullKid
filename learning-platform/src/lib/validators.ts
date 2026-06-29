import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(3, "Full name is too short."),
  username: z.string().min(3, "Username should have at least 3 characters."),
  phone: z.string().min(9, "Enter a valid Ghana mobile number."),
  password: z.string().min(8, "Password should be at least 8 characters."),
  confirmPassword: z.string().min(8, "Please confirm password."),
  role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
});

export const signupOtpVerifySchema = z.object({
  phone: z.string().min(9),
  otp: z.string().length(6, "OTP should be 6 digits."),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, "Use username or phone number."),
  password: z.string().min(8, "Password should be at least 8 characters."),
});

export const passwordResetRequestSchema = z.object({
  phone: z.string().min(9),
});

export const passwordResetConfirmSchema = z.object({
  phone: z.string().min(9),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export const quizAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedAnswer: z.string().min(1),
    }),
  ),
  durationSec: z.number().int().positive().optional(),
});

export const lessonSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(6),
  content: z.string().min(10),
  difficulty: z.number().min(1).max(3).default(1),
  orderIndex: z.number().int().min(1),
});
