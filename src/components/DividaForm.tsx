import type { Cliente, Divida } from "@/generated/prisma/client";
import CurrencyInput from "./CurrencyInput";

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function DividaForm({
  divida,
  clientes,
  defaultClienteId,
  action,
  readOnly = false,
}: {
  divida?: Divida;
  clientes: Cliente[];
  defaultClienteId?: string;
  action: (formData: FormData) => void;
  readOnly?: boolean;
}) {
  return (
    <form action={action} className="space-y-4">
      <fieldset disabled={readOnly} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700">
            Cliente *
          </label>
          <select
            id="clienteId"
            name="clienteId"
            required
            defaultValue={divida?.clienteId ?? defaultClienteId ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>
              Selecione um cliente
            </option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dataServico" className="block text-sm font-medium text-gray-700">
            Data do serviço *
          </label>
          <input
            id="dataServico"
            name="dataServico"
            type="date"
            required
            defaultValue={toDateInputValue(divida?.dataServico ?? new Date())}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="valorOriginal" className="block text-sm font-medium text-gray-700">
            Valor original da dívida *
          </label>
          <CurrencyInput
            id="valorOriginal"
            name="valorOriginal"
            required
            defaultValue={divida?.valorOriginal}
            className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          placeholder="Ex: conserto do motor, combinado pagar em 3x..."
          defaultValue={divida?.observacoes ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      </fieldset>

      {!readOnly && (
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
        >
          {divida ? "Salvar alterações" : "Cadastrar dívida"}
        </button>
      )}
    </form>
  );
}
