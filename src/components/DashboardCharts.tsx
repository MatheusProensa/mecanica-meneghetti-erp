"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export type MonthlyPoint = {
  mes: string;
  faturamento: number;
};

function formatCompactBRL(value: number): string {
  if (value === 0) return "R$ 0";
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  }
  return `R$ ${value}`;
}

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {payload.map((entry) => (
        <p
          key={String(entry.name)}
          className="mt-1 text-sm font-medium"
          style={{ color: entry.color }}
        >
          {entry.name}: {formatCurrency(Number(entry.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

export default function DashboardCharts({
  data,
  periodo,
}: {
  data: MonthlyPoint[];
  periodo: number;
}) {
  const maxValue = Math.max(0, ...data.map((d) => d.faturamento));
  const yDomain: [number, number] | undefined = maxValue === 0 ? [0, 100] : undefined;
  const periodoLabel = periodo === 1 ? "último mês" : `últimos ${periodo} meses`;

  return (
    <div className="rounded-[10px] border border-gray-200 bg-white p-6">
      <p className="mb-4 text-sm font-medium text-gray-700">
        Faturamento das OS ({periodoLabel})
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="faturamentoFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={yDomain}
              tickFormatter={formatCompactBRL}
            />
            <Tooltip content={ChartTooltip} />
            <Area
              type="monotone"
              dataKey="faturamento"
              name="Faturamento"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#faturamentoFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
