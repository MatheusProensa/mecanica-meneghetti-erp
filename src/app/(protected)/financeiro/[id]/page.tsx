import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DespesaForm from "@/components/DespesaForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { updateDespesa, deleteDespesa } from "../actions";

export default async function DespesaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const despesa = await prisma.despesa.findUnique({ where: { id } });

  if (!despesa) notFound();

  const updateDespesaWithId = updateDespesa.bind(null, despesa.id);
  const deleteDespesaWithId = deleteDespesa.bind(null, despesa.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
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

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <DespesaForm despesa={despesa} action={updateDespesaWithId} />
      </div>
    </div>
  );
}
