"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { requestPasswordReset } from "./actions";

export default function EsqueciSenhaPage() {
  const [message, formAction, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <div className="flex flex-1 items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
        <Image
          src="/logo.png"
          alt="Mecânica Meneghetti"
          width={140}
          height={140}
          unoptimized
          className="mx-auto h-[140px] w-[140px] object-contain"
          priority
        />
        <p className="mt-3 text-center text-sm text-gray-500">
          Informe seu e-mail para receber um link de redefinição de senha.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {message && (
            <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Enviando..." : "Enviar link de redefinição"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-4 block text-center text-sm text-gray-500 hover:underline"
        >
          ← Voltar para o login
        </Link>
      </div>
    </div>
  );
}
