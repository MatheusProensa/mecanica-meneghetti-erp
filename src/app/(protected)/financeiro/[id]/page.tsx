import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignedDespesaAnexoUrl } from "@/lib/supabase-storage";
import DespesaForm from "@/components/DespesaForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { updateDespesa, deleteDespesa } from "../actions";

export default async function DespesaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const despesa = await prisma.despesa.findUnique({
    where: { id },
    include: { itens: true },
  });

  if (!despesa) notFound();

  const anexoUrl = despesa.anexoPath ? await getSignedDespesaAnexoUrl(despesa.anexoPath) : null;

  const updateDespesaWithId = updateDespesa.bind(null, despesa.id);
  const deleteDespesaWithId = deleteDespesa.bind(null, despesa.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/financeiro" className="text-sm text-gray-500 hover:underline">
            ← Financeiro
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">{despesa.descricao}</h1>
        </div>
        <ConfirmModal
          triggerLabel="Excluir despesa"
          title="Excluir esta despesa?"
          description={`Tem certeza que deseja excluir "${despesa.descricao}"? Essa ação não pode ser desfeita.`}
          action={deleteDespesaWithId}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <DespesaForm
          despesa={despesa}
          itens={despesa.itens}
          anexoUrl={anexoUrl}
          action={updateDespesaWithId}
        />
      </div>
    </div>
  );
}
