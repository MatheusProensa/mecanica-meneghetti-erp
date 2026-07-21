"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import OSStatusSelect from "@/components/OSStatusSelect";
import OSPagoToggle from "@/components/OSPagoToggle";
import ExportarOSPdf from "@/components/ExportarOSPdf";
import type { DadosEmpresa } from "@/lib/business";
import type { OSLinha } from "@/lib/gerarOSPdf";
import type { StatusOS } from "@/generated/prisma/client";

export interface OSLinhaTabela {
  id: number;
  clienteNome: string;
  telefone: string | null;
  data: Date;
  status: StatusOS;
  pago: boolean;
  previsaoEntrega: Date | null;
  valor: number;
}

export default function OSResultados({
  pagAtual,
  paraExportar,
  totalOrdens,
  empresa,
  periodoLabel,
  pagina,
  status,
  q,
  pagamento,
  ordenar,
  podeEditar,
}: {
  pagAtual: OSLinhaTabela[];
  paraExportar: OSLinha[];
  totalOrdens: number;
  empresa: DadosEmpresa;
  periodoLabel: string;
  pagina: number;
  status?: string;
  q?: string;
  pagamento?: string;
  ordenar?: string;
  podeEditar: boolean;
}) {
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTodosDaPagina() {
    setSelecionados((prev) => {
      const todosMarcados = pagAtual.every((os) => prev.has(os.id));
      const next = new Set(prev);
      for (const os of pagAtual) {
        if (todosMarcados) next.delete(os.id);
        else next.add(os.id);
      }
      return next;
    });
  }

  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (pagamento) params.set("pagamento", pagamento);
    if (ordenar) params.set("ordenar", ordenar);
    if (p > 1) params.set("pagina", String(p));
    const qs = params.toString();
    return qs ? `/os?${qs}` : "/os";
  }

  const usandoSelecao = selecionados.size > 0;
  const ordensParaExportar = usandoSelecao
    ? paraExportar.filter((os) => selecionados.has(os.id))
    : paraExportar;

  const todosDaPaginaMarcados =
    pagAtual.length > 0 && pagAtual.every((os) => selecionados.has(os.id));

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {usandoSelecao
            ? `${selecionados.size} selecionada${selecionados.size === 1 ? "" : "s"} para o PDF`
            : "Nenhuma marcada — o PDF sai com tudo que está filtrado"}
        </p>
        <div className="flex w-full justify-center sm:w-auto sm:justify-start">
          <ExportarOSPdf
            empresa={empresa}
            periodoLabel={periodoLabel}
            ordens={ordensParaExportar}
            nomeArquivo={`ordens-de-servico-${new Date().toISOString().slice(0, 10)}.pdf`}
          />
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[var(--shadow-card)]">
        <div className="h-[3px] bg-brand-600" />
        {pagAtual.length === 0 ? (
          <EmptyState
            icon="tools"
            title="Nenhuma ordem de serviço encontrada"
            description="Crie a primeira OS para começar a acompanhar os serviços da oficina."
          />
        ) : (
          <>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="bg-gray-50/80 text-gray-500">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={todosDaPaginaMarcados}
                      onChange={toggleTodosDaPagina}
                      title="Marcar todos"
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">OS</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody>
                {pagAtual.map((os) => (
                  <tr key={os.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="align-middle px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selecionados.has(os.id)}
                        onChange={() => toggle(os.id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="align-middle px-6 py-3">
                      <Link
                        href={`/os/${os.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        #{String(os.id).padStart(4, "0")}
                      </Link>
                    </td>
                    <td className="align-middle px-6 py-3 text-gray-500">{os.clienteNome}</td>
                    <td className="align-middle px-6 py-3 text-gray-500">{formatDate(os.data)}</td>
                    <td className="align-middle px-6 py-3">
                      <OSStatusSelect id={os.id} status={os.status} readOnly={!podeEditar} />
                    </td>
                    <td className="align-middle px-6 py-3">
                      <OSPagoToggle
                        id={os.id}
                        pago={os.pago}
                        previsaoEntrega={os.previsaoEntrega}
                        cliente={{ nome: os.clienteNome, telefone: os.telefone, valor: os.valor }}
                        readOnly={!podeEditar}
                      />
                    </td>
                    <td className="align-middle px-6 py-3 text-gray-500 tabular-nums">
                      {formatCurrency(os.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-gray-100 md:hidden">
              {pagAtual.map((os) => (
                <div key={os.id} className="flex items-start gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selecionados.has(os.id)}
                    onChange={() => toggle(os.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/os/${os.id}`}
                        className="min-w-0 flex-1 truncate font-medium text-gray-900 hover:underline"
                      >
                        #{String(os.id).padStart(4, "0")} — {os.clienteNome}
                      </Link>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
                        {formatCurrency(os.valor)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <OSStatusSelect id={os.id} status={os.status} compact readOnly={!podeEditar} />
                        <OSPagoToggle
                          id={os.id}
                          pago={os.pago}
                          previsaoEntrega={os.previsaoEntrega}
                          compact
                          cliente={{ nome: os.clienteNome, telefone: os.telefone, valor: os.valor }}
                          readOnly={!podeEditar}
                        />
                      </div>
                      <span className="ml-auto text-xs text-gray-500">{formatDate(os.data)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination paginaAtual={pagina} totalItens={totalOrdens} hrefForPage={hrefForPage} />
          </>
        )}
      </div>
    </>
  );
}
