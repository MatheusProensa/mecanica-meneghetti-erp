import Link from "next/link";

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
      <Link href={backHref} className="text-sm text-gray-500 hover:underline">
        ← {backLabel}
      </Link>
      <h1 className="mt-1 text-xl font-semibold text-gray-900">{title}</h1>
    </div>
  );
}
