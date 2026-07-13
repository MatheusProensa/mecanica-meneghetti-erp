import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import type { StatusOS } from "@/generated/prisma/client";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge, osStatusMap } from "@/components/ui/StatusBadge";

export default async function OSListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const ordens = await prisma.ordemServico.findMany({
    where: status ? { status: status as StatusOS } : undefined,
    include: { cliente: true, itens: true },
    orderBy: { data: "desc" },
  });

  return (
    <div>
      <PageHeader title="Ordens de Serviço" action={{ label: "+ Nova OS", href: "/os/nova" }} />

      <div className="mt-4 flex gap-2">
        <FilterLink label="Todas" href="/os" active={!status} />
        {Object.entries(osStatusMap).map(([value, { label }]) => (
          <FilterLink
            key={value}
            label={label}
            href={`/os?status=${value}`}
            active={status === value}
          />
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-[10px] border border-gray-200 bg-white">
        {ordens.length === 0 ? (
          <EmptyState
            icon="tools"
            title="Nenhuma ordem de serviço encontrada"
            description="Crie a primeira OS para começar a acompanhar os serviços da oficina."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">OS</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((os) => (
                <tr key={os.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link
                      href={`/os/${os.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      #{String(os.id).padStart(4, "0")}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{os.cliente.nome}</td>
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
