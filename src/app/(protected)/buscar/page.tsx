import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { formatCurrency, formatDate } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge, osStatusMap, notaTipoMap } from "@/components/ui/StatusBadge";
import WhatsAppLink from "@/components/ui/WhatsAppLink";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const numeroBuscado = query ? Number(query.replace(/\D/g, "")) : null;

  const [clientes, ordens, notas] = query
    ? await Promise.all([
        !usuario.permissoes.verClientes
          ? Promise.resolve([])
          : prisma.cliente.findMany({
              where: {
                OR: [
                  { nome: { contains: query, mode: "insensitive" } },
                  { cpfCnpj: { contains: query, mode: "insensitive" } },
                  { telefone: { contains: query, mode: "insensitive" } },
                  { whatsapp: { contains: query, mode: "insensitive" } },
                ],
              },
              take: 10,
              orderBy: { nome: "asc" },
            }),
        !usuario.permissoes.verOS
          ? Promise.resolve([])
          : prisma.ordemServico.findMany({
              where: {
                OR: [
                  { cliente: { nome: { contains: query, mode: "insensitive" } } },
                  { mecanicoResponsavel: { contains: query, mode: "insensitive" } },
                  { mecanico: { nome: { contains: query, mode: "insensitive" } } },
                  { observacoes: { contains: query, mode: "insensitive" } },
                  ...(numeroBuscado ? [{ id: numeroBuscado }] : []),
                ],
              },
              include: { cliente: true, itens: true },
              take: 10,
              orderBy: { data: "desc" },
            }),
        !usuario.permissoes.verNotas
          ? Promise.resolve([])
          : prisma.nota.findMany({
              where: {
                OR: [
                  { numero: { contains: query, mode: "insensitive" } },
                  { observacoes: { contains: query, mode: "insensitive" } },
                ],
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
          <div className="mt-3 overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[var(--shadow-card)]">
            <table className="hidden w-full text-left text-sm md:table">
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
                      {cliente.telefone || cliente.whatsapp ? (
                        <WhatsAppLink phone={cliente.telefone ?? cliente.whatsapp} />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{cliente.cpfCnpj ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-gray-100 md:hidden">
              {clientes.map((cliente) => (
                <div key={cliente.id} className="relative px-4 py-3 active:bg-gray-50">
                  <Link
                    href={`/clientes/${cliente.id}`}
                    className="absolute inset-0 active:bg-gray-50"
                    aria-label={cliente.nome}
                  />
                  <p className="pointer-events-none font-medium text-gray-900">{cliente.nome}</p>
                  <p className="relative mt-1 text-sm text-gray-500">
                    {cliente.telefone || cliente.whatsapp ? (
                      <WhatsAppLink
                        phone={cliente.telefone ?? cliente.whatsapp}
                        className="pointer-events-auto relative z-10"
                      />
                    ) : (
                      "Telefone não informado"
                    )}
                    {cliente.cpfCnpj ? ` · ${cliente.cpfCnpj}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {ordens.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900">Ordens de Serviço</h2>
          <div className="mt-3 overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[var(--shadow-card)]">
            <table className="hidden w-full text-left text-sm md:table">
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

            <div className="divide-y divide-gray-100 md:hidden">
              {ordens.map((os) => (
                <Link
                  key={os.id}
                  href={`/os/${os.id}`}
                  className="block px-4 py-3 active:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate font-medium text-gray-900">
                      #{String(os.id).padStart(4, "0")} — {os.cliente.nome}
                    </p>
                    <span className="shrink-0 text-sm font-semibold text-gray-900">
                      {formatCurrency(os.itens.reduce((s, i) => s + i.valor, 0))}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <StatusBadge {...osStatusMap[os.status]} />
                    <span className="shrink-0 text-xs text-gray-500">{formatDate(os.data)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {notas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900">Notas</h2>
          <div className="mt-3 overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[var(--shadow-card)]">
            <table className="hidden w-full text-left text-sm md:table">
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

            <div className="divide-y divide-gray-100 md:hidden">
              {notas.map((nota) => (
                <Link
                  key={nota.id}
                  href={`/notas/${nota.id}`}
                  className="flex items-center justify-between gap-2 px-4 py-3 active:bg-gray-50"
                >
                  <p className="min-w-0 flex-1 truncate font-medium text-gray-900">{nota.numero}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge {...notaTipoMap[nota.tipo]} />
                    <span className="text-xs text-gray-500">{formatDate(nota.dataEmissao)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
