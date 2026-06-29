import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LessonCard({
  id,
  title,
  description,
  difficulty,
}: {
  id: string;
  title: string;
  description: string;
  difficulty: number;
}) {
  return (
    <Card className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <p className="text-xs text-slate-500">Difficulty Level {difficulty}</p>
      <Link href={`/student/quiz/${id}`} className="inline-block">
        <Button size="sm">
          Start Quiz <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </Card>
  );
}
