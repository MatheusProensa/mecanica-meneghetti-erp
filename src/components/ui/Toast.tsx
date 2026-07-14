"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Toast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sucesso = searchParams.get("sucesso");
  const erro = searchParams.get("erro");

  useEffect(() => {
    if (!sucesso && !erro) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("sucesso");
      params.delete("erro");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 4000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sucesso, erro]);

  if (!sucesso && !erro) return null;

  const isError = Boolean(erro);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2 rounded-lg border px-4 py-3 shadow-lg ${
        isError ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
      }`}
    >
      {isError ? (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      )}
      <p className={`text-sm ${isError ? "text-red-800" : "text-emerald-800"}`}>
        {erro ?? sucesso}
      </p>
    </div>
  );
}
