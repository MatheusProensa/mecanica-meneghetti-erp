"use client";

import { useActionState } from "react";
import { updateEmpresa } from "./actions";
import type { DadosEmpresa } from "@/lib/business";

export default function EmpresaForm({ empresa }: { empresa: DadosEmpresa }) {
  const [message, formAction, pending] = useActionState(updateEmpresa, undefined);
  const success = message === "Dados da empresa atualizados com sucesso.";

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
            Nome da empresa *
          </label>
          <input
            id="nome"
            name="nome"
            required
            defaultValue={empresa.nome}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
            CNPJ
          </label>
          <input
            id="cnpj"
            name="cnpj"
            defaultValue={empresa.cnpj}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
            Telefone *
          </label>
          <input
            id="telefone"
            name="telefone"
            required
            defaultValue={empresa.telefone}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
            Cidade *
          </label>
          <input
            id="cidade"
            name="cidade"
            required
            defaultValue={empresa.cidade}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
          Endereço *
        </label>
        <input
          id="endereco"
          name="endereco"
          required
          defaultValue={empresa.endereco}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <p className="text-xs text-gray-500">
        Esses dados aparecem no cabeçalho do PDF de cobrança gerado pra clientes.
      </p>

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
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar dados da empresa"}
      </button>
    </form>
  );
}
