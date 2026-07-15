import DespesaForm from "@/components/DespesaForm";
import { createDespesa } from "../actions";

export default function NovaDespesaPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Nova despesa</h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <DespesaForm action={createDespesa} />
      </div>
    </div>
  );
}
