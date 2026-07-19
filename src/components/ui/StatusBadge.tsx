export type BadgeTone = "blue" | "amber" | "green" | "gray" | "red" | "orange" | "purple";

const toneClasses: Record<BadgeTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  green: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  gray: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
};

const dotClasses: Record<BadgeTone, string> = {
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  gray: "bg-gray-400",
  red: "bg-red-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
};

export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClasses[tone]}`} />
      {label}
    </span>
  );
}

export const osStatusMap: Record<string, { label: string; tone: BadgeTone }> = {
  aberta: { label: "Aberta", tone: "blue" },
  em_andamento: { label: "Em andamento", tone: "amber" },
  aguardando_peca: { label: "Aguardando peça", tone: "purple" },
  aguardando_cliente: { label: "Aguardando cliente", tone: "orange" },
  concluida: { label: "Concluída", tone: "green" },
  entregue: { label: "Entregue", tone: "gray" },
  cancelada: { label: "Cancelada", tone: "red" },
};

export function pagamentoInfo(
  os: { pago: boolean; previsaoEntrega: Date | null }
): { label: string; tone: BadgeTone } {
  if (os.pago) return { label: "Pago", tone: "green" };
  const atrasado = os.previsaoEntrega !== null && os.previsaoEntrega < new Date();
  return atrasado ? { label: "Em atraso", tone: "red" } : { label: "A receber", tone: "amber" };
}

export const notaSituacaoMap: Record<string, { label: string; tone: BadgeTone }> = {
  paga: { label: "Paga", tone: "green" },
  em_aberto: { label: "Em aberto", tone: "blue" },
  vencida: { label: "Vencida", tone: "red" },
};

export const notaTipoMap: Record<string, { label: string; tone: BadgeTone }> = {
  emitida: { label: "Emitida", tone: "blue" },
  recebida: { label: "Recebida", tone: "gray" },
};

export const situacaoDividaMap: Record<string, { label: string; tone: BadgeTone }> = {
  em_aberto: { label: "Em aberto", tone: "red" },
  pagando: { label: "Pagando", tone: "amber" },
  quitado: { label: "Quitado", tone: "green" },
};

export const statusExtraMap: Record<string, { label: string; tone: BadgeTone }> = {
  pendente: { label: "Pendente", tone: "red" },
  parcialmente_pago: { label: "Parcialmente pago", tone: "amber" },
  pago: { label: "Pago", tone: "green" },
};
