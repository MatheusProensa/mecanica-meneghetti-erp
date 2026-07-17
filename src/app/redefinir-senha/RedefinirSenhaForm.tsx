"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword } from "./actions";

export default function RedefinirSenhaForm({ token }: { token: string }) {
  const [message, formAction, pending] = useActionState(resetPassword, undefined);
  const sucesso = message === "sucesso";

  if (sucesso) {
    return (
      <div className="mt-6 space-y-4">
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Senha redefinida com sucesso.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700">
          Nova senha
        </label>
        <input
          id="novaSenha"
          name="novaSenha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
          Confirmar nova senha
        </label>
        <input
          id="confirmarSenha"
          name="confirmarSenha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {message && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
