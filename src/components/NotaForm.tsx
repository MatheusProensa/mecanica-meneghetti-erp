import type { Cliente, Nota } from "@/generated/prisma/client";
import CurrencyInput from "./CurrencyInput";

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function NotaForm({
  nota,
  pdfUrl,
  clientes,
  ordens,
  action,
  readOnly = false,
}: {
  nota?: Nota;
  pdfUrl?: string | null;
  clientes: Cliente[];
  ordens: { id: number; clienteNome: string }[];
  action: (formData: FormData) => void;
  readOnly?: boolean;
}) {
  return (
    <form action={action} className="space-y-4">
      <fieldset disabled={readOnly} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
            Número da nota *
          </label>
          <input
            id="numero"
            name="numero"
            required
            defaultValue={nota?.numero ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
            Tipo *
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={nota?.tipo ?? "emitida"}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="emitida">Nota emitida</option>
            <option value="recebida">Nota recebida</option>
          </select>
        </div>

        <div>
          <label htmlFor="dataEmissao" className="block text-sm font-medium text-gray-700">
            Data de emissão *
          </label>
          <input
            id="dataEmissao"
            name="dataEmissao"
            type="date"
            required
            defaultValue={toDateInputValue(nota?.dataEmissao ?? new Date())}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
            Valor
          </label>
          <CurrencyInput
            id="valor"
            name="valor"
            defaultValue={nota?.valor}
            placeholder="Deixe em branco se não souber"
            className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <select
            id="clienteId"
            name="clienteId"
            defaultValue={nota?.clienteId ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Não vinculada</option>
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
            defaultValue={nota?.ordemServicoId ?? ""}
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
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          placeholder="Ex: NF compra de peças, conserto do torno..."
          defaultValue={nota?.observacoes ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="arquivoPdf" className="block text-sm font-medium text-gray-700">
          Anexo em PDF
        </label>
        <input
          id="arquivoPdf"
          name="arquivoPdf"
          type="file"
          accept="application/pdf"
          className="mt-1 w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
        />
        {pdfUrl && (
          <div className="mt-2 flex items-center gap-3">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand-600 hover:underline"
            >
              Ver anexo atual
            </a>
            <label className="flex items-center gap-1.5 text-sm text-gray-600">
              <input type="checkbox" name="removerArquivo" className="rounded border-gray-300" />
              Remover anexo
            </label>
          </div>
        )}
      </div>
      </fieldset>

      {!readOnly && (
        <button
          type="submit"
          className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 sm:w-auto"
        >
          {nota ? "Salvar alterações" : "Cadastrar nota"}
        </button>
      )}
    </form>
  );
}
