import DarkPatternBg from "@/components/ui/DarkPatternBg";

function saudacao(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardHero({ nome, agora }: { nome: string; agora: Date }) {
  const primeiroNome = nome.split(" ")[0];
  const dataFormatada = agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 shadow-sm">
      <DarkPatternBg />

      <div className="relative px-5 py-6 sm:px-6">
        <p className="text-sm text-gray-400">
          {saudacao(agora.getHours())}, {primeiroNome}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm capitalize text-gray-300">{dataFormatada}</p>
      </div>
    </div>
  );
}
