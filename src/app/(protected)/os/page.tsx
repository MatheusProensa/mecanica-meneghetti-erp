import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Prisma, StatusOS } from "@/generated/prisma/client";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { osStatusMap } from "@/components/ui/StatusBadge";
import OSStatusSelect from "@/components/OSStatusSelect";

export default async function OSListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const numeroBuscado = q ? Number(q.replace(/\D/g, "")) : null;

  const where: Prisma.OrdemServicoWhereInput = {
    ...(status ? { status: status as StatusOS } : {}),
    ...(q
      ? {
          OR: [
            { cliente: { nome: { contains: q } } },
            ...(numeroBuscado ? [{ id: numeroBuscado }] : []),
          ],
        }
      : {}),
  };

  const ordens = await prisma.ordemServico.findMany({
    where,
    include: { cliente: true, itens: true },
    orderBy: { data: "desc" },
  });

  return (
    <div>
      <PageHeader title="Ordens de Serviço" action={{ label: "+ Nova OS", href: "/os/nova" }} />

      <form className="mt-4 flex flex-wrap items-center gap-3">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por número (#0001) ou cliente..."
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Buscar
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterLink label="Todas" href={q ? `/os?q=${encodeURIComponent(q)}` : "/os"} active={!status} />
        {Object.entries(osStatusMap).map(([value, { label }]) => (
          <FilterLink
            key={value}
            label={label}
            href={`/os?status=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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
                    <OSStatusSelect id={os.id} status={os.status} />
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
