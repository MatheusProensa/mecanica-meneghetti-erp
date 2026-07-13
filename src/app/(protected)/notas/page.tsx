import Link from "next/link";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Prisma, TipoNota } from "@/generated/prisma/client";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MetricCard from "@/components/ui/MetricCard";
import { StatusBadge, notaTipoMap } from "@/components/ui/StatusBadge";

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; q?: string }>;
}) {
  const { tipo, q } = await searchParams;

  const where: Prisma.NotaWhereInput = {
    ...(tipo ? { tipo: tipo as TipoNota } : {}),
    ...(q
      ? {
          OR: [
            { numero: { contains: q } },
            { observacoes: { contains: q } },
          ],
        }
      : {}),
  };

  const notas = await prisma.nota.findMany({
    where,
    orderBy: { dataEmissao: "desc" },
  });

  const totalEmitidas = notas
    .filter((n) => n.tipo === "emitida")
    .reduce((s, n) => s + (n.valor ?? 0), 0);
  const totalRecebidas = notas
    .filter((n) => n.tipo === "recebida")
    .reduce((s, n) => s + (n.valor ?? 0), 0);
  const semValorCount = notas.filter((n) => n.valor === null).length;

  return (
    <div>
      <PageHeader
        title="Notas"
        description="Arquivo de notas emitidas e recebidas — anexe o PDF para consulta futura."
        action={{ label: "+ Nova nota", href: "/notas/nova" }}
      />

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          icon="trending-up"
          iconColor="text-green-600"
          label="Total emitidas"
          value={formatCurrency(totalEmitidas)}
        />
        <MetricCard
          icon="trending-down"
          iconColor="text-red-600"
          label="Total recebidas"
          value={formatCurrency(totalRecebidas)}
        />
        <MetricCard
          icon="file-text"
          iconColor="text-gray-500"
          label="Sem valor informado"
          value={semValorCount}
          context={semValorCount > 0 ? "não entram na soma" : undefined}
        />
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500">Tipo</label>
          <select
            name="tipo"
            defaultValue={tipo ?? ""}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="emitida">Emitida</option>
            <option value="recebida">Recebida</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Número ou observação
          </label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-[10px] border border-gray-200 bg-white">
        {notas.length === 0 ? (
          <EmptyState
            icon="file-text"
            title="Nenhuma nota encontrada"
            description="Anexe uma nota emitida ou recebida para guardar o registro em PDF."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Emissão
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
                  <td className="max-w-xs truncate px-6 py-3 text-gray-500">
                    {nota.observacoes ?? "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {nota.valor !== null ? formatCurrency(nota.valor) : "-"}
                  </td>
                  <td className="px-6 py-3">
                    {nota.arquivoPdfPath ? (
                      <a
                        href={nota.arquivoPdfPath}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
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
        )}
      </div>
    </div>
  );
}
