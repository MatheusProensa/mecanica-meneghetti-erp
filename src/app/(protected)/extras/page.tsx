import Link from "next/link";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getEmpresa } from "@/lib/getEmpresa";
import { calcularStatusExtra, type StatusExtra } from "@/lib/extras";
import { formatCurrency, formatDate, parseDateInputValue } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import PageHero from "@/components/ui/PageHero";
import EmptyState from "@/components/ui/EmptyState";
import MetricCard from "@/components/ui/MetricCard";
import ValorOculto from "@/components/ui/ValorOculto";
import CountUp from "@/components/ui/CountUp";
import Pagination, { PAGE_SIZE } from "@/components/ui/Pagination";
import { StatusBadge, statusExtraMap } from "@/components/ui/StatusBadge";
import ExportarExtrasPdf from "@/components/ExportarExtrasPdf";

const STATUS_OPCOES: { value: StatusExtra; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "parcialmente_pago", label: "Parcialmente pago" },
  { value: "pago", label: "Pago" },
];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function ExtrasPage({
  searchParams,
}: {
  searchParams: Promise<{
    funcionarioId?: string;
    q?: string;
    de?: string;
    ate?: string;
    situacao?: string;
    pagina?: string;
  }>;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verExtras) redirect("/");

  const { funcionarioId, q, de, ate, situacao, pagina: paginaRaw } = await searchParams;
  const pagina = Math.max(1, Number(paginaRaw) || 1);

  const now = new Date();
  const inicioMes = startOfMonth(now);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const dePersonalizado = parseDateInputValue(de);
  const atePersonalizadoBruto = parseDateInputValue(ate);
  const atePersonalizado = atePersonalizadoBruto
    ? new Date(atePersonalizadoBruto.getTime() + 24 * 60 * 60 * 1000)
    : null;

  const where: Prisma.ExtraFuncionarioWhereInput = {
    ...(funcionarioId ? { mecanicoId: funcionarioId } : {}),
    ...(q ? { cliente: { nome: { contains: q, mode: "insensitive" } } } : {}),
    ...(dePersonalizado || atePersonalizado
      ? {
          data: {
            ...(dePersonalizado ? { gte: dePersonalizado } : {}),
            ...(atePersonalizado ? { lt: atePersonalizado } : {}),
          },
        }
      : {}),
  };

  const [empresa, mecanicos, extrasNoMes, extras] = await Promise.all([
    getEmpresa(),
    prisma.mecanico.findMany({ orderBy: { nome: "asc" } }),
    prisma.extraFuncionario.findMany({
      where: { data: { gte: inicioMes, lt: fimMes } },
      include: { pagamentos: true },
    }),
    prisma.extraFuncionario.findMany({
      where,
      include: { mecanico: true, cliente: true, ordemServico: true, pagamentos: true },
      orderBy: { data: "desc" },
    }),
  ]);

  const resumosNoMes = extrasNoMes.map((e) =>
    calcularStatusExtra(e.valorServico, e.valorExtra, e.outrosCustos, e.pagamentos)
  );
  const totalExtrasNoMes = extrasNoMes.reduce((s, e) => s + e.valorExtra, 0);
  const pagoNoMes = resumosNoMes.reduce((s, r) => s + r.totalPago, 0);
  const faltaPagarNoMes = totalExtrasNoMes - pagoNoMes;
  const lucroEmpresaNoMes = resumosNoMes.reduce((s, r) => s + r.lucroEmpresa, 0);

  const comStatus = extras.map((e) => ({
    ...e,
    ...calcularStatusExtra(e.valorServico, e.valorExtra, e.outrosCustos, e.pagamentos),
  }));

  const filtrados = situacao ? comStatus.filter((e) => e.status === situacao) : comStatus;
  const totalFiltrados = filtrados.length;
  const pagAtual = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  const totalExtrasFiltrado = filtrados.reduce((s, e) => s + e.valorExtra, 0);
  const pagoFiltrado = filtrados.reduce((s, e) => s + e.totalPago, 0);
  const faltaPagarFiltrado = totalExtrasFiltrado - pagoFiltrado;
  const lucroEmpresaFiltrado = filtrados.reduce((s, e) => s + e.lucroEmpresa, 0);

  const periodoLabelPartes: string[] = [];
  if (de || ate) periodoLabelPartes.push(`${de ? formatDate(dePersonalizado) : "..."} a ${ate ? formatDate(atePersonalizadoBruto) : "..."}`);
  if (funcionarioId) periodoLabelPartes.push(`funcionário: ${mecanicos.find((m) => m.id === funcionarioId)?.nome ?? ""}`);
  if (q) periodoLabelPartes.push(`cliente: "${q}"`);
  if (situacao) periodoLabelPartes.push(STATUS_OPCOES.find((s) => s.value === situacao)?.label ?? situacao);
  const periodoLabel = periodoLabelPartes.join(" · ");

  function extraHref(overrides: { situacao?: string | null }) {
    const nextSituacao = "situacao" in overrides ? overrides.situacao : situacao;
    const params = new URLSearchParams();
    if (funcionarioId) params.set("funcionarioId", funcionarioId);
    if (q) params.set("q", q);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    if (nextSituacao) params.set("situacao", nextSituacao);
    const qs = params.toString();
    return qs ? `/extras?${qs}` : "/extras";
  }

  function extraHrefPagina(p: number) {
    const params = new URLSearchParams();
    if (funcionarioId) params.set("funcionarioId", funcionarioId);
    if (q) params.set("q", q);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    if (situacao) params.set("situacao", situacao);
    if (p > 1) params.set("pagina", String(p));
    const qs = params.toString();
    return qs ? `/extras?${qs}` : "/extras";
  }

  return (
    <div>
      <PageHero
        title="Extras"
        description="Pagamentos extras a funcionários vinculados a serviços específicos."
        action={usuario.permissoes.editarExtras ? { label: "+ Novo extra", href: "/extras/novo" } : undefined}
      />

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon="hand-coins"
          iconColor="text-brand-600"
          label="Extras no mês"
          value={<ValorOculto><CountUp value={totalExtrasNoMes} kind="currency" /></ValorOculto>}
        />
        <MetricCard
          icon="trending-up"
          iconColor="text-green-600"
          label="Já pago"
          value={<ValorOculto><CountUp value={pagoNoMes} kind="currency" /></ValorOculto>}
        />
        <MetricCard
          icon="clock"
          iconColor="text-amber-600"
          label="Falta pagar"
          value={<ValorOculto><CountUp value={faltaPagarNoMes} kind="currency" /></ValorOculto>}
        />
        <MetricCard
          icon="wallet"
          iconColor={lucroEmpresaNoMes >= 0 ? "text-green-600" : "text-red-600"}
          label="Lucro da empresa"
          value={<ValorOculto><CountUp value={lucroEmpresaNoMes} kind="currency" /></ValorOculto>}
          context="Nesses serviços, no mês"
          highlight={lucroEmpresaNoMes >= 0 ? "success" : "danger"}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3">
        {situacao && <input type="hidden" name="situacao" value={situacao} />}
        <div className="flex-1 sm:flex-none">
          <label className="block text-xs font-medium text-gray-500">Funcionário</label>
          <select
            name="funcionarioId"
            defaultValue={funcionarioId ?? ""}
            className="mt-1 h-[38px] w-full min-w-[160px] rounded-lg border border-gray-300 px-3 text-sm"
          >
            <option value="">Todos</option>
            {mecanicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
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
              className="h-[38px] w-full min-w-[160px] rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <FilterLink label="Todas" href={extraHref({ situacao: null })} active={!situacao} />
        {STATUS_OPCOES.map((s) => (
          <FilterLink
            key={s.value}
            label={s.label}
            href={extraHref({ situacao: s.value })}
            active={situacao === s.value}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <ExportarExtrasPdf
          empresa={empresa}
          periodoLabel={periodoLabel}
          resumo={{
            totalExtras: totalExtrasFiltrado,
            totalPago: pagoFiltrado,
            faltaPagar: faltaPagarFiltrado,
            lucroEmpresa: lucroEmpresaFiltrado,
          }}
          extras={filtrados.map((e) => ({
            data: e.data,
            mecanicoNome: e.mecanico.nome,
            clienteOuOs:
              e.cliente?.nome ?? (e.ordemServico ? `OS #${String(e.ordemServico.id).padStart(4, "0")}` : "-"),
            valorExtra: e.valorExtra,
            saldo: e.saldo,
            lucroEmpresa: e.lucroEmpresa,
            status: e.status,
          }))}
          nomeArquivo={`extras-${new Date().toISOString().slice(0, 10)}.pdf`}
        />
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[var(--shadow-card)]">
        <div className="h-[3px] bg-brand-600" />
        {pagAtual.length === 0 ? (
          <EmptyState
            icon="hand-coins"
            title="Nenhum extra encontrado"
            description="Cadastre o primeiro extra vinculado a um serviço pra começar a acompanhar."
          />
        ) : (
          <>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="bg-gray-50/80 text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Cliente / OS
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Valor extra
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Saldo
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Lucro empresa
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Situação
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagAtual.map((e) => (
                  <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500">{formatDate(e.data)}</td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/extras/${e.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {e.mecanico.nome}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {e.cliente?.nome ?? (e.ordemServico ? `OS #${String(e.ordemServico.id).padStart(4, "0")}` : "-")}
                    </td>
                    <td className="px-6 py-3 text-gray-500 tabular-nums">{formatCurrency(e.valorExtra)}</td>
                    <td className="px-6 py-3 font-medium tabular-nums text-gray-900">
                      {formatCurrency(e.saldo)}
                    </td>
                    <td className="px-6 py-3 text-gray-500 tabular-nums">{formatCurrency(e.lucroEmpresa)}</td>
                    <td className="px-6 py-3">
                      <StatusBadge {...statusExtraMap[e.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-gray-100 md:hidden">
              {pagAtual.map((e) => (
                <Link key={e.id} href={`/extras/${e.id}`} className="block px-4 py-3 active:bg-gray-50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate font-medium text-gray-900">
                      {e.mecanico.nome}
                    </span>
                    <StatusBadge {...statusExtraMap[e.status]} />
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {e.cliente?.nome ?? (e.ordemServico ? `OS #${String(e.ordemServico.id).padStart(4, "0")}` : "-")}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500">{formatDate(e.data)}</span>
                    <span className="text-sm font-semibold tabular-nums text-gray-900">
                      Saldo: {formatCurrency(e.saldo)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination paginaAtual={pagina} totalItens={totalFiltrados} hrefForPage={extraHrefPagina} />
          </>
        )}
      </div>
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
