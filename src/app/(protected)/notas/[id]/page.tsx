import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignedPdfUrl } from "@/lib/supabase-storage";
import NotaForm from "@/components/NotaForm";
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
        <form action={deleteNotaWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Excluir nota
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <NotaForm nota={nota} pdfUrl={pdfUrl} action={updateNotaWithId} />
      </div>
    </div>
  );
}
