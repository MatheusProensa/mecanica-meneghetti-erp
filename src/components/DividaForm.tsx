import type { Cliente, Divida, ItemDivida } from "@/generated/prisma/client";
import DividaItemsEditor from "./DividaItemsEditor";

export default function DividaForm({
  divida,
  clientes,
  defaultClienteId,
  action,
  readOnly = false,
}: {
  divida?: Divida & { itens: ItemDivida[] };
  clientes: Cliente[];
  defaultClienteId?: string;
  action: (formData: FormData) => void;
  readOnly?: boolean;
}) {
  return (
    <form action={action} className="space-y-4">
      <fieldset disabled={readOnly} className="space-y-4">
      <div>
        <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700">
          Cliente *
        </label>
        <select
          id="clienteId"
          name="clienteId"
          required
          defaultValue={divida?.clienteId ?? defaultClienteId ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-sm"
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

      <DividaItemsEditor initialItens={divida?.itens} />

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
