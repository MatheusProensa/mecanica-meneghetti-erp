"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Agrupamento } from "./DashboardCharts";

const OPCOES: Record<Agrupamento, { value: string; label: string }[]> = {
  diario: [
    { value: "1", label: "Hoje" },
    { value: "7", label: "Últimos 7 dias" },
    { value: "14", label: "Últimos 14 dias" },
    { value: "30", label: "Últimos 30 dias" },
    { value: "60", label: "Últimos 60 dias" },
    { value: "90", label: "Últimos 90 dias" },
  ],
  semanal: [
    { value: "1", label: "Esta semana" },
    { value: "4", label: "Últimas 4 semanas" },
    { value: "8", label: "Últimas 8 semanas" },
    { value: "12", label: "Últimas 12 semanas" },
    { value: "26", label: "Últimas 26 semanas" },
  ],
  mensal: [
    { value: "1", label: "Último mês" },
    { value: "3", label: "Últimos 3 meses" },
    { value: "6", label: "Últimos 6 meses" },
    { value: "12", label: "Últimos 12 meses" },
  ],
};

export default function PeriodoSelector({
  agrupamento,
  periodo,
}: {
  agrupamento: Agrupamento;
  periodo: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handlePeriodoChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", next);
    params.delete("de");
    params.delete("ate");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const opcoes = OPCOES[agrupamento];

  return (
    <select
      value={periodo}
      onChange={(e) => handlePeriodoChange(e.target.value)}
      className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {opcoes.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
