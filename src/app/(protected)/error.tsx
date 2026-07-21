"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h1 className="text-base font-semibold text-gray-900">Algo deu errado</h1>
      <p className="max-w-sm text-sm text-gray-500">
        Ocorreu um erro inesperado ao carregar esta página. Você pode tentar novamente ou voltar
        para o início.
      </p>
      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row">
        <Link
          href="/"
          className="min-h-11 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Ir para o Dashboard
        </Link>
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
