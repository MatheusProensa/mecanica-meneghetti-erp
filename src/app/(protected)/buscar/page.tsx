import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatPhoneBR } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge, osStatusMap, notaTipoMap } from "@/components/ui/StatusBadge";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const numeroBuscado = query ? Number(query.replace(/\D/g, "")) : null;

  const [clientes, ordens, notas] = query
    ? await Promise.all([
        prisma.cliente.findMany({
          where: {
            OR: [
              { nome: { contains: query } },
              { cpfCnpj: { contains: query } },
              { telefone: { contains: query } },
              { whatsapp: { contains: query } },
            ],
          },
          take: 10,
          orderBy: { nome: "asc" },
        }),
        prisma.ordemServico.findMany({
          where: {
            OR: [
              { cliente: { nome: { contains: query } } },
              { mecanicoResponsavel: { contains: query } },
              { observacoes: { contains: query } },
              ...(numeroBuscado ? [{ id: numeroBuscado }] : []),
            ],
          },
          include: { cliente: true, itens: true },
          take: 10,
          orderBy: { data: "desc" },
        }),
        prisma.nota.findMany({
          where: {
            OR: [{ numero: { contains: query } }, { observacoes: { contains: query } }],
          },
          take: 10,
          orderBy: { dataEmissao: "desc" },
        }),
      ])
    : [[], [], []];

  const totalResultados = clientes.length + ordens.length + notas.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Resultados da busca</h1>
        <p className="mt-1 text-sm text-gray-500">
          {query ? `"${query}" — ${totalResultados} resultado(s)` : "Digite algo no campo de busca no topo."}
        </p>
      </div>

      {query && totalResultados === 0 && (
        <div className="rounded-[10px] border border-gray-200 bg-white">
          <EmptyState
            icon="inbox"
            title="Nenhum resultado encontrado"
            description="Tente buscar por outro nome, número de OS, telefone ou número de nota."
          />
        </div>
      )}

      {clientes.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900">Clientes</h2>
          <div className="mt-3 overflow-hidden rounded-[10px] border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="border-t border-gray-100 first:border-t-0 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {cliente.nome}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {formatPhoneBR(cliente.telefone ?? cliente.whatsapp) || "-"}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{cliente.cpfCnpj ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {ordens.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900">Ordens de Serviço</h2>
          <div className="mt-3 overflow-hidden rounded-[10px] border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <tbody>
                {ordens.map((os) => (
                  <tr key={os.id} className="border-t border-gray-100 first:border-t-0 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/os/${os.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        #{String(os.id).padStart(4, "0")} — {os.cliente.nome}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(os.data)}</td>
                    <td className="px-6 py-3">
                      <StatusBadge {...osStatusMap[os.status]} />
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {formatCurrency(os.itens.reduce((s, i) => s + i.valor, 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {notas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900">Notas</h2>
          <div className="mt-3 overflow-hidden rounded-[10px] border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <tbody>
                {notas.map((nota) => (
                  <tr key={nota.id} className="border-t border-gray-100 first:border-t-0 hover:bg-gray-50">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
