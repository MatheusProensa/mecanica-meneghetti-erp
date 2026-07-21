import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, parseDateInputValue } from "@/lib/format";
import { getCurrentUser } from "@/lib/getCurrentUser";
import DashboardCharts, { type ChartPoint, type Agrupamento } from "@/components/DashboardCharts";
import MetricCard from "@/components/ui/MetricCard";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import DashboardHero from "@/components/DashboardHero";
import AgrupamentoToggle from "@/components/AgrupamentoToggle";
import PeriodoSelector from "@/components/PeriodoSelector";
import { StatusBadge, osStatusMap, notaTipoMap } from "@/components/ui/StatusBadge";

const PERIODOS_DIARIO = [1, 7, 14, 30, 60, 90];
const PERIODOS_SEMANAL = [1, 4, 8, 12, 26];
const PERIODOS_MENSAL = [1, 3, 6, 12];
const PERIODO_PADRAO: Record<Agrupamento, number> = { diario: 30, semanal: 8, mensal: 6 };
const UM_DIA_MS = 24 * 60 * 60 * 1000;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Início da semana (segunda-feira) que contém a data informada. */
function startOfWeek(d: Date) {
  const data = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diaSemana = data.getDay();
  const deslocamento = diaSemana === 0 ? -6 : 1 - diaSemana;
  data.setDate(data.getDate() + deslocamento);
  return data;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function rotuloDia(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

/** Gera os intervalos (dia/semana/mês) que cobrem [inicio, fim], com o rótulo de cada um. */
function gerarBuckets(inicio: Date, fim: Date, agrupamento: Agrupamento) {
  const buckets: { inicio: Date; fim: Date; rotulo: string }[] = [];

  if (agrupamento === "mensal") {
    let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    while (cursor <= fim) {
      const fimBucket = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      buckets.push({
        inicio: cursor,
        fim: fimBucket,
        rotulo: cursor.toLocaleDateString("pt-BR", { month: "short" }),
      });
      cursor = fimBucket;
    }
  } else if (agrupamento === "semanal") {
    let cursor = startOfWeek(inicio);
    while (cursor <= fim) {
      const fimBucket = new Date(cursor.getTime() + 7 * UM_DIA_MS);
      buckets.push({ inicio: cursor, fim: fimBucket, rotulo: rotuloDia(cursor) });
      cursor = fimBucket;
    }
  } else {
    let cursor = startOfDay(inicio);
    const fimDia = startOfDay(fim);
    while (cursor <= fimDia) {
      const fimBucket = new Date(cursor.getTime() + UM_DIA_MS);
      buckets.push({ inicio: cursor, fim: fimBucket, rotulo: rotuloDia(cursor) });
      cursor = fimBucket;
    }
  }

  return buckets;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; agrupamento?: string; de?: string; ate?: string }>;
}) {
  const {
    periodo: periodoRaw,
    agrupamento: agrupamentoRaw,
    de,
    ate,
  } = await searchParams;

  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verDashboard) {
    const destino = usuario.permissoes.verClientes
      ? "/clientes"
      : usuario.permissoes.verOS
        ? "/os"
        : usuario.permissoes.verFinanceiro
          ? "/financeiro"
          : usuario.permissoes.verDevedores
            ? "/devedores"
            : usuario.permissoes.verExtras
              ? "/extras"
              : usuario.permissoes.verNotas
                ? "/notas"
                : usuario.permissoes.acessarConfiguracoes
                  ? "/configuracoes"
                  : "/ajuda";
    redirect(destino);
  }
  const verFinanceiro = usuario.permissoes.verFinanceiro;

  const agrupamento: Agrupamento =
    agrupamentoRaw === "diario" ? "diario" : agrupamentoRaw === "semanal" ? "semanal" : "mensal";

  const periodosValidos =
    agrupamento === "diario" ? PERIODOS_DIARIO : agrupamento === "semanal" ? PERIODOS_SEMANAL : PERIODOS_MENSAL;
  const periodo = periodosValidos.includes(Number(periodoRaw))
    ? Number(periodoRaw)
    : PERIODO_PADRAO[agrupamento];

  const now = new Date();
  const inicioMes = startOfMonth(now);
  const inicioSemanaAtual = startOfWeek(now);

  const dePersonalizado = parseDateInputValue(de);
  const atePersonalizado = parseDateInputValue(ate);
  const modoPersonalizado = periodoRaw === "personalizado";
  const usarPersonalizado = Boolean(
    modoPersonalizado && dePersonalizado && atePersonalizado && dePersonalizado <= atePersonalizado
  );

  let inicioPeriodo: Date;
  let fimPeriodo: Date;
  if (usarPersonalizado && dePersonalizado && atePersonalizado) {
    inicioPeriodo = dePersonalizado;
    fimPeriodo = atePersonalizado;
  } else {
    fimPeriodo = now;
    if (agrupamento === "diario") {
      inicioPeriodo = new Date(startOfDay(now).getTime() - (periodo - 1) * UM_DIA_MS);
    } else if (agrupamento === "semanal") {
      inicioPeriodo = new Date(inicioSemanaAtual.getTime() - (periodo - 1) * 7 * UM_DIA_MS);
    } else {
      inicioPeriodo = new Date(now.getFullYear(), now.getMonth() - (periodo - 1), 1);
    }
  }

  const fimConsultaPeriodo = new Date(startOfDay(fimPeriodo).getTime() + UM_DIA_MS);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const fimSemanaAtual = new Date(inicioSemanaAtual.getTime() + 7 * UM_DIA_MS);
  const fimDiaAtual = new Date(startOfDay(now).getTime() + UM_DIA_MS);

  /** Os cards de resumo mostram sempre a unidade atual do agrupamento
   * escolhido (hoje / esta semana / este mês) — não acompanham quantos
   * períodos o gráfico está exibindo, já que o gráfico existe pra ver
   * tendência (janela ampla) e os cards pra ver a situação corrente. Só
   * seguem um intervalo personalizado quando ele é escolhido de propósito. */
  const inicioResumo = usarPersonalizado
    ? inicioPeriodo
    : agrupamento === "diario"
      ? startOfDay(now)
      : agrupamento === "semanal"
        ? inicioSemanaAtual
        : inicioMes;
  const fimResumo = usarPersonalizado
    ? fimConsultaPeriodo
    : agrupamento === "diario"
      ? fimDiaAtual
      : agrupamento === "semanal"
        ? fimSemanaAtual
        : fimMes;

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
    osAtrasadasCount,
  ] = await Promise.all([
    prisma.ordemServico.findMany({
      where: { data: { gte: inicioPeriodo, lt: fimConsultaPeriodo } },
      include: { itens: true },
    }),
    prisma.ordemServico.count({ where: { status: "aberta" } }),
    prisma.ordemServico.count({ where: { status: "em_andamento" } }),
    prisma.ordemServico.count({
      where: { status: "concluida", updatedAt: { gte: inicioResumo, lt: fimResumo } },
    }),
    prisma.nota.count({ where: { createdAt: { gte: inicioResumo, lt: fimResumo } } }),
    prisma.nota.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.ordemServico.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { cliente: true, itens: true },
    }),
    prisma.ordemServico.findMany({
      where: { pago: true, dataPagamento: { gte: inicioResumo, lt: fimResumo } },
      include: { itens: true },
    }),
    prisma.ordemServico.findMany({
      where: { pago: false, status: { not: "cancelada" } },
      include: { itens: true },
    }),
    prisma.despesa.aggregate({
      where: { data: { gte: inicioResumo, lt: fimResumo } },
      _sum: { valor: true },
    }),
    prisma.ordemServico.count({
      where: { pago: false, status: { not: "cancelada" }, previsaoEntrega: { lt: now } },
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
  const rotuloResumo = usarPersonalizado
    ? "no período"
    : agrupamento === "diario"
      ? "hoje"
      : agrupamento === "semanal"
        ? "esta semana"
        : "este mês";
  const contextoResumo = usarPersonalizado
    ? `${formatDate(inicioPeriodo)} a ${formatDate(fimPeriodo)}`
    : undefined;

  const chartData: ChartPoint[] = gerarBuckets(inicioPeriodo, fimPeriodo, agrupamento).map(
    (bucket) => ({
      rotulo: bucket.rotulo,
      faturamento: ordensDoPeriodo
        .filter((os) => os.data >= bucket.inicio && os.data < bucket.fim)
        .reduce((sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0), 0),
    })
  );

  const periodoLabel = usarPersonalizado
    ? `${inicioPeriodo.toLocaleDateString("pt-BR")} a ${fimPeriodo.toLocaleDateString("pt-BR")}`
    : agrupamento === "diario"
      ? periodo === 1
        ? "hoje"
        : `últimos ${periodo} dias`
      : agrupamento === "semanal"
        ? periodo === 1
          ? "esta semana"
          : `últimas ${periodo} semanas`
        : periodo === 1
          ? "este mês"
          : `últimos ${periodo} meses`;

  const movimentacoes = [
    ...ultimasNotas.map((n) => ({
      id: `nota-${n.id}`,
      href: `/notas/${n.id}`,
      tipoLabel: "Nota",
      descricao: n.numero,
      data: n.createdAt,
      badge: notaTipoMap[n.tipo],
      valor: n.valor,
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
      <DashboardHero nome={usuario.name} agora={now} />

      {verFinanceiro && (
        <div className="flex justify-end">
          <AgrupamentoToggle agrupamento={agrupamento} personalizado={modoPersonalizado} />
        </div>
      )}

      {verFinanceiro && (
        <div>
          <SectionHeader
            icon="wallet"
            iconColor="text-green-600"
            title="Financeiro"
            action={{ label: "Ver detalhes →", href: "/financeiro" }}
          />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              icon="trending-up"
              iconColor="text-green-600"
              label={`Recebido ${rotuloResumo}`}
              value={formatCurrency(recebidoNoMes)}
              context={contextoResumo}
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
              label={`Despesas ${rotuloResumo}`}
              value={formatCurrency(despesasNoMes)}
              context={contextoResumo}
            />
            <Link href="/os?pagamento=atrasado" className="block">
              <MetricCard
                icon="alert-triangle"
                iconColor="text-red-600"
                label="OS atrasadas"
                value={osAtrasadasCount}
                context={osAtrasadasCount > 0 ? "cobrança vencida" : "tudo em dia"}
                highlight={osAtrasadasCount > 0 ? "danger" : undefined}
              />
            </Link>
          </div>
        </div>
      )}

      <div>
        <SectionHeader icon="tools" iconColor="text-blue-600" title="Operacional" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
          label={`OS concluídas ${rotuloResumo}`}
          value={osConcluidasNoMes}
          context={contextoResumo}
        />
        <MetricCard
          icon="file-text"
          iconColor="text-gray-500"
          label={`Notas anexadas ${rotuloResumo}`}
          value={notasNoMes}
          context={contextoResumo}
          className="col-span-2 lg:col-span-1"
        />
        </div>
      </div>

      {verFinanceiro && (
        <div>
          <div className="flex justify-end">
            <PeriodoSelector
              agrupamento={agrupamento}
              periodo={periodoRaw === "personalizado" ? "personalizado" : String(periodo)}
              de={de}
              ate={ate}
            />
          </div>
          <div className="mt-3">
            <DashboardCharts data={chartData} periodoLabel={periodoLabel} />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <SectionHeader
            icon="inbox"
            iconColor="text-gray-600"
            title="Últimas movimentações"
            action={{ label: "Ver todas →", href: "/os" }}
          />
        </div>

        {movimentacoes.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Nenhuma movimentação registrada ainda"
            description="Cadastre uma OS ou uma nota para começar a ver o histórico aqui."
          />
        ) : (
          <>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="bg-gray-50/80 text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
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

            <div className="divide-y divide-gray-100 md:hidden">
              {movimentacoes.map((m) => (
                <Link
                  key={m.id}
                  href={m.href}
                  className="flex flex-col gap-1 px-4 py-3 active:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate font-medium text-gray-900">
                      {m.descricao}
                    </p>
                    {m.valor !== null && (
                      <span className="shrink-0 text-sm font-semibold text-gray-900">
                        {formatCurrency(m.valor)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge
                        label={m.tipoLabel}
                        tone={m.tipoLabel === "OS" ? "gray" : "blue"}
                      />
                      <StatusBadge label={m.badge.label} tone={m.badge.tone} />
                    </div>
                    <span className="shrink-0 text-xs text-gray-500">{formatDate(m.data)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
