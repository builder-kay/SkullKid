"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

type Quiz = {
  id: string;
  title: string;
  questions: QuizQuestion[];
};

const demoQuiz: Quiz = {
  id: "demo-quiz-1",
  title: "Fractions Quick Check",
  questions: [
    {
      id: "dq1",
      prompt: "A trader shares 12 oranges equally into 3 baskets. How many oranges per basket?",
      options: ["3", "4", "5", "6"],
    },
    {
      id: "dq2",
      prompt: "If a bus fare of 20 naira is shared by 4 pupils, each pays?",
      options: ["2", "4", "5", "8"],
    },
  ],
};

export default function QuizPage() {
  const params = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; reason: string } | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const response = await fetch(`/api/quizzes/${params.quizId}`);
        const data = await response.json();
        if (response.ok) {
          setQuiz(data.quiz);
          return;
        }
      } catch {
        // Demo fallback below.
      }
      setQuiz({ ...demoQuiz, id: String(params.quizId ?? "demo-quiz-1") });
    }
    run();
  }, [params.quizId]);

  const currentQuestion = useMemo(() => quiz?.questions[index], [quiz, index]);

  async function submitQuiz() {
    if (!quiz) return;
    const payload = {
      answers: quiz.questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] ?? "",
      })),
    };
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setResult({
          score: data.attempt.score,
          reason: data.adaptive.reason,
        });
        return;
      }
    } catch {
      // local score fallback below
    }

    const selected = Object.values(answers).filter(Boolean).length;
    const score = Math.round((selected / Math.max(quiz.questions.length, 1)) * 100);
    const reason =
      score >= 80
        ? "Excellent progress. You are ready for the next lesson."
        : score >= 50
          ? "Good attempt. Practice a bit more, then retry."
          : "No worries. Review the lesson and try easier practice first.";

    setResult({
      score,
      reason,
    });
  }

  if (!quiz) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Loading quiz...</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#eef2ff] p-4 md:p-6">
        <Card className="mx-auto max-w-xl space-y-3">
          <h1 className="text-2xl font-bold text-slate-900">Great effort!</h1>
          <p className="text-slate-700">Your score: {result.score}%</p>
          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{result.reason}</p>
          <Button onClick={() => (window.location.href = "/student/dashboard")}>Back to dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2ff] p-4 md:p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="space-y-2">
          <p className="text-sm font-semibold text-indigo-600">
            {quiz.title} - Question {index + 1} of {quiz.questions.length}
          </p>
          <h1 className="text-xl font-semibold text-slate-900">{currentQuestion?.prompt}</h1>
        </Card>
        <Card className="space-y-2">
          {currentQuestion?.options.map((option) => (
            <button
              key={option}
              onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }))}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                answers[currentQuestion.id] === option
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {option}
            </button>
          ))}
          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setIndex((p) => Math.max(p - 1, 0))} disabled={index === 0}>
              Previous
            </Button>
            {index < quiz.questions.length - 1 ? (
              <Button onClick={() => setIndex((p) => p + 1)}>Next</Button>
            ) : (
              <Button onClick={submitQuiz}>Submit Quiz</Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
