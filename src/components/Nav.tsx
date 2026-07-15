"use client";

import { useEffect, useState } from "react";
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
  X,
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

export default function Nav({
  userName,
  open,
  onClose,
}: {
  userName: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        style={{
          translate: "none",
          transform: "none",
          left: isDesktop ? 0 : open ? 0 : -280,
        }}
        className="fixed inset-y-0 z-50 flex w-[280px] shrink-0 flex-col bg-sidebar text-gray-300 lg:static lg:z-auto lg:w-64"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-sidebar-hover hover:text-gray-200 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

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
    </>
  );
}
