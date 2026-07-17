"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Nav from "./Nav";
import TopBar from "./TopBar";
import type { Permissoes } from "@/lib/permissions";

export default function AppShell({
  userName,
  permissoes,
  children,
}: {
  userName: string;
  permissoes: Permissoes;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setSidebarOpen(false);
  }

  return (
    <div className="flex flex-1">
      <Nav
        userName={userName}
        permissoes={permissoes}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
