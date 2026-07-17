"use client";

import { useTransition } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { toggleOSPago } from "@/app/(protected)/os/actions";
import { StatusBadge, pagamentoInfo } from "@/components/ui/StatusBadge";
import { formatCurrency, whatsappUrl } from "@/lib/format";

export default function OSPagoToggle({
  id,
  pago,
  previsaoEntrega,
  compact = false,
  cliente,
}: {
  id: number;
  pago: boolean;
  previsaoEntrega: Date | null;
  compact?: boolean;
  cliente?: { nome: string; telefone: string | null; valor: number };
}) {
  const [pending, startTransition] = useTransition();
  const info = pagamentoInfo({ pago, previsaoEntrega });

  const atrasado = !pago && info.tone === "red";
  const cobrancaUrl =
    atrasado && cliente
      ? whatsappUrl(
          cliente.telefone,
          `Olá, ${cliente.nome}! Passando pra lembrar da OS #${String(id).padStart(4, "0")}, no valor de ${formatCurrency(cliente.valor)}, que está em aberto. Qualquer dúvida é só chamar.`
        )
      : null;

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <StatusBadge label={info.label} tone={info.tone} />
      {cobrancaUrl && (
        <a
          href={cobrancaUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Cobrar no WhatsApp"
          className={
            compact
              ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-green-200 text-green-700 hover:bg-green-50"
              : "flex items-center gap-1 rounded-md border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
          }
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {!compact && "Cobrar"}
        </a>
      )}
      {!pago &&
        (compact ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleOSPago(id, true))}
            title="Marcar como pago"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-60"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleOSPago(id, true))}
            title="Marcar como pago"
            className="flex items-center gap-1 rounded-md border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Marcar como pago
          </button>
        ))}
      {pago && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => toggleOSPago(id, false))}
          title="Desmarcar pagamento"
          className="text-xs text-gray-400 underline hover:text-gray-600 disabled:opacity-60"
        >
          desfazer
        </button>
      )}
    </div>
  );
}
