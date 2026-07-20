import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import RedefinirSenhaForm from "./RedefinirSenhaForm";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell subtitle={token ? "Escolha uma nova senha para sua conta." : undefined}>
      {token ? (
        <RedefinirSenhaForm token={token} />
      ) : (
        <div className="space-y-4">
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Link de redefinição inválido. Solicite um novo.
          </p>
          <Link
            href="/esqueci-senha"
            className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
          >
            Solicitar novo link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
