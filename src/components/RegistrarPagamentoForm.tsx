import CurrencyInput from "./CurrencyInput";

/** Formulário de "registrar pagamento parcial" — usado em Devedores e Extras. */
export default function RegistrarPagamentoForm({
  action,
  comObservacao = false,
}: {
  action: (formData: FormData) => void;
  /** Devedores tem um campo de observação livre que Extras não tem. */
  comObservacao?: boolean;
}) {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-sm font-semibold text-gray-900">Registrar pagamento</h3>
      <form action={action} className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-700">
            Data *
          </label>
          <input
            id="data"
            name="data"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
            Valor *
          </label>
          <CurrencyInput
            id="valor"
            name="valor"
            required
            className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className={comObservacao ? "" : "sm:col-span-2"}>
          <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700">
            Forma de pagamento
          </label>
          <input
            id="formaPagamento"
            name="formaPagamento"
            placeholder="Pix, dinheiro, cartão..."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {comObservacao && (
          <div>
            <label htmlFor="observacao" className="block text-sm font-medium text-gray-700">
              Observação
            </label>
            <input
              id="observacao"
              name="observacao"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 sm:w-auto"
          >
            Registrar pagamento
          </button>
        </div>
      </form>
    </div>
  );
}
