import { iconMap, type IconName } from "./icon-map";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  iconColor: string;
  context?: string;
  highlight?: "danger" | "warning" | "success";
  className?: string;
}

const highlightStyles: Record<
  NonNullable<MetricCardProps["highlight"]>,
  { border: string; bg: string; value: string }
> = {
  danger: { border: "border-red-200", bg: "bg-red-50/60", value: "text-red-700" },
  warning: { border: "border-amber-200", bg: "bg-amber-50/60", value: "text-amber-700" },
  success: { border: "border-green-200", bg: "bg-green-50/60", value: "text-green-700" },
};

// deriva o fundo do chip de ícone a partir da cor de texto já passada, sem exigir uma prop nova
const iconBgByColor: Record<string, string> = {
  "text-green-600": "bg-green-50",
  "text-red-600": "bg-red-50",
  "text-amber-600": "bg-amber-50",
  "text-blue-600": "bg-blue-50",
  "text-gray-500": "bg-gray-100",
};

export default function MetricCard({
  label,
  value,
  icon,
  iconColor,
  context,
  highlight,
  className,
}: MetricCardProps) {
  const Icon = iconMap[icon];
  const iconBg = iconBgByColor[iconColor] ?? "bg-gray-100";
  const style = highlight ? highlightStyles[highlight] : null;

  return (
    <div
      className={`min-h-[90px] rounded-xl border p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:min-h-[110px] sm:p-5 ${
        style ? `${style.border} ${style.bg}` : "border-gray-200 bg-white"
      } ${className ?? ""}`}
    >
      <div className="flex flex-col items-center gap-2 text-center sm:gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${iconBg}`}>
          <Icon className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${iconColor}`} />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:text-xs">
          {label}
        </p>
        <p
          className={`text-[20px] font-bold leading-tight tracking-tight sm:text-[26px] ${style ? style.value : "text-gray-900"}`}
        >
          {value}
        </p>
        {context && <p className="text-xs text-gray-500">{context}</p>}
      </div>
    </div>
  );
}
