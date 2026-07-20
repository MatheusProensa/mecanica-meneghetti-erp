"use client";

import { useState } from "react";
import CurrencyInput from "./CurrencyInput";
import { formatNumberToCurrencyInput, parseCurrencyBR } from "@/lib/format";

type Item = { data: string; descricao: string; valor: string };

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function OSItemsEditor({
  initialItens,
}: {
  initialItens?: { data: Date; descricao: string; valor: number }[];
}) {
  const [itens, setItens] = useState<Item[]>(
    initialItens && initialItens.length > 0
      ? initialItens.map((i) => ({
          data: toDateInputValue(i.data),
          descricao: i.descricao,
          valor: formatNumberToCurrencyInput(i.valor),
        }))
      : [{ data: toDateInputValue(new Date()), descricao: "", valor: "" }]
  );

  const total = itens.reduce((sum, item) => sum + parseCurrencyBR(item.valor), 0);

  function updateItem(index: number, field: keyof Item, value: string) {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItens((prev) => [...prev, { data: toDateInputValue(new Date()), descricao: "", valor: "" }]);
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Serviços / Peças
      </label>

      <div className="mt-2 space-y-2">
        {itens.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-md border border-gray-100 p-2 sm:flex-row sm:items-center sm:border-0 sm:p-0"
          >
            <input
              type="date"
              name="data"
              value={item.data}
              onChange={(e) => updateItem(index, "data", e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:w-40"
            />
            <input
              type="text"
              name="descricao"
              placeholder="Descrição (ex: Tornear eixo)"
              value={item.descricao}
              onChange={(e) => updateItem(index, "descricao", e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <div className="flex gap-2">
              <CurrencyInput
                name="valor"
                value={item.valor}
                onChange={(v) => updateItem(index, "valor", v)}
                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:w-36"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={itens.length === 1}
                className="shrink-0 rounded-md border border-gray-200 px-3 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-2 w-full rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 sm:w-auto sm:border-0 sm:py-0 sm:hover:bg-transparent sm:hover:underline"
      >
        + Adicionar item
      </button>

      <p className="mt-3 text-sm text-gray-600">
        Total:{" "}
        <span className="font-semibold text-gray-900">
          {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </p>
    </div>
  );
}
