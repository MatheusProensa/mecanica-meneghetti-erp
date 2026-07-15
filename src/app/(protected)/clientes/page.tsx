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

  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nome: { contains: q } },
            { cpfCnpj: { contains: q } },
            { telefone: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { nome: "asc" },
    include: {
      ordensServico: {
        select: { data: true, itens: { select: { valor: true } } },
      },
    },
  });

  return (
    <div>
      <PageHeader title="Clientes" action={{ label: "+ Novo cliente", href: "/clientes/novo" }} />

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
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  CPF/CNPJ
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Cidade</th>
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
                    <td className="px-6 py-3 text-gray-500">{cliente.cpfCnpj ?? "-"}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {formatPhoneBR(cliente.telefone ?? cliente.whatsapp) || "-"}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{cliente.cidade ?? "-"}</td>
                    <td className="px-6 py-3 text-gray-500">{formatCurrency(totalGasto)}</td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(ultimaVisita)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
