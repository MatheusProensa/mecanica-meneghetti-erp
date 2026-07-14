import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import DashboardCharts, { type MonthlyPoint } from "@/components/DashboardCharts";
import MetricCard from "@/components/ui/MetricCard";
import EmptyState from "@/components/ui/EmptyState";
import PeriodFilter from "@/components/PeriodFilter";
import { StatusBadge, osStatusMap, notaTipoMap } from "@/components/ui/StatusBadge";

const PERIODOS_VALIDOS = [1, 3, 6, 12];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo: periodoRaw } = await searchParams;
  const periodo = PERIODOS_VALIDOS.includes(Number(periodoRaw))
    ? Number(periodoRaw)
    : 6;

  const now = new Date();
  const inicioMes = startOfMonth(now);
  const inicioPeriodo = new Date(now.getFullYear(), now.getMonth() - (periodo - 1), 1);

  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    ordensDoPeriodo,
    osAbertaCount,
    osEmAndamentoCount,
    osConcluidasNoMes,
    notasNoMes,
    ultimasNotas,
    ultimasOS,
    osPagasNoMes,
    osAReceber,
    despesasNoMesAgg,
  ] = await Promise.all([
    prisma.ordemServico.findMany({
      where: { data: { gte: inicioPeriodo } },
      include: { itens: true },
    }),
    prisma.ordemServico.count({ where: { status: "aberta" } }),
    prisma.ordemServico.count({ where: { status: "em_andamento" } }),
    prisma.ordemServico.count({
      where: { status: "concluida", updatedAt: { gte: inicioMes } },
    }),
    prisma.nota.count({ where: { createdAt: { gte: inicioMes } } }),
    prisma.nota.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.ordemServico.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { cliente: true, itens: true },
    }),
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
  ]);

  const recebidoNoMes = osPagasNoMes.reduce(
    (sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0),
    0
  );
  const aReceber = osAReceber.reduce(
    (sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0),
    0
  );
  const despesasNoMes = despesasNoMesAgg._sum.valor ?? 0;

  const osAbertasCount = osAbertaCount + osEmAndamentoCount;

  const faturamentoNoMes = ordensDoPeriodo
    .filter((os) => os.data >= inicioMes)
    .reduce((sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0), 0);

  const monthlyData: MonthlyPoint[] = [];
  for (let i = periodo - 1; i >= 0; i--) {
    const mesInicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mesFim = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const osDoMes = ordensDoPeriodo.filter(
      (os) => os.data >= mesInicio && os.data < mesFim
    );
    monthlyData.push({
      mes: mesInicio.toLocaleDateString("pt-BR", { month: "short" }),
      faturamento: osDoMes.reduce(
        (sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0),
        0
      ),
    });
  }

  const movimentacoes = [
    ...ultimasNotas.map((n) => ({
      id: `nota-${n.id}`,
      href: `/notas/${n.id}`,
      tipoLabel: "Nota",
      descricao: n.numero,
      data: n.createdAt,
      badge: notaTipoMap[n.tipo],
      valor: null as number | null,
    })),
    ...ultimasOS.map((os) => ({
      id: `os-${os.id}`,
      href: `/os/${os.id}`,
      tipoLabel: "OS",
      descricao: `#${String(os.id).padStart(4, "0")} — ${os.cliente.nome}`,
      data: os.createdAt,
      badge: osStatusMap[os.status],
      valor: os.itens.reduce((s, i) => s + i.valor, 0),
    })),
  ]
    .sort((a, b) => b.data.getTime() - a.data.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <PeriodFilter value={String(periodo)} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Financeiro</h2>
          <Link href="/financeiro" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Ver detalhes →
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            value={formatCurrency(despesasNoMes)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon="trending-up"
          iconColor="text-green-600"
          label="Faturamento no mês"
          value={formatCurrency(faturamentoNoMes)}
        />
        <MetricCard
          icon="tools"
          iconColor="text-blue-600"
          label="OS abertas"
          value={osAbertasCount}
          context={`${osEmAndamentoCount} em andamento`}
        />
        <MetricCard
          icon="chart-bar"
          iconColor="text-green-600"
          label="OS concluídas no mês"
          value={osConcluidasNoMes}
        />
        <MetricCard
          icon="file-text"
          iconColor="text-gray-500"
          label="Notas anexadas no mês"
          value={notasNoMes}
        />
      </div>

      <DashboardCharts data={monthlyData} periodo={periodo} />

      <div className="rounded-[10px] border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Últimas movimentações</h2>
          <Link href="/os" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Ver todas →
          </Link>
        </div>

        {movimentacoes.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Nenhuma movimentação registrada ainda"
            description="Cadastre uma OS ou uma nota para começar a ver o histórico aqui."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((m) => (
                <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <StatusBadge
                      label={m.tipoLabel}
                      tone={m.tipoLabel === "OS" ? "gray" : "blue"}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <Link href={m.href} className="font-medium text-gray-900 hover:underline">
                      {m.descricao}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{formatDate(m.data)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge label={m.badge.label} tone={m.badge.tone} />
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {m.valor !== null ? formatCurrency(m.valor) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
