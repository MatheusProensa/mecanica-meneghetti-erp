import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignedPdfUrl } from "@/lib/supabase-storage";
import NotaForm from "@/components/NotaForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { updateNota, deleteNota } from "../actions";

export default async function NotaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const nota = await prisma.nota.findUnique({ where: { id } });

  if (!nota) notFound();

  const pdfUrl = nota.arquivoPdfPath ? await getSignedPdfUrl(nota.arquivoPdfPath) : null;

  const updateNotaWithId = updateNota.bind(null, nota.id);
  const deleteNotaWithId = deleteNota.bind(null, nota.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/notas" className="text-sm text-gray-500 hover:underline">
            ← Notas
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">
            Nota {nota.numero}
          </h1>
        </div>
        <ConfirmModal
          triggerLabel="Excluir nota"
          title="Excluir esta nota?"
          description={`Tem certeza que deseja excluir a nota "${nota.numero}"? O PDF anexado (se houver) também será removido. Essa ação não pode ser desfeita.`}
          action={deleteNotaWithId}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <NotaForm nota={nota} pdfUrl={pdfUrl} action={updateNotaWithId} />
      </div>
    </div>
  );
}
