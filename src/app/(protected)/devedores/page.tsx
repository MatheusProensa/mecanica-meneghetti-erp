import Link from "next/link";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getEmpresa } from "@/lib/getEmpresa";
import { calcularSituacaoDivida, dataMaisAntigaItem, type SituacaoDivida } from "@/lib/dividas";
import { formatCurrency, formatDate, parseDateInputValue } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import PageHero from "@/components/ui/PageHero";
import MetricCard from "@/components/ui/MetricCard";
import ValorOculto from "@/components/ui/ValorOculto";
import CountUp from "@/components/ui/CountUp";
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
  if (!usuario.permissoes.verDevedores) redirect("/");

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
          itens: {
            some: {
              data: {
                ...(dePersonalizado ? { gte: dePersonalizado } : {}),
                ...(atePersonalizado ? { lt: atePersonalizado } : {}),
              },
            },
          },
        }
      : {}),
  };

  const [empresa, dividas] = await Promise.all([
    getEmpresa(),
    prisma.divida.findMany({
      where,
      include: { cliente: true, pagamentos: true, itens: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const comSituacao = dividas
    .map((d) => ({
      ...d,
      ...calcularSituacaoDivida(d.itens, d.pagamentos),
      dataServico: dataMaisAntigaItem(d.itens) ?? d.createdAt,
    }))
    .sort((a, b) => b.dataServico.getTime() - a.dataServico.getTime());

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
  const periodoLabel = periodoLabelPartes.join(" · ");

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
      <PageHero
        title="Devedores"
        description="Clientes com serviços antigos em aberto — registre pagamentos parciais e acompanhe o saldo."
        action={usuario.permissoes.editarDevedores ? { label: "+ Nova dívida", href: "/devedores/novo" } : undefined}
      />

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          icon="alert-triangle"
          iconColor="text-red-600"
          label="Total das dívidas"
          value={<ValorOculto><CountUp value={totalDividas} format={formatCurrency} /></ValorOculto>}
        />
        <MetricCard
          icon="trending-up"
          iconColor="text-green-600"
          label="Total recebido"
          value={<ValorOculto><CountUp value={totalRecebido} format={formatCurrency} /></ValorOculto>}
        />
        <MetricCard
          icon="clock"
          iconColor="text-amber-600"
          label="Saldo a receber"
          value={<ValorOculto><CountUp value={saldoAReceber} format={formatCurrency} /></ValorOculto>}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3">
        {situacao && <input type="hidden" name="situacao" value={situacao} />}
        <div className="flex-1 sm:flex-none">
          <label className="block text-xs font-medium text-gray-500">Cliente</label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              autoComplete="off"
              placeholder="Buscar por nome..."
              className="h-[38px] w-full min-w-[180px] rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
          ? "bg-brand-600 text-white"
          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}
