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
  readOnly = false,
}: {
  id: number;
  pago: boolean;
  previsaoEntrega: Date | null;
  compact?: boolean;
  cliente?: { nome: string; telefone: string | null; valor: number };
  readOnly?: boolean;
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
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        <StatusBadge label={info.label} tone={info.tone} />
        {!readOnly &&
          !pago &&
          (compact ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => toggleOSPago(id, true))}
              title="Marcar como pago"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => toggleOSPago(id, true))}
              title="Marcar como pago"
              className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Marcar como pago
            </button>
          ))}
        {!readOnly && pago && (
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
      {cobrancaUrl && (
        <a
          href={cobrancaUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Cobrar no WhatsApp"
          className={
            compact
              ? "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-green-700 hover:bg-green-50"
              : "mt-1 flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50 hover:underline"
          }
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {!compact && "Cobrar"}
        </a>
      )}
    </div>
  );
}
