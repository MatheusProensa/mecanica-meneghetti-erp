import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getEmpresa } from "@/lib/getEmpresa";
import { calcularSituacaoDivida, type SituacaoDivida } from "@/lib/dividas";
import { formatCurrency, formatDate, parseDateInputValue } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import { PAGE_SIZE } from "@/components/ui/Pagination";
import DevedoresResultados from "./DevedoresResultados";

const SITUACOES: { value: SituacaoDivida; label: string }[] = [
  { value: "em_aberto", label: "Em aberto" },
  { value: "pagando", label: "Pagando" },
  { value: "quitado", label: "Quitado" },
];

export default async function DevedoresPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    de?: string;
    ate?: string;
    situacao?: string;
    pagina?: string;
  }>;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verFinanceiro) redirect("/");

  const { q, de, ate, situacao, pagina: paginaRaw } = await searchParams;
  const pagina = Math.max(1, Number(paginaRaw) || 1);

  const dePersonalizado = parseDateInputValue(de);
  const atePersonalizadoBruto = parseDateInputValue(ate);
  const atePersonalizado = atePersonalizadoBruto
    ? new Date(atePersonalizadoBruto.getTime() + 24 * 60 * 60 * 1000)
    : null;

  const where: Prisma.DividaWhereInput = {
    ...(q ? { cliente: { nome: { contains: q, mode: "insensitive" } } } : {}),
    ...(dePersonalizado || atePersonalizado
      ? {
          dataServico: {
            ...(dePersonalizado ? { gte: dePersonalizado } : {}),
            ...(atePersonalizado ? { lt: atePersonalizado } : {}),
          },
        }
      : {}),
  };

  const [empresa, dividas] = await Promise.all([
    getEmpresa(),
    prisma.divida.findMany({
      where,
      include: { cliente: true, pagamentos: true },
      orderBy: { dataServico: "desc" },
    }),
  ]);

  const comSituacao = dividas.map((d) => ({
    ...d,
    ...calcularSituacaoDivida(d.valorOriginal, d.pagamentos),
  }));

  const filtradas = situacao
    ? comSituacao.filter((d) => d.situacao === situacao)
    : comSituacao;

  const totalDividas = filtradas.reduce((s, d) => s + d.valorOriginal, 0);
  const totalRecebido = filtradas.reduce((s, d) => s + d.totalPago, 0);
  const saldoAReceber = filtradas.reduce((s, d) => s + d.saldo, 0);

  const pagAtual = filtradas.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  const periodoLabelPartes: string[] = [];
  if (de || ate) periodoLabelPartes.push(`${de ? formatDate(dePersonalizado) : "..."} a ${ate ? formatDate(atePersonalizadoBruto) : "..."}`);
  if (q) periodoLabelPartes.push(`cliente: "${q}"`);
  if (situacao) periodoLabelPartes.push(SITUACOES.find((s) => s.value === situacao)?.label ?? situacao);
  const periodoLabel = periodoLabelPartes.length > 0 ? periodoLabelPartes.join(" · ") : "Todas as dívidas";

  function devedorHref(overrides: { situacao?: string | null }) {
    const nextSituacao = "situacao" in overrides ? overrides.situacao : situacao;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    if (nextSituacao) params.set("situacao", nextSituacao);
    const qs = params.toString();
    return qs ? `/devedores?${qs}` : "/devedores";
  }

  return (
    <div>
      <PageHeader
        title="Devedores"
        description="Clientes com serviços antigos em aberto — registre pagamentos parciais e acompanhe o saldo."
        action={usuario.permissoes.editar ? { label: "+ Nova dívida", href: "/devedores/novo" } : undefined}
      />

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          icon="alert-triangle"
          iconColor="text-red-600"
          label="Total das dívidas"
          value={formatCurrency(totalDividas)}
        />
        <MetricCard
          icon="trending-up"
          iconColor="text-green-600"
          label="Total recebido"
          value={formatCurrency(totalRecebido)}
        />
        <MetricCard
          icon="clock"
          iconColor="text-amber-600"
          label="Saldo a receber"
          value={formatCurrency(saldoAReceber)}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3">
        {situacao && <input type="hidden" name="situacao" value={situacao} />}
        <div className="flex-1 sm:flex-none">
          <label className="block text-xs font-medium text-gray-500">Cliente</label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            autoComplete="off"
            placeholder="Buscar por nome..."
            className="mt-1 h-[38px] w-full min-w-[180px] rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterLink label="Todas" href={devedorHref({ situacao: null })} active={!situacao} />
        {SITUACOES.map((s) => (
          <FilterLink
            key={s.value}
            label={s.label}
            href={devedorHref({ situacao: s.value })}
            active={situacao === s.value}
          />
        ))}
      </div>

      <DevedoresResultados
        pagAtual={pagAtual.map((d) => ({
          id: d.id,
          clienteNome: d.cliente.nome,
          dataServico: d.dataServico,
          valorOriginal: d.valorOriginal,
          totalPago: d.totalPago,
          saldo: d.saldo,
          situacao: d.situacao,
        }))}
        filtradas={filtradas.map((d) => ({
          id: d.id,
          clienteNome: d.cliente.nome,
          dataServico: d.dataServico,
          valorOriginal: d.valorOriginal,
          totalPago: d.totalPago,
          saldo: d.saldo,
          situacao: d.situacao,
        }))}
        empresa={empresa}
        periodoLabel={periodoLabel}
        pagina={pagina}
        q={q}
        de={de}
        ate={ate}
        situacao={situacao}
      />
    </div>
  );
}

function FilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-blue-600 text-white"
          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}
