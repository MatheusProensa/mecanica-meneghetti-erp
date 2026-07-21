"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, Eye, EyeOff } from "lucide-react";
import { useValoresVisibilidade } from "./ValoresVisibilidadeContext";

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/";
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { oculto, alternar } = useValoresVisibilidade();

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    if (typeof q === "string" && q.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
      setMobileSearchOpen(false);
    }
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      {mobileSearchOpen ? (
        <form className="relative flex-1 lg:hidden" onSubmit={handleSearchSubmit}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            autoFocus
            autoComplete="off"
            placeholder="Pesquisar cliente, OS, telefone, nota..."
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-9 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:text-gray-600"
            aria-label="Fechar busca"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-2 lg:hidden">
            <Image
              src="/logo.png"
              alt="Mecânica Meneghetti"
              width={28}
              height={28}
              unoptimized
              className="h-7 w-7 shrink-0 object-contain"
            />
            <p className="truncate text-sm font-semibold text-gray-900">Oficina Meneghetti</p>
          </div>

          {isDashboard && (
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={alternar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label={oculto ? "Mostrar valores" : "Ocultar valores"}
            title={oculto ? "Mostrar valores" : "Ocultar valores"}
          >
            {oculto ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </>
      )}

      {isDashboard && (
        <form className="relative hidden w-full max-w-sm lg:block" onSubmit={handleSearchSubmit}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            autoComplete="off"
            placeholder="Pesquisar cliente, OS, telefone, nota..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>
      )}

      <button
        type="button"
        onClick={alternar}
        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:ml-auto lg:flex"
        aria-label={oculto ? "Mostrar valores" : "Ocultar valores"}
        title={oculto ? "Mostrar valores" : "Ocultar valores"}
      >
        {oculto ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </header>
  );
}
