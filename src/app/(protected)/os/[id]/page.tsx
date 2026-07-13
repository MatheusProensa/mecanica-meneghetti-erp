import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import OSForm from "@/components/OSForm";
import { updateOS, deleteOS } from "../actions";

export default async function OSDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const osId = Number(id);
  if (!Number.isInteger(osId)) notFound();

  const [os, clientes] = await Promise.all([
    prisma.ordemServico.findUnique({
      where: { id: osId },
      include: { itens: true, cliente: true },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!os) notFound();

  const updateOSWithId = updateOS.bind(null, os.id);
  const deleteOSWithId = deleteOS.bind(null, os.id);

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/os" className="text-sm text-gray-500 hover:underline">
            ← Ordens de Serviço
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">
            OS #{String(os.id).padStart(4, "0")} — {os.cliente.nome}
          </h1>
          <p className="text-sm text-gray-500">Aberta em {formatDate(os.data)}</p>
        </div>
        <form action={deleteOSWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Excluir OS
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <OSForm clientes={clientes} os={os} action={updateOSWithId} />
      </div>
    </div>
  );
}
