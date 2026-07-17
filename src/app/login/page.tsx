"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

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
          Entre com seu e-mail e senha para acessar o sistema.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              wrapperClassName="mt-1"
              className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link
          href="/esqueci-senha"
          className="mt-4 block text-center text-sm text-gray-500 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>
    </div>
  );
}
