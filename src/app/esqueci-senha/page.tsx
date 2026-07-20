"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useActionState } from "react";
import AuthShell from "@/components/AuthShell";
import { requestPasswordReset } from "./actions";

export default function EsqueciSenhaPage() {
  const [message, formAction, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <AuthShell subtitle="Informe seu e-mail para receber um link de redefinição de senha.">
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {message && (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Enviar link de redefinição"}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-4 block text-center text-sm text-gray-500 hover:text-blue-600 hover:underline"
      >
        ← Voltar para o login
      </Link>
    </AuthShell>
  );
}
