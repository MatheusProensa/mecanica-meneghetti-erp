import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import DarkPatternBg from "@/components/ui/DarkPatternBg";

function saudacao(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardHero({
  nome,
  agora,
  osAtrasadasCount,
}: {
  nome: string;
  agora: Date;
  osAtrasadasCount: number;
}) {
  const primeiroNome = nome.split(" ")[0];
  const dataFormatada = agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 shadow-sm">
      <DarkPatternBg />

      <div className="relative flex flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-6">
        <div>
          <p className="text-sm text-gray-400">
            {saudacao(agora.getHours())}, {primeiroNome}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm capitalize text-gray-300">{dataFormatada}</p>
        </div>
        {osAtrasadasCount > 0 && (
          <Link
            href="/os?pagamento=atrasado"
            className="flex shrink-0 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
          >
            <AlertTriangle className="h-4 w-4" />
            {osAtrasadasCount} OS atrasada{osAtrasadasCount === 1 ? "" : "s"}
          </Link>
        )}
      </div>
    </div>
  );
}
