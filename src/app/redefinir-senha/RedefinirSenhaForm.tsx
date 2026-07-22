"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useActionState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { resetPassword } from "./actions";

export default function RedefinirSenhaForm({ token }: { token: string }) {
  const [message, formAction, pending] = useActionState(resetPassword, undefined);
  const sucesso = message === "sucesso";

  if (sucesso) {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Senha redefinida com sucesso.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700">
          Nova senha
        </label>
        <div className="relative mt-1">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <PasswordInput
            id="novaSenha"
            name="novaSenha"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
          Confirmar nova senha
        </label>
        <div className="relative mt-1">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <PasswordInput
            id="confirmarSenha"
            name="confirmarSenha"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {message && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
