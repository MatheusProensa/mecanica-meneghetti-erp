"use client";

import { useActionState } from "react";
import { updatePassword } from "./actions";

export default function PasswordForm() {
  const [message, formAction, pending] = useActionState(updatePassword, undefined);
  const success = message === "Senha atualizada com sucesso.";

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="senhaAtual"
          className="block text-sm font-medium text-gray-700"
        >
          Senha atual
        </label>
        <input
          id="senhaAtual"
          name="senhaAtual"
          type="password"
          required
          className="mt-1 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="novaSenha"
          className="block text-sm font-medium text-gray-700"
        >
          Nova senha
        </label>
        <input
          id="novaSenha"
          name="novaSenha"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="confirmarSenha"
          className="block text-sm font-medium text-gray-700"
        >
          Confirmar nova senha
        </label>
        <input
          id="confirmarSenha"
          name="confirmarSenha"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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
        {pending ? "Salvando..." : "Atualizar senha"}
      </button>
    </form>
  );
}
