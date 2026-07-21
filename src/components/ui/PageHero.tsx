import Link from "next/link";
import DarkPatternBg from "./DarkPatternBg";

export interface PageHeroProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export default function PageHero({ title, description, action }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 shadow-sm">
      <DarkPatternBg />
      <div className="relative flex flex-col items-center gap-4 px-5 py-6 text-center sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 sm:text-left">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-300">{description}</p>}
        </div>
        {action && (
          <Link
            href={action.href}
            className="shrink-0 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
