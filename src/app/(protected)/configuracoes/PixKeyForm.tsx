"use client";

import { useActionState } from "react";
import { updatePixKey } from "./actions";

export default function PixKeyForm({ pixKey }: { pixKey: string | null }) {
  const [message, formAction, pending] = useActionState(updatePixKey, undefined);
  const success = message === "Dados de pagamento atualizados com sucesso.";

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700">
          Dados para pagamento
        </label>
        <textarea
          id="pixKey"
          name="pixKey"
          rows={4}
          defaultValue={pixKey ?? ""}
          placeholder={"Ex:\nChave Pix: 000.000.000-00\nBanco: Nome do banco (000)\nAgência: 0000\nConta: 00000000-0"}
          className="mt-1 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Chave Pix e/ou dados bancários (banco, agência, conta) — aparece como opção nos PDFs de
          cobrança gerados na página de cada cliente.
        </p>
      </div>

      {message && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar dados de pagamento"}
      </button>
    </form>
  );
}
