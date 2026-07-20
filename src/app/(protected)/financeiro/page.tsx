import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getEmpresa } from "@/lib/getEmpresa";
import { formatCurrency, parseDateInputValue, formatDate } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import { PAGE_SIZE } from "@/components/ui/Pagination";
import FinanceiroResultados from "./FinanceiroResultados";

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
  searchParams: Promise<{
    mes?: string;
    ano?: string;
    de?: string;
    ate?: string;
    pagina?: string;
  }>;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verFinanceiro) redirect("/");

  const { mes, ano, de, ate, pagina: paginaRaw } = await searchParams;
  const pagina = Math.max(1, Number(paginaRaw) || 1);

  const now = new Date();
  const inicioMes = startOfMonth(now);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const anoAtual = now.getFullYear();
  const anosDisponiveis = Array.from({ length: 5 }, (_, i) => anoAtual - i);

  const dePersonalizado = parseDateInputValue(de);
  const atePersonalizadoBruto = parseDateInputValue(ate);
  const atePersonalizado = atePersonalizadoBruto
    ? new Date(atePersonalizadoBruto.getTime() + 24 * 60 * 60 * 1000)
    : null;
  const usarPersonalizado = Boolean(
    dePersonalizado && atePersonalizado && dePersonalizado < atePersonalizado
  );

  const mesNum = mes ? Number(mes) : null;
  const anoNum = ano ? Number(ano) : null;
  const periodo = usarPersonalizado
    ? { gte: dePersonalizado!, lt: atePersonalizado! }
    : mesNum && anoNum
      ? { gte: new Date(anoNum, mesNum - 1, 1), lt: new Date(anoNum, mesNum, 1) }
      : anoNum
        ? { gte: new Date(anoNum, 0, 1), lt: new Date(anoNum + 1, 0, 1) }
        : undefined;

  const where: Prisma.DespesaWhereInput = periodo ? { data: periodo } : {};

  const periodoLabel = usarPersonalizado
    ? `${formatDate(dePersonalizado!)} a ${formatDate(atePersonalizadoBruto!)}`
    : mesNum && anoNum
      ? `${MESES[mesNum - 1]} de ${anoNum}`
      : anoNum
        ? `Ano de ${anoNum}`
        : "Todos os períodos";

  const [
    empresa,
    osPagasNoMes,
    osAReceber,
    despesasNoMes,
    funcionariosNoMesAgg,
    despesas,
    totalDespesas,
    despesasParaExport,
  ] = await Promise.all([
      getEmpresa(),
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
      prisma.despesa.findMany({
        where,
        orderBy: { data: "desc" },
        skip: (pagina - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.despesa.count({ where }),
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

  const nomeArquivoCsv = usarPersonalizado
    ? `financeiro-${de}-a-${ate}.csv`
    : `financeiro-${ano ?? anoAtual}${mes ? `-${mes.padStart(2, "0")}` : ""}.csv`;
  const nomeArquivoPdf = usarPersonalizado
    ? `financeiro-${de}-a-${ate}.pdf`
    : `financeiro-${ano ?? anoAtual}${mes ? `-${mes.padStart(2, "0")}` : ""}.pdf`;

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Visão geral do que entrou, do que ainda falta receber e das despesas da oficina."
        action={
          usuario.permissoes.editar
            ? { label: "+ Nova despesa", href: "/financeiro/nova" }
            : undefined
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
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
        <MetricCard
          icon="users"
          iconColor="text-gray-500"
          label="Funcionários no mês"
          value={formatCurrency(funcionariosNoMes)}
        />
        <MetricCard
          icon="wallet"
          iconColor={lucroNoMes >= 0 ? "text-green-600" : "text-red-600"}
          label="Lucro no mês"
          value={formatCurrency(lucroNoMes)}
          context="Recebido − Despesas"
          highlight={lucroNoMes >= 0 ? "success" : "danger"}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <form className="mt-8 flex flex-wrap items-end gap-3">
        <div className="flex flex-1 gap-3 sm:flex-none">
          <div className="flex-1 sm:w-36 sm:flex-none">
            <label className="block text-xs font-medium text-gray-500">Mês</label>
            <select
              name="mes"
              defaultValue={mes ?? ""}
              className="mt-1 h-[38px] w-full rounded-lg border border-gray-300 px-3 text-sm"
            >
              <option value="">Todos</option>
              {MESES.map((label, i) => (
                <option key={label} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 sm:w-24 sm:flex-none">
            <label className="block text-xs font-medium text-gray-500">Ano</label>
            <select
              name="ano"
              defaultValue={ano ?? ""}
              className="mt-1 h-[38px] w-full rounded-lg border border-gray-300 px-3 text-sm"
            >
              <option value="">Todos</option>
              {anosDisponiveis.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-1 gap-3 sm:flex-none">
          <div className="flex-1 sm:w-40 sm:flex-none">
            <label className="block text-xs font-medium text-gray-500">De</label>
            <input
              type="date"
              name="de"
              defaultValue={de ?? ""}
              className="mt-1 h-[38px] w-full rounded-lg border border-gray-300 px-3 text-sm"
            />
          </div>
          <div className="flex-1 sm:w-40 sm:flex-none">
            <label className="block text-xs font-medium text-gray-500">Até</label>
            <input
              type="date"
              name="ate"
              defaultValue={ate ?? ""}
              className="mt-1 h-[38px] w-full rounded-lg border border-gray-300 px-3 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="h-[38px] rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Filtrar
        </button>
      </form>
      {usarPersonalizado && (
        <p className="mt-2 text-xs text-gray-500">
          Mostrando o intervalo personalizado — o filtro de Mês/Ano fica em segundo plano enquanto
          &quot;De&quot;/&quot;Até&quot; estiverem preenchidos.
        </p>
      )}

      <FinanceiroResultados
        pagAtual={despesas}
        paraExportar={despesasParaExport}
        totalDespesas={totalDespesas}
        resumo={{ recebidoNoMes, aReceber, despesasTotal, funcionariosNoMes, lucroNoMes }}
        empresa={empresa}
        periodoLabel={periodoLabel}
        pagina={pagina}
        mes={mes}
        ano={ano}
        de={de}
        ate={ate}
        nomeArquivoCsv={nomeArquivoCsv}
        nomeArquivoPdf={nomeArquivoPdf}
      />
    </div>
  );
}
