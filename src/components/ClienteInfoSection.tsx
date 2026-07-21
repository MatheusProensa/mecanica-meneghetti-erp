"use client";

import { useState } from "react";
import type { Cliente } from "@/generated/prisma/client";
import ClienteForm from "@/components/ClienteForm";
import DarkPatternBg from "@/components/ui/DarkPatternBg";
import ConfirmModal from "@/components/ui/ConfirmModal";
import WhatsAppLink from "@/components/ui/WhatsAppLink";
import { formatDate, formatPhoneBR } from "@/lib/format";

export default function ClienteInfoSection({
  cliente,
  action,
  deleteAction,
  podeEditar,
  podeExcluir,
}: {
  cliente: Cliente;
  action: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
  podeEditar: boolean;
  podeExcluir: boolean;
}) {
  const [editando, setEditando] = useState(false);

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 shadow-sm">
        <DarkPatternBg />
        <div className="relative flex flex-wrap items-start justify-between gap-4 px-5 py-6 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Cliente</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{cliente.nome}</h1>
            <p className="mt-1 text-sm text-gray-300">
              Cliente desde {formatDate(cliente.createdAt)}
              {cliente.cidade ? ` · ${cliente.cidade}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {podeExcluir && (
              <ConfirmModal
                triggerLabel="Excluir"
                triggerClassName="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                title="Excluir este cliente?"
                description={`Tem certeza que deseja excluir "${cliente.nome}"? Essa ação não pode ser desfeita.`}
                action={deleteAction}
              />
            )}
            {podeEditar && (
              <button
                type="button"
                onClick={() => setEditando((v) => !v)}
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                {editando ? "Cancelar" : "Editar"}
              </button>
            )}
          </div>
        </div>
      </div>

      {editando ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
          <ClienteForm cliente={cliente} action={action} />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
            <h3 className="text-sm font-semibold text-gray-900">Contato</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">CPF/CNPJ</dt>
                <dd className="font-medium text-gray-900">{cliente.cpfCnpj || "-"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Telefone</dt>
                <dd className="font-medium text-gray-900">{formatPhoneBR(cliente.telefone) || "-"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">WhatsApp</dt>
                <dd className="font-medium text-gray-900">
                  {cliente.whatsapp ? <WhatsAppLink phone={cliente.whatsapp} /> : "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">E-mail</dt>
                <dd className="font-medium text-gray-900">{cliente.email || "-"}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
            <h3 className="text-sm font-semibold text-gray-900">Endereço e observações</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Cidade</dt>
                <dd className="font-medium text-gray-900">{cliente.cidade || "-"}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-gray-500">Endereço</dt>
                <dd className="text-right font-medium text-gray-900">{cliente.endereco || "-"}</dd>
              </div>
            </dl>
            {cliente.observacoes && (
              <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                {cliente.observacoes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
