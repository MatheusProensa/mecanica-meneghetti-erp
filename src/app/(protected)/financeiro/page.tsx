import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MetricCard from "@/components/ui/MetricCard";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>;
}) {
  const { mes, ano } = await searchParams;

  const now = new Date();
  const inicioMes = startOfMonth(now);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const anoAtual = now.getFullYear();
  const anosDisponiveis = Array.from({ length: 5 }, (_, i) => anoAtual - i);

  const mesNum = mes ? Number(mes) : null;
  const anoNum = ano ? Number(ano) : null;
  const periodo =
    mesNum && anoNum
      ? { gte: new Date(anoNum, mesNum - 1, 1), lt: new Date(anoNum, mesNum, 1) }
      : anoNum
        ? { gte: new Date(anoNum, 0, 1), lt: new Date(anoNum + 1, 0, 1) }
        : undefined;

  const where: Prisma.DespesaWhereInput = periodo ? { data: periodo } : {};

  const [osPagasNoMes, osAReceber, despesasNoMes, funcionariosNoMesAgg, despesas] =
    await Promise.all([
      prisma.ordemServico.findMany({
        where: { pago: true, dataPagamento: { gte: inicioMes, lt: fimMes } },
        include: { itens: true },
      }),
      prisma.ordemServico.findMany({
        where: { pago: false, status: { not: "cancelada" } },
        include: { itens: true },
      }),
      prisma.despesa.aggregate({
        where: { data: { gte: inicioMes, lt: fimMes } },
        _sum: { valor: true },
      }),
      prisma.despesa.aggregate({
        where: { data: { gte: inicioMes, lt: fimMes }, categoria: "Funcionários" },
        _sum: { valor: true },
      }),
      prisma.despesa.findMany({ where, orderBy: { data: "desc" } }),
    ]);

  const recebidoNoMes = osPagasNoMes.reduce(
    (sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0),
    0
  );
  const aReceber = osAReceber.reduce(
    (sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0),
    0
  );
  const despesasTotal = despesasNoMes._sum.valor ?? 0;
  const funcionariosNoMes = funcionariosNoMesAgg._sum.valor ?? 0;
  const lucroNoMes = recebidoNoMes - despesasTotal;

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Visão geral do que entrou, do que ainda falta receber e das despesas da oficina."
        action={{ label: "+ Nova despesa", href: "/financeiro/nova" }}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon="trending-up"
          iconColor="text-green-600"
          label="Recebido no mês"
          value={formatCurrency(recebidoNoMes)}
        />
        <MetricCard
          icon="clock"
          iconColor="text-amber-600"
          label="A receber"
          value={formatCurrency(aReceber)}
          context={`${osAReceber.length} OS em aberto`}
        />
        <MetricCard
          icon="trending-down"
          iconColor="text-red-600"
          label="Despesas no mês"
          value={formatCurrency(despesasTotal)}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          icon="users"
          iconColor="text-gray-500"
          label="Gasto com funcionários no mês"
          value={formatCurrency(funcionariosNoMes)}
        />
        <MetricCard
          icon="wallet"
          iconColor={lucroNoMes >= 0 ? "text-green-600" : "text-red-600"}
          label="Lucro no mês"
          value={formatCurrency(lucroNoMes)}
          context="Recebido − Despesas"
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Despesas</h2>
      </div>

      <form className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500">Mês</label>
          <select
            name="mes"
            defaultValue={mes ?? ""}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {MESES.map((label, i) => (
              <option key={label} value={i + 1}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Ano</label>
          <select
            name="ano"
            defaultValue={ano ?? ""}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {anosDisponiveis.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {despesas.length === 0 ? (
          <EmptyState
            icon="receipt"
            title="Nenhuma despesa registrada"
            description="Cadastre as despesas da oficina para acompanhar o quanto está saindo por mês."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
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
              {despesas.map((despesa) => (
                <tr key={despesa.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link
                      href={`/financeiro/${despesa.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {despesa.descricao}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{despesa.categoria ?? "-"}</td>
                  <td className="px-6 py-3 text-gray-500">{despesa.fornecedor ?? "-"}</td>
                  <td className="px-6 py-3 text-gray-500">{formatDate(despesa.data)}</td>
                  <td className="px-6 py-3 text-gray-500">{formatCurrency(despesa.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
