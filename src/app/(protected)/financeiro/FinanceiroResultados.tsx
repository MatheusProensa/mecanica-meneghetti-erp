"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import ExportarFinanceiroCsv from "@/components/ExportarFinanceiroCsv";
import ExportarFinanceiroPdf from "@/components/ExportarFinanceiroPdf";
import type { DadosEmpresa } from "@/lib/business";
import type { ResumoFinanceiro } from "@/lib/gerarFinanceiroPdf";

export interface DespesaLinhaTabela {
  id: string;
  descricao: string;
  categoria: string | null;
  fornecedor: string | null;
  data: Date;
  valor: number;
}

export default function FinanceiroResultados({
  pagAtual,
  paraExportar,
  totalDespesas,
  resumo,
  empresa,
  periodoLabel,
  pagina,
  mes,
  ano,
  de,
  ate,
  nomeArquivoCsv,
  nomeArquivoPdf,
}: {
  pagAtual: DespesaLinhaTabela[];
  paraExportar: DespesaLinhaTabela[];
  totalDespesas: number;
  resumo: ResumoFinanceiro;
  empresa: DadosEmpresa;
  periodoLabel: string;
  pagina: number;
  mes?: string;
  ano?: string;
  de?: string;
  ate?: string;
  nomeArquivoCsv: string;
  nomeArquivoPdf: string;
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
    if (mes) params.set("mes", mes);
    if (ano) params.set("ano", ano);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    if (p > 1) params.set("pagina", String(p));
    const qs = params.toString();
    return qs ? `/financeiro?${qs}` : "/financeiro";
  }

  const usandoSelecao = selecionados.size > 0;
  const despesasParaExportar = usandoSelecao
    ? paraExportar.filter((d) => selecionados.has(d.id))
    : paraExportar;

  const todosDaPaginaMarcados =
    pagAtual.length > 0 && pagAtual.every((d) => selecionados.has(d.id));

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">Despesas</h2>
        <div className="flex w-full flex-wrap justify-center gap-2 sm:w-auto sm:justify-start">
          <ExportarFinanceiroCsv
            resumo={resumo}
            despesas={despesasParaExportar}
            nomeArquivo={nomeArquivoCsv}
          />
          <ExportarFinanceiroPdf
            empresa={empresa}
            periodoLabel={periodoLabel}
            resumo={resumo}
            despesas={despesasParaExportar}
            nomeArquivo={nomeArquivoPdf}
          />
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        {usandoSelecao
          ? `${selecionados.size} selecionada${selecionados.size === 1 ? "" : "s"} para exportar`
          : "Nenhuma marcada — a exportação sai com tudo que está filtrado"}
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[var(--shadow-card)]">
        <div className="h-[3px] bg-brand-600" />
        {pagAtual.length === 0 ? (
          <EmptyState
            icon="receipt"
            title="Nenhuma despesa registrada"
            description="Cadastre as despesas da oficina para acompanhar o quanto está saindo por mês."
          />
        ) : (
          <>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="bg-gray-50/80 text-gray-600">
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
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody>
                {pagAtual.map((despesa) => (
                  <tr key={despesa.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="align-middle px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selecionados.has(despesa.id)}
                        onChange={() => toggle(despesa.id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="align-middle px-6 py-3">
                      <Link
                        href={`/financeiro/${despesa.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {despesa.descricao}
                      </Link>
                    </td>
                    <td className="align-middle px-6 py-3 text-gray-600">
                      {despesa.categoria ?? "-"}
                    </td>
                    <td className="align-middle px-6 py-3 text-gray-600">
                      {despesa.fornecedor ?? "-"}
                    </td>
                    <td className="align-middle px-6 py-3 text-gray-600">
                      {formatDate(despesa.data)}
                    </td>
                    <td className="align-middle px-6 py-3 text-gray-600 tabular-nums">
                      {formatCurrency(despesa.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-gray-100 md:hidden">
              {pagAtual.map((despesa) => (
                <div key={despesa.id} className="flex items-start gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selecionados.has(despesa.id)}
                    onChange={() => toggle(despesa.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                  />
                  <Link href={`/financeiro/${despesa.id}`} className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate font-medium text-gray-900">
                        {despesa.descricao}
                      </p>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
                        {formatCurrency(despesa.valor)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm text-gray-600">
                        {despesa.categoria ?? "-"}
                        {despesa.fornecedor ? ` · ${despesa.fornecedor}` : ""}
                      </p>
                      <span className="shrink-0 text-xs text-gray-600">
                        {formatDate(despesa.data)}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <Pagination paginaAtual={pagina} totalItens={totalDespesas} hrefForPage={hrefForPage} />
          </>
        )}
      </div>
    </>
  );
}
