import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import ClienteForm from "@/components/ClienteForm";
import MetricCard from "@/components/ui/MetricCard";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge, osStatusMap } from "@/components/ui/StatusBadge";
import { updateCliente, deleteCliente } from "../actions";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      ordensServico: {
        include: { itens: true },
        orderBy: { data: "desc" },
      },
    },
  });

  if (!cliente) notFound();

  const valorTotalGasto = cliente.ordensServico.reduce(
    (sum, os) => sum + os.itens.reduce((s, item) => s + item.valor, 0),
    0
  );
  const quantidadeServicos = cliente.ordensServico.length;
  const ultimaVisita = cliente.ordensServico[0]?.data ?? null;

  const updateClienteWithId = updateCliente.bind(null, cliente.id);
  const deleteClienteWithId = deleteCliente.bind(null, cliente.id);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/clientes" className="text-sm text-gray-500 hover:underline">
            ← Clientes
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">{cliente.nome}</h1>
        </div>
        <form action={deleteClienteWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Excluir cliente
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          icon="wallet"
          iconColor="text-blue-600"
          label="Total gasto"
          value={formatCurrency(valorTotalGasto)}
        />
        <MetricCard
          icon="tools"
          iconColor="text-blue-600"
          label="Serviços realizados"
          value={quantidadeServicos}
        />
        <MetricCard
          icon="calendar"
          iconColor="text-amber-600"
          label="Última visita"
          value={formatDate(ultimaVisita)}
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900">Dados cadastrais</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <ClienteForm cliente={cliente} action={updateClienteWithId} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Histórico de ordens de serviço
          </h2>
          <Link
            href={`/os/nova?clienteId=${cliente.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            + Nova OS
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-[10px] border border-gray-200 bg-white">
          {cliente.ordensServico.length === 0 ? (
            <EmptyState
              icon="tools"
              title="Nenhuma ordem de serviço ainda"
              description="Quando este cliente tiver uma OS, ela aparece aqui."
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">OS</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {cliente.ordensServico.map((os) => (
                  <tr key={os.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/os/${os.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        #{String(os.id).padStart(4, "0")}
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
          )}
        </div>
      </div>
    </div>
  );
}
