import { Card } from "@/components/ui/card";

type Row = {
  rank: number;
  name: string;
  xp: number;
  score: number;
};

export function LeaderboardTable({ rows }: { rows: Row[] }) {
  return (
    <Card className="overflow-x-auto">
      <p className="mb-3 text-sm font-semibold text-slate-700">Class Leaderboard</p>
      <table className="w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr>
            <th className="py-2">Rank</th>
            <th className="py-2">Learner</th>
            <th className="py-2">XP</th>
            <th className="py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.rank}-${row.name}`} className="border-t border-slate-200">
              <td className="py-3 font-semibold text-slate-700">{row.rank}</td>
              <td className="py-3">{row.name}</td>
              <td className="py-3">{row.xp}</td>
              <td className="py-3">{row.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
