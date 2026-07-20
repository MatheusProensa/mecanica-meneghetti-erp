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
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-inset ring-gray-100">
              <Image
                src="/logo.png"
                alt="Mecânica Meneghetti"
                width={64}
                height={64}
                unoptimized
                className="h-14 w-14 object-contain"
                priority
              />
            </div>
            <h1 className="mt-4 text-center text-lg font-semibold tracking-tight text-gray-900">
              Mecânica Meneghetti
            </h1>
            {subtitle && (
              <p className="mt-1 text-center text-sm text-gray-500">{subtitle}</p>
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
