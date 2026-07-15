"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Wallet,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/(protected)/actions";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/os", label: "Ordens de Serviço", icon: Wrench },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/notas", label: "Notas", icon: FileText },
];

const secondaryLinks = [
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/ajuda", label: "Ajuda", icon: HelpCircle },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md border-l-[3px] py-2.5 pl-2.5 pr-3 text-sm font-medium transition-colors ${
        active
          ? "border-l-blue-600 bg-sidebar-active text-blue-400"
          : "border-l-transparent text-gray-400 hover:bg-sidebar-hover hover:text-gray-200"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </Link>
  );
}

export default function Nav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-gray-300">
      <div className="flex flex-col items-center gap-2 border-b border-sidebar-hover px-5 py-6 text-center">
        <Image
          src="/logo.png"
          alt="Mecânica Meneghetti"
          width={88}
          height={88}
          unoptimized
          className="h-22 w-22 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{userName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            active={link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)}
          />
        ))}

        <div className="my-3 border-t border-sidebar-hover" />

        {secondaryLinks.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            active={pathname.startsWith(link.href)}
          />
        ))}
      </nav>

      <div className="flex items-center gap-2 border-t border-sidebar-hover p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
          {initials(userName || "?")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{userName}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Sair"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-sidebar-hover hover:text-gray-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
