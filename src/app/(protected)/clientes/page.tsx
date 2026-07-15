import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatPhoneBR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const [clientes, totalClientes] = await Promise.all([
    prisma.cliente.findMany({
      where: q
        ? {
            OR: [
              { nome: { contains: q, mode: "insensitive" } },
              { cpfCnpj: { contains: q, mode: "insensitive" } },
              { telefone: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { nome: "asc" },
      include: {
        ordensServico: {
          select: { data: true, itens: { select: { valor: true } } },
        },
      },
    }),
    prisma.cliente.count(),
  ]);

  const contadorDescricao = q
    ? `${clientes.length} resultado${clientes.length === 1 ? "" : "s"} para "${q}"`
    : `${totalClientes} cliente${totalClientes === 1 ? "" : "s"} cadastrado${totalClientes === 1 ? "" : "s"}`;

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={contadorDescricao}
        action={{ label: "+ Novo cliente", href: "/clientes/novo" }}
      />

      <form className="mt-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {clientes.length === 0 ? (
          <EmptyState
            icon="users"
            title="Nenhum cliente encontrado"
            description="Cadastre o primeiro cliente para começar a organizar as ordens de serviço."
          />
        ) : (
          <>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    CPF/CNPJ
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Total gasto
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Última visita
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => {
                  const totalGasto = cliente.ordensServico.reduce(
                    (sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0),
                    0
                  );
                  const ultimaVisita = cliente.ordensServico.reduce<Date | null>(
                    (latest, os) => (!latest || os.data > latest ? os.data : latest),
                    null
                  );

                  return (
                    <tr key={cliente.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {cliente.nome}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {cliente.cpfCnpj ?? <span className="text-gray-300">não informado</span>}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {formatPhoneBR(cliente.telefone ?? cliente.whatsapp) || (
                          <span className="text-gray-300">não informado</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {cliente.cidade ?? <span className="text-gray-300">não informado</span>}
                      </td>
                      <td className="px-6 py-3 text-gray-500">{formatCurrency(totalGasto)}</td>
                      <td className="px-6 py-3 text-gray-500">
                        {ultimaVisita ? (
                          formatDate(ultimaVisita)
                        ) : (
                          <span className="text-gray-300">nunca</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="divide-y divide-gray-100 md:hidden">
              {clientes.map((cliente) => {
                const totalGasto = cliente.ordensServico.reduce(
                  (sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0),
                  0
                );
                const ultimaVisita = cliente.ordensServico.reduce<Date | null>(
                  (latest, os) => (!latest || os.data > latest ? os.data : latest),
                  null
                );

                return (
                  <Link
                    key={cliente.id}
                    href={`/clientes/${cliente.id}`}
                    className="block px-4 py-3 active:bg-gray-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900">{cliente.nome}</p>
                      {cliente.cidade && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {cliente.cidade}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {cliente.cpfCnpj ?? "CPF/CNPJ não informado"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPhoneBR(cliente.telefone ?? cliente.whatsapp) || "Telefone não informado"}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(totalGasto)}
                      </span>
                      <span className="text-gray-500">
                        {ultimaVisita ? formatDate(ultimaVisita) : "nunca"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
