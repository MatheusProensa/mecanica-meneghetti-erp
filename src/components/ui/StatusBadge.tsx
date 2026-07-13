export type BadgeTone = "blue" | "amber" | "green" | "gray" | "red";

const toneClasses: Record<BadgeTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  green: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  gray: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
};

export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

export const osStatusMap: Record<string, { label: string; tone: BadgeTone }> = {
  aberta: { label: "Aberta", tone: "blue" },
  em_andamento: { label: "Em andamento", tone: "amber" },
  concluida: { label: "Concluída", tone: "green" },
  entregue: { label: "Entregue", tone: "gray" },
  cancelada: { label: "Cancelada", tone: "red" },
};

export const notaSituacaoMap: Record<string, { label: string; tone: BadgeTone }> = {
  paga: { label: "Paga", tone: "green" },
  em_aberto: { label: "Em aberto", tone: "blue" },
  vencida: { label: "Vencida", tone: "red" },
};

export const notaTipoMap: Record<string, { label: string; tone: BadgeTone }> = {
  emitida: { label: "Emitida", tone: "blue" },
  recebida: { label: "Recebida", tone: "gray" },
};
