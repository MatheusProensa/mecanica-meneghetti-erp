"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { toggleOSPago } from "@/app/(protected)/os/actions";
import { StatusBadge, pagamentoInfo } from "@/components/ui/StatusBadge";

export default function OSPagoToggle({
  id,
  pago,
  previsaoEntrega,
  compact = false,
}: {
  id: number;
  pago: boolean;
  previsaoEntrega: Date | null;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const info = pagamentoInfo({ pago, previsaoEntrega });

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <StatusBadge label={info.label} tone={info.tone} />
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
