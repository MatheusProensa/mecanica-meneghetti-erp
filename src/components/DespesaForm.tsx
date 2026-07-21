"use client";

import { useState } from "react";
import type { Despesa, DespesaItem } from "@/generated/prisma/client";
import DespesaItemsEditor from "./DespesaItemsEditor";
import CurrencyInput from "./CurrencyInput";
import { formatNumberToCurrencyInput } from "@/lib/format";

const CATEGORIAS = [
  "Funcionários",
  "Peças",
  "Fornecedores",
  "Aluguel",
  "Energia",
  "Água",
  "Outros",
];

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function DespesaForm({
  despesa,
  itens,
  anexoUrl,
  action,
  readOnly = false,
}: {
  despesa?: Despesa;
  itens?: DespesaItem[];
  anexoUrl?: string | null;
  action: (formData: FormData) => void;
  readOnly?: boolean;
}) {
  const [categoria, setCategoria] = useState(despesa?.categoria ?? "");
  const [valor, setValor] = useState(() => formatNumberToCurrencyInput(despesa?.valor));
  const isFuncionario = categoria === "Funcionários";
  const isPecas = categoria === "Peças";

  return (
    <form action={action} className="space-y-4">
      <fieldset disabled={readOnly} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <select
            id="categoria"
            name="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
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
            defaultValue={toDateInputValue(despesa?.data ?? new Date())}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
            Descrição *
          </label>
          <input
            id="descricao"
            name="descricao"
            required
            placeholder={
              isFuncionario
                ? "Ex: Pagamento semanal - Victor"
                : "Ex: Conta de luz, compra de material..."
            }
            defaultValue={despesa?.descricao ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="fornecedor" className="block text-sm font-medium text-gray-700">
            {isFuncionario ? "Funcionário" : "Fornecedor"}
          </label>
          <input
            id="fornecedor"
            name="fornecedor"
            placeholder={isFuncionario ? "Ex: Victor" : "Ex: Casa dos Rolamentos"}
            defaultValue={despesa?.fornecedor ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700">
            Forma de pagamento
          </label>
          <input
            id="formaPagamento"
            name="formaPagamento"
            placeholder="Pix, dinheiro, cartão..."
            defaultValue={despesa?.formaPagamento ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
            Valor total *
          </label>
          <div className="mt-1 max-w-xs">
            <CurrencyInput id="valor" name="valor" required value={valor} onChange={setValor} />
          </div>
        </div>
      </div>

      {isPecas && <DespesaItemsEditor initialItens={itens} onUseTotal={setValor} />}

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={despesa?.observacoes ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="anexo" className="block text-sm font-medium text-gray-700">
          Nota fiscal ou comprovante (PDF ou imagem)
        </label>
        <input
          id="anexo"
          name="anexo"
          type="file"
          accept="application/pdf,image/*"
          className="mt-1 w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
        />
        {anexoUrl && (
          <div className="mt-2 flex items-center gap-3">
            <a
              href={anexoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand-600 hover:underline"
            >
              Ver anexo atual
            </a>
            <label className="flex items-center gap-1.5 text-sm text-gray-600">
              <input type="checkbox" name="removerAnexo" className="rounded border-gray-300" />
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
          {despesa ? "Salvar alterações" : "Cadastrar despesa"}
        </button>
      )}
    </form>
  );
}
