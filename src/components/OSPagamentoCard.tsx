"use client";

import { useTransition } from "react";
import { toggleOSPago } from "@/app/(protected)/os/actions";
import { pagamentoInfo } from "@/components/ui/StatusBadge";

export default function OSPagamentoCard({
  id,
  pago,
  previsaoEntrega,
  readOnly,
}: {
  id: number;
  pago: boolean;
  previsaoEntrega: Date | null;
  readOnly: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const info = pagamentoInfo({ pago, previsaoEntrega });

  return (
    <div className="min-h-[90px] rounded-xl bg-brand-600 p-3.5 shadow-[var(--shadow-card)] sm:min-h-[110px] sm:p-5">
      <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100 sm:text-xs">
          Pagamento
        </p>
        <p className="whitespace-nowrap text-[16px] font-bold leading-tight tracking-tight text-white sm:text-[20px]">
          {info.label}
        </p>
        {!readOnly && (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleOSPago(id, !pago))}
            className="mt-1 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-brand-600 shadow-sm hover:bg-blue-50 disabled:opacity-60"
          >
            {pago ? "Desfazer" : "Marcar pago"}
          </button>
        )}
      </div>
    </div>
  );
}
