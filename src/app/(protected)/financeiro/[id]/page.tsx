import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
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

  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verFinanceiro) redirect("/");

  const despesa = await prisma.despesa.findUnique({
    where: { id },
    include: { itens: true },
  });

  if (!despesa) notFound();

  const anexoUrl = despesa.anexoPath ? await getSignedDespesaAnexoUrl(despesa.anexoPath) : null;

  const updateDespesaWithId = updateDespesa.bind(null, despesa.id);
  const deleteDespesaWithId = deleteDespesa.bind(null, despesa.id);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/financeiro" className="text-sm text-gray-600 hover:underline">
            ← Financeiro
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">{despesa.descricao}</h1>
        </div>
        {usuario.permissoes.excluirFinanceiro && (
          <ConfirmModal
            triggerLabel="Excluir despesa"
            title="Excluir esta despesa?"
            description={`Tem certeza que deseja excluir "${despesa.descricao}"? Essa ação não pode ser desfeita.`}
            action={deleteDespesaWithId}
          />
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-[var(--shadow-card)]">
        <DespesaForm
          despesa={despesa}
          itens={despesa.itens}
          anexoUrl={anexoUrl}
          action={updateDespesaWithId}
          readOnly={!usuario.permissoes.editarFinanceiro}
        />
      </div>
    </div>
  );
}
