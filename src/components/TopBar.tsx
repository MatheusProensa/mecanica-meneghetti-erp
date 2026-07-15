"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
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

      <form
        className="relative hidden w-full max-w-sm lg:block"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q");
          if (typeof q === "string" && q.trim()) {
            router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
          }
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="q"
          placeholder="Pesquisar cliente, OS, telefone, nota..."
          className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </form>
    </header>
  );
}
