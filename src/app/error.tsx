"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function RootError({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h1 className="text-base font-semibold text-gray-900">Algo deu errado</h1>
      <p className="max-w-sm text-sm text-gray-500">
        Ocorreu um erro inesperado. Tente novamente em instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 min-h-11 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
