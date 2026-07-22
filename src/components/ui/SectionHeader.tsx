import Link from "next/link";
import { iconMap, type IconName } from "./icon-map";

const iconBgByColor: Record<string, string> = {
  "text-green-600": "bg-green-50",
  "text-red-600": "bg-red-50",
  "text-amber-600": "bg-amber-50",
  "text-brand-600": "bg-blue-50",
  "text-gray-600": "bg-gray-100",
};

export default function SectionHeader({
  icon,
  iconColor = "text-brand-600",
  title,
  action,
}: {
  icon: IconName;
  iconColor?: string;
  title: string;
  action?: { label: string; href: string };
}) {
  const Icon = iconMap[icon];
  const iconBg = iconBgByColor[iconColor] ?? "bg-gray-100";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </span>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 text-sm font-medium text-brand-600 hover:text-blue-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
