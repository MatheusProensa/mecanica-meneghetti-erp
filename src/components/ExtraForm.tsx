import type { Cliente, Mecanico, ExtraFuncionario } from "@/generated/prisma/client";
import CurrencyInput from "./CurrencyInput";

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function ExtraForm({
  extra,
  mecanicos,
  clientes,
  ordens,
  defaultMecanicoId,
  action,
  readOnly = false,
}: {
  extra?: ExtraFuncionario;
  mecanicos: Mecanico[];
  clientes: Cliente[];
  ordens: { id: number; clienteNome: string }[];
  defaultMecanicoId?: string;
  action: (formData: FormData) => void;
  readOnly?: boolean;
}) {
  return (
    <form action={action} className="space-y-4">
      <fieldset disabled={readOnly} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="mecanicoId" className="block text-sm font-medium text-gray-700">
            Funcionário *
          </label>
          <select
            id="mecanicoId"
            name="mecanicoId"
            required
            defaultValue={extra?.mecanicoId ?? defaultMecanicoId ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>
              Selecione um funcionário
            </option>
            {mecanicos.map((mecanico) => (
              <option key={mecanico.id} value={mecanico.id}>
                {mecanico.nome}
              </option>
            ))}
          </select>
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
            defaultValue={toDateInputValue(extra?.data ?? new Date())}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <select
            id="clienteId"
            name="clienteId"
            defaultValue={extra?.clienteId ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Não vinculado</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ordemServicoId" className="block text-sm font-medium text-gray-700">
            Ordem de Serviço
          </label>
          <select
            id="ordemServicoId"
            name="ordemServicoId"
            defaultValue={extra?.ordemServicoId ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Não vinculada</option>
            {ordens.map((os) => (
              <option key={os.id} value={os.id}>
                #{String(os.id).padStart(4, "0")} — {os.clienteNome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="valorServico" className="block text-sm font-medium text-gray-700">
            Valor total cobrado do cliente *
          </label>
          <CurrencyInput
            id="valorServico"
            name="valorServico"
            required
            defaultValue={extra?.valorServico}
            className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="valorExtra" className="block text-sm font-medium text-gray-700">
            Valor do extra do funcionário *
          </label>
          <CurrencyInput
            id="valorExtra"
            name="valorExtra"
            required
            defaultValue={extra?.valorExtra}
            className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="outrosCustos" className="block text-sm font-medium text-gray-700">
            Outros custos vinculados
          </label>
          <CurrencyInput
            id="outrosCustos"
            name="outrosCustos"
            defaultValue={extra?.outrosCustos}
            placeholder="Deixe em branco se não houver"
            className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
          Descrição do serviço *
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          required
          defaultValue={extra?.descricao ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      </fieldset>

      {!readOnly && (
        <button
          type="submit"
          className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 sm:w-auto"
        >
          {extra ? "Salvar alterações" : "Cadastrar extra"}
        </button>
      )}
    </form>
  );
}
