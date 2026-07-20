import Image from "next/image";

export default function AuthShell({
  subtitle,
  children,
}: {
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-sidebar px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.28), transparent 55%), radial-gradient(circle at 100% 100%, rgba(37,99,235,0.14), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

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
              <p className="mt-2 text-center text-sm text-gray-500">{subtitle}</p>
            )}

            <div className="mt-6">{children}</div>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Mecânica Meneghetti
        </p>
      </div>
    </div>
  );
}
