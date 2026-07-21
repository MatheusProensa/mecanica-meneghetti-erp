import Link from "next/link";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getSignedPdfUrls } from "@/lib/supabase-storage";
import { formatCurrency, formatDate, parseDateInputValue } from "@/lib/format";
import type { Prisma, TipoNota } from "@/generated/prisma/client";
import PageHero from "@/components/ui/PageHero";
import EmptyState from "@/components/ui/EmptyState";
import MetricCard from "@/components/ui/MetricCard";
import ValorOculto from "@/components/ui/ValorOculto";
import CountUp from "@/components/ui/CountUp";
import Pagination, { PAGE_SIZE } from "@/components/ui/Pagination";
import { StatusBadge, notaTipoMap } from "@/components/ui/StatusBadge";

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

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    q?: string;
    mes?: string;
    ano?: string;
    de?: string;
    ate?: string;
    pagina?: string;
  }>;
}) {
  const { tipo, q, mes, ano, de, ate, pagina: paginaRaw } = await searchParams;
  const pagina = Math.max(1, Number(paginaRaw) || 1);

  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verNotas) redirect("/");

  const anoAtual = new Date().getFullYear();
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

  const where: Prisma.NotaWhereInput = {
    ...(tipo ? { tipo: tipo as TipoNota } : {}),
    ...(periodo ? { dataEmissao: periodo } : {}),
    ...(q
      ? {
          OR: [
            { numero: { contains: q, mode: "insensitive" } },
            { observacoes: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [notas, totalNotas, todasParaAgregados] = await Promise.all([
    prisma.nota.findMany({
      where,
      include: { cliente: true },
      orderBy: { dataEmissao: "desc" },
      skip: (pagina - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.nota.count({ where }),
    prisma.nota.findMany({ where, select: { tipo: true, valor: true } }),
  ]);

  const totalEmitidas = todasParaAgregados
    .filter((n) => n.tipo === "emitida")
    .reduce((s, n) => s + (n.valor ?? 0), 0);
  const totalRecebidas = todasParaAgregados
    .filter((n) => n.tipo === "recebida")
    .reduce((s, n) => s + (n.valor ?? 0), 0);
  const semValorCount = todasParaAgregados.filter((n) => n.valor === null).length;

  const pdfPaths = notas
    .map((n) => n.arquivoPdfPath)
    .filter((p): p is string => Boolean(p));
  const pdfUrls = await getSignedPdfUrls(pdfPaths);

  // undefined = mantém o filtro atual da URL; null = remove o filtro
  function notaHref(overrides: { tipo?: string | null }) {
    const nextTipo = "tipo" in overrides ? overrides.tipo : tipo;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (mes) params.set("mes", mes);
    if (ano) params.set("ano", ano);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    if (nextTipo) params.set("tipo", nextTipo);
    const qs = params.toString();
    return qs ? `/notas?${qs}` : "/notas";
  }

  function notaHrefPagina(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (mes) params.set("mes", mes);
    if (ano) params.set("ano", ano);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    if (tipo) params.set("tipo", tipo);
    if (p > 1) params.set("pagina", String(p));
    const qs = params.toString();
    return qs ? `/notas?${qs}` : "/notas";
  }

  return (
    <div>
      <PageHero
        title="Notas"
        description="Arquivo de notas emitidas e recebidas — anexe o PDF para consulta futura."
        action={usuario.permissoes.editarNotas ? { label: "+ Nova nota", href: "/notas/nova" } : undefined}
      />

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          icon="trending-up"
          iconColor="text-green-600"
          label="Total emitidas"
          value={<ValorOculto><CountUp value={totalEmitidas} kind="currency" /></ValorOculto>}
        />
        <MetricCard
          icon="trending-down"
          iconColor="text-red-600"
          label="Total recebidas"
          value={<ValorOculto><CountUp value={totalRecebidas} kind="currency" /></ValorOculto>}
        />
        <MetricCard
          icon="file-text"
          iconColor="text-gray-500"
          label="Sem valor informado"
          value={semValorCount}
          context={semValorCount > 0 ? "não entram na soma" : undefined}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterLink label="Todos os tipos" href={notaHref({ tipo: null })} active={!tipo} />
        <FilterLink
          label="Emitida"
          href={notaHref({ tipo: "emitida" })}
          active={tipo === "emitida"}
        />
        <FilterLink
          label="Recebida"
          href={notaHref({ tipo: "recebida" })}
          active={tipo === "recebida"}
        />
      </div>

      <form className="mt-3 flex flex-wrap items-end gap-3">
        {tipo && <input type="hidden" name="tipo" value={tipo} />}
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
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-medium text-gray-500">
            Número ou observação
          </label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              autoComplete="off"
              className="h-[38px] w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[var(--shadow-card)]">
        <div className="h-[3px] bg-brand-600" />
        {notas.length === 0 ? (
          <EmptyState
            icon="file-text"
            title="Nenhuma nota encontrada"
            description="Anexe uma nota emitida ou recebida para guardar o registro em PDF."
          />
        ) : (
          <>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="bg-gray-50/80 text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Emissão
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Observações
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Anexo
                  </th>
                </tr>
              </thead>
              <tbody>
                {notas.map((nota) => (
                  <tr key={nota.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/notas/${nota.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {nota.numero}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge {...notaTipoMap[nota.tipo]} />
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(nota.dataEmissao)}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {nota.cliente ? (
                        <Link href={`/clientes/${nota.cliente.id}`} className="hover:underline">
                          {nota.cliente.nome}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="max-w-xs truncate px-6 py-3 text-gray-500">
                      {nota.observacoes ?? "-"}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {nota.valor !== null ? formatCurrency(nota.valor) : "-"}
                    </td>
                    <td className="px-6 py-3">
                      {nota.arquivoPdfPath && pdfUrls[nota.arquivoPdfPath] ? (
                        <a
                          href={pdfUrls[nota.arquivoPdfPath]}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                        >
                          <FileText className="h-4 w-4" /> PDF
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-gray-100 md:hidden">
              {notas.map((nota) => (
                <div key={nota.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/notas/${nota.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {nota.numero}
                    </Link>
                    <StatusBadge {...notaTipoMap[nota.tipo]} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(nota.dataEmissao)}
                    {nota.cliente ? ` · ${nota.cliente.nome}` : ""}
                  </p>
                  {nota.observacoes && (
                    <p className="mt-1 text-sm text-gray-500">{nota.observacoes}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {nota.valor !== null ? formatCurrency(nota.valor) : "-"}
                    </span>
                    {nota.arquivoPdfPath && pdfUrls[nota.arquivoPdfPath] && (
                      <a
                        href={pdfUrls[nota.arquivoPdfPath]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 px-3 py-1.5 text-sm font-medium text-brand-600 active:bg-blue-50"
                      >
                        <FileText className="h-4 w-4" /> Ver PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination paginaAtual={pagina} totalItens={totalNotas} hrefForPage={notaHrefPagina} />
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
