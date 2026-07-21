"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge, situacaoDividaMap } from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import ExportarDevedoresPdf from "@/components/ExportarDevedoresPdf";
import ExportarDevedoresCsv from "@/components/ExportarDevedoresCsv";
import type { DadosEmpresa } from "@/lib/business";
import type { SituacaoDivida } from "@/lib/dividas";

export interface DividaLinha {
  id: string;
  clienteNome: string;
  dataServico: Date;
  valorOriginal: number;
  totalPago: number;
  saldo: number;
  situacao: SituacaoDivida;
}

export default function DevedoresResultados({
  pagAtual,
  filtradas,
  empresa,
  periodoLabel,
  pagina,
  q,
  de,
  ate,
  situacao,
}: {
  pagAtual: DividaLinha[];
  filtradas: DividaLinha[];
  empresa: DadosEmpresa;
  periodoLabel: string;
  pagina: number;
  q?: string;
  de?: string;
  ate?: string;
  situacao?: string;
}) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTodosDaPagina() {
    setSelecionados((prev) => {
      const todosMarcados = pagAtual.every((d) => prev.has(d.id));
      const next = new Set(prev);
      for (const d of pagAtual) {
        if (todosMarcados) next.delete(d.id);
        else next.add(d.id);
      }
      return next;
    });
  }

  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    if (situacao) params.set("situacao", situacao);
    if (p > 1) params.set("pagina", String(p));
    const qs = params.toString();
    return qs ? `/devedores?${qs}` : "/devedores";
  }

  const usandoSelecao = selecionados.size > 0;
  const dividasParaExportar = usandoSelecao
    ? filtradas.filter((d) => selecionados.has(d.id))
    : filtradas;

  const resumoParaExportar = {
    totalDividas: dividasParaExportar.reduce((s, d) => s + d.valorOriginal, 0),
    totalRecebido: dividasParaExportar.reduce((s, d) => s + d.totalPago, 0),
    saldoAReceber: dividasParaExportar.reduce((s, d) => s + d.saldo, 0),
  };

  const todosDaPaginaMarcados =
    pagAtual.length > 0 && pagAtual.every((d) => selecionados.has(d.id));

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {usandoSelecao
            ? `${selecionados.size} selecionado${selecionados.size === 1 ? "" : "s"} para o PDF`
            : "Nenhum marcado — o PDF sai com tudo que está filtrado"}
        </p>
        <div className="flex items-center gap-2">
          <ExportarDevedoresCsv
            resumo={resumoParaExportar}
            dividas={dividasParaExportar.map((d) => ({
              clienteNome: d.clienteNome,
              dataServico: d.dataServico,
              valorOriginal: d.valorOriginal,
              totalPago: d.totalPago,
              saldo: d.saldo,
              situacao: d.situacao,
            }))}
            nomeArquivo={`devedores-${new Date().toISOString().slice(0, 10)}.csv`}
          />
          <ExportarDevedoresPdf
            empresa={empresa}
            periodoLabel={periodoLabel}
            resumo={resumoParaExportar}
            dividas={dividasParaExportar.map((d) => ({
              clienteNome: d.clienteNome,
              dataServico: d.dataServico,
              valorOriginal: d.valorOriginal,
              totalPago: d.totalPago,
              saldo: d.saldo,
              situacao: d.situacao,
            }))}
            nomeArquivo={`devedores-${new Date().toISOString().slice(0, 10)}.pdf`}
          />
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[var(--shadow-card)]">
        <div className="h-[3px] bg-brand-600" />
        {pagAtual.length === 0 ? (
          <EmptyState
            icon="user-x"
            title="Nenhuma dívida encontrada"
            description="Cadastre a primeira dívida antiga pra começar a acompanhar o pagamento parcelado."
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
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Data do serviço
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Valor original
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Pago</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Saldo restante
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Situação
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagAtual.map((d) => (
                  <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selecionados.has(d.id)}
                        onChange={() => toggle(d.id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/devedores/${d.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {d.clienteNome}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(d.dataServico)}</td>
                    <td className="px-6 py-3 text-gray-500 tabular-nums">{formatCurrency(d.valorOriginal)}</td>
                    <td className="px-6 py-3 text-gray-500 tabular-nums">{formatCurrency(d.totalPago)}</td>
                    <td className="px-6 py-3 font-medium tabular-nums text-gray-900">
                      {formatCurrency(d.saldo)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge {...situacaoDividaMap[d.situacao]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-gray-100 md:hidden">
              {pagAtual.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3 active:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selecionados.has(d.id)}
                    onChange={() => toggle(d.id)}
                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                  />
                  <Link href={`/devedores/${d.id}`} className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate font-medium text-gray-900">
                        {d.clienteNome}
                      </span>
                      <StatusBadge {...situacaoDividaMap[d.situacao]} />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">{formatDate(d.dataServico)}</span>
                      <span className="text-sm font-semibold tabular-nums text-gray-900">
                        Saldo: {formatCurrency(d.saldo)}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <Pagination paginaAtual={pagina} totalItens={filtradas.length} hrefForPage={hrefForPage} />
          </>
        )}
      </div>
    </>
  );
}
