import OSItemsEditor from "./OSItemsEditor";
import PhoneInput from "@/components/PhoneInput";
import type { Cliente, Mecanico, OrdemServico, ItemServico } from "@/generated/prisma/client";

const statusOptions = [
  { value: "aberta", label: "Aberta" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "aguardando_peca", label: "Aguardando peça" },
  { value: "aguardando_cliente", label: "Aguardando cliente" },
  { value: "concluida", label: "Concluída" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelada", label: "Cancelada" },
];

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function OSForm({
  clientes,
  mecanicos,
  os,
  defaultClienteId,
  action,
  readOnly = false,
}: {
  clientes: Cliente[];
  mecanicos: Mecanico[];
  os?: OrdemServico & { itens: ItemServico[] };
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
            defaultValue={os?.clienteId ?? defaultClienteId ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
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
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <PhoneInput id="telefone" name="telefone" defaultValue={os?.telefone} />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={os?.status ?? "aberta"}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="mecanicoId"
            className="block text-sm font-medium text-gray-700"
          >
            Mecânico responsável
          </label>
          <select
            id="mecanicoId"
            name="mecanicoId"
            defaultValue={os?.mecanicoId ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">Não definido</option>
            {mecanicos.map((mecanico) => (
              <option key={mecanico.id} value={mecanico.id}>
                {mecanico.nome}
              </option>
            ))}
          </select>
          {!os?.mecanicoId && os?.mecanicoResponsavel && (
            <p className="mt-1 text-xs text-gray-400">
              Registro anterior: {os.mecanicoResponsavel}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="previsaoEntrega"
            className="block text-sm font-medium text-gray-700"
          >
            Previsão de entrega
          </label>
          <input
            id="previsaoEntrega"
            name="previsaoEntrega"
            type="date"
            defaultValue={toDateInputValue(os?.previsaoEntrega)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label
            htmlFor="formaPagamento"
            className="block text-sm font-medium text-gray-700"
          >
            Forma de pagamento
          </label>
          <input
            id="formaPagamento"
            name="formaPagamento"
            placeholder="Pix, dinheiro, cartão..."
            defaultValue={os?.formaPagamento ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
      </div>

      <OSItemsEditor initialItens={os?.itens} />

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={os?.observacoes ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>
      </fieldset>

      {!readOnly && (
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
        >
          {os ? "Salvar alterações" : "Criar ordem de serviço"}
        </button>
      )}
    </form>
  );
}
