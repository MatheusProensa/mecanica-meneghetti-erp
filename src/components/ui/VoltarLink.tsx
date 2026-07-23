import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Link "voltar" no padrão do sistema (pílula com ícone) — usado no topo das páginas de detalhe. */
export default function VoltarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
