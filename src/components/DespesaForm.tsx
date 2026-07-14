import type { Despesa } from "@/generated/prisma/client";

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function DespesaForm({
  despesa,
  action,
}: {
  despesa?: Despesa;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
            Descrição *
          </label>
          <input
            id="descricao"
            name="descricao"
            required
            placeholder="Ex: Conta de luz, compra de material..."
            defaultValue={despesa?.descricao ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
            Valor *
          </label>
          <input
            id="valor"
            name="valor"
            required
            inputMode="decimal"
            defaultValue={despesa?.valor ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-700">
            Data *
          </label>
          <input
            id="data"
            name="data"
            type="date"
            required
            defaultValue={toDateInputValue(despesa?.data ?? new Date())}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <input
            id="categoria"
            name="categoria"
            placeholder="Ex: Fornecedor, aluguel, energia..."
            defaultValue={despesa?.categoria ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {despesa ? "Salvar alterações" : "Cadastrar despesa"}
      </button>
    </form>
  );
}
