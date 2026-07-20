import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import DespesaForm from "@/components/DespesaForm";
import { createDespesa } from "../actions";

export default async function NovaDespesaPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verFinanceiro || !usuario.permissoes.editarFinanceiro) redirect("/financeiro");

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Nova despesa</h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <DespesaForm action={createDespesa} />
      </div>
    </div>
  );
}
