import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import OSForm from "@/components/OSForm";
import OSPagoToggle from "@/components/OSPagoToggle";
import ConfirmModal from "@/components/ui/ConfirmModal";
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
          <div className="mt-2">
            <OSPagoToggle id={os.id} pago={os.pago} previsaoEntrega={os.previsaoEntrega} />
          </div>
        </div>
        <ConfirmModal
          triggerLabel="Excluir OS"
          title="Excluir esta OS?"
          description={`Tem certeza que deseja excluir a OS #${String(os.id).padStart(4, "0")}? Essa ação não pode ser desfeita.`}
          action={deleteOSWithId}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <OSForm clientes={clientes} os={os} action={updateOSWithId} />
      </div>
    </div>
  );
}
