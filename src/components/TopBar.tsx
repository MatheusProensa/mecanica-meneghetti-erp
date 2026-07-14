"use client";

import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";

export default function TopBar() {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-gray-200 bg-white px-8">
      <form
        className="relative w-full max-w-sm"
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

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          title="Notificações (em breve)"
          className="flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
