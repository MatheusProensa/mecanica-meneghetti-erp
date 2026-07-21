import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import DespesaForm from "@/components/DespesaForm";
import FormPageHeader from "@/components/ui/FormPageHeader";
import { createDespesa } from "../actions";

export default async function NovaDespesaPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verFinanceiro || !usuario.permissoes.editarFinanceiro) redirect("/financeiro");

  return (
    <div className="max-w-2xl">
      <FormPageHeader backHref="/financeiro" backLabel="Financeiro" title="Nova despesa" />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-[var(--shadow-card)]">
        <DespesaForm action={createDespesa} />
      </div>
    </div>
  );
}
