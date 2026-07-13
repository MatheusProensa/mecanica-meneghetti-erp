"use client";

import { useState } from "react";

type Item = { descricao: string; valor: string };

export default function OSItemsEditor({
  initialItens,
}: {
  initialItens?: { descricao: string; valor: number }[];
}) {
  const [itens, setItens] = useState<Item[]>(
    initialItens && initialItens.length > 0
      ? initialItens.map((i) => ({ descricao: i.descricao, valor: String(i.valor) }))
      : [{ descricao: "", valor: "" }]
  );

  const total = itens.reduce((sum, item) => {
    const v = Number(item.valor.replace(",", "."));
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);

  function updateItem(index: number, field: keyof Item, value: string) {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
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
        Serviços / Peças
      </label>

      <div className="mt-2 space-y-2">
        {itens.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              name="descricao"
              placeholder="Descrição (ex: Tornear eixo)"
              value={item.descricao}
              onChange={(e) => updateItem(index, "descricao", e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <input
              type="text"
              inputMode="decimal"
              name="valor"
              placeholder="Valor"
              value={item.valor}
              onChange={(e) => updateItem(index, "valor", e.target.value)}
              className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={itens.length === 1}
              className="rounded-md border border-gray-200 px-3 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40"
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

      <p className="mt-3 text-sm text-gray-600">
        Total:{" "}
        <span className="font-semibold text-gray-900">
          {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </p>
    </div>
  );
}
