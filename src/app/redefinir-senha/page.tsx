import Image from "next/image";
import Link from "next/link";
import RedefinirSenhaForm from "./RedefinirSenhaForm";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
        <Image
          src="/logo.png"
          alt="Mecânica Meneghetti"
          width={140}
          height={140}
          unoptimized
          className="mx-auto h-[140px] w-[140px] object-contain"
          priority
        />

        {token ? (
          <>
            <p className="mt-3 text-center text-sm text-gray-500">
              Escolha uma nova senha para sua conta.
            </p>
            <RedefinirSenhaForm token={token} />
          </>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Link de redefinição inválido. Solicite um novo.
            </p>
            <Link
              href="/esqueci-senha"
              className="block w-full rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Solicitar novo link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
