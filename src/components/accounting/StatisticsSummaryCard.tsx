import type { FC } from "react";

interface StatisticsSummaryCardProps {
  label: string;
  value: string;
  tone?: "blue" | "green" | "red" | "violet";
}

const tones = {
  blue: "bg-blue-50 text-blue-900 ring-blue-100",
  green: "bg-emerald-50 text-emerald-900 ring-emerald-100",
  red: "bg-red-50 text-red-900 ring-red-100",
  violet: "bg-violet-50 text-violet-900 ring-violet-100",
};

export const StatisticsSummaryCard: FC<StatisticsSummaryCardProps> = ({ label, value, tone = "blue" }) => (
  <div className={`rounded-xl p-4 ring-1 ${tones[tone]}`}>
    <p className="text-sm font-medium opacity-80">{label}</p>
    <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
  </div>
);
