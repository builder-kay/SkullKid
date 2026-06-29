"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

type Point = { name: string; value: number };

export function ProgressLineChart({ data, title }: { data: Point[]; title: string }) {
  return (
    <Card className="h-72">
      <p className="mb-4 text-sm font-semibold text-slate-700">{title}</p>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
