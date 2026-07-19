import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getEmpresa } from "@/lib/getEmpresa";
import { calcularSituacaoDivida, type SituacaoDivida } from "@/lib/dividas";
import { formatCurrency, formatDate, parseDateInputValue } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MetricCard from "@/components/ui/MetricCard";
import Pagination, { PAGE_SIZE } from "@/components/ui/Pagination";
import { StatusBadge, situacaoDividaMap } from "@/components/ui/StatusBadge";
import ExportarDevedoresPdf from "@/components/ExportarDevedoresPdf";

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

  const totalFiltradas = filtradas.length;
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

  function devedorHrefPagina(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    if (situacao) params.set("situacao", situacao);
    if (p > 1) params.set("pagina", String(p));
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

      <div className="mt-4 flex justify-end">
        <ExportarDevedoresPdf
          empresa={empresa}
          periodoLabel={periodoLabel}
          resumo={{ totalDividas, totalRecebido, saldoAReceber }}
          dividas={filtradas.map((d) => ({
            clienteNome: d.cliente.nome,
            dataServico: d.dataServico,
            valorOriginal: d.valorOriginal,
            totalPago: d.totalPago,
            saldo: d.saldo,
            situacao: d.situacao,
          }))}
          nomeArquivo={`devedores-${new Date().toISOString().slice(0, 10)}.pdf`}
        />
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {pagAtual.length === 0 ? (
          <EmptyState
            icon="user-x"
            title="Nenhuma dívida encontrada"
            description="Cadastre a primeira dívida antiga pra começar a acompanhar o pagamento parcelado."
          />
        ) : (
          <>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="text-gray-500">
                <tr>
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
                    <td className="px-6 py-3">
                      <Link
                        href={`/devedores/${d.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {d.cliente.nome}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(d.dataServico)}</td>
                    <td className="px-6 py-3 text-gray-500">{formatCurrency(d.valorOriginal)}</td>
                    <td className="px-6 py-3 text-gray-500">{formatCurrency(d.totalPago)}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">
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
                <Link
                  key={d.id}
                  href={`/devedores/${d.id}`}
                  className="block px-4 py-3 active:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate font-medium text-gray-900">
                      {d.cliente.nome}
                    </span>
                    <StatusBadge {...situacaoDividaMap[d.situacao]} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500">{formatDate(d.dataServico)}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      Saldo: {formatCurrency(d.saldo)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination paginaAtual={pagina} totalItens={totalFiltradas} hrefForPage={devedorHrefPagina} />
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
          ? "bg-blue-600 text-white"
          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}
