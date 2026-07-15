import NotaForm from "@/components/NotaForm";
import { createNota } from "../actions";

export default function NovaNotaPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Nova nota</h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <NotaForm action={createNota} />
      </div>
    </div>
  );
}
