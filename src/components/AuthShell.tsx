import Image from "next/image";
import DarkPatternBg from "@/components/ui/DarkPatternBg";

export default function AuthShell({
  subtitle,
  children,
}: {
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-sidebar px-4 py-10">
      <DarkPatternBg glowPosition="50% 0%" glowSize="900px" />

      <div className="relative w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_24px_70px_-20px_rgba(0,0,0,0.55)]">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />
          <div className="p-6 sm:p-8">
            <Image
              src="/logo.png"
              alt="Mecânica Meneghetti"
              width={160}
              height={160}
              unoptimized
              className="mx-auto h-[140px] w-[140px] object-contain"
              priority
            />
            {subtitle && (
              <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
            )}

            <div className="mt-6">{children}</div>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Mecânica Meneghetti
        </p>
        <p className="mt-1 text-center text-[11px] text-gray-500">
          Desenvolvido por Matheus Proensa
        </p>
      </div>
    </div>
  );
}
