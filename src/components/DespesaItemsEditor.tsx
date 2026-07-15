"use client";

import { useState } from "react";
import CurrencyInput from "./CurrencyInput";
import { formatNumberToCurrencyInput, parseCurrencyBR } from "@/lib/format";

type Item = { descricao: string; valor: string };

export default function DespesaItemsEditor({
  initialItens,
  onUseTotal,
}: {
  initialItens?: { descricao: string; valor: number }[];
  onUseTotal?: (total: string) => void;
}) {
  const [itens, setItens] = useState<Item[]>(
    initialItens && initialItens.length > 0
      ? initialItens.map((i) => ({ descricao: i.descricao, valor: formatNumberToCurrencyInput(i.valor) }))
      : []
  );

  const total = itens.reduce((sum, item) => sum + parseCurrencyBR(item.valor), 0);

  function updateItem(index: number, field: keyof Item, value: string) {
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItens((prev) => [...prev, { descricao: "", valor: "" }]);
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Itens comprados (opcional)
      </label>
      <p className="mt-0.5 text-xs text-gray-500">
        Use para detalhar uma compra com várias peças — o valor total é somado automaticamente.
      </p>

      <div className="mt-2 space-y-2">
        {itens.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              name="itemDescricao"
              placeholder="Descrição (ex: Rolamento)"
              value={item.descricao}
              onChange={(e) => updateItem(index, "descricao", e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <CurrencyInput
              name="itemValor"
              value={item.valor}
              onChange={(v) => updateItem(index, "valor", v)}
              className="w-36 rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded-md border border-gray-200 px-3 text-sm text-gray-500 hover:bg-gray-50"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-2 text-sm font-medium text-gray-900 hover:underline"
      >
        + Adicionar item
      </button>

      {itens.length > 0 && (
        <p className="mt-3 flex items-center gap-3 text-sm text-gray-600">
          <span>
            Total dos itens:{" "}
            <span className="font-semibold text-gray-900">
              {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </span>
          {onUseTotal && total > 0 && (
            <button
              type="button"
              onClick={() => onUseTotal(formatNumberToCurrencyInput(total))}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Usar este valor
            </button>
          )}
        </p>
      )}
    </div>
  );
}
