import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FormPageHeader({
  backHref,
  backLabel,
  title,
}: {
  backHref: string;
  backLabel: string;
  title: string;
}) {
  return (
    <div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-[var(--shadow-card)] hover:bg-gray-50"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-gray-900">{title}</h1>
    </div>
  );
}
