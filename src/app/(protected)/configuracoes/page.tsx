import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import PasswordForm from "./PasswordForm";
import PixKeyForm from "./PixKeyForm";

export default async function ConfiguracoesPage() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { pixKey: true } })
    : null;

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Configurações" />

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Conta</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <p className="text-sm text-gray-500">Logado como</p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {session?.user?.name} — {session?.user?.email}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Trocar senha</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <PasswordForm />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Cobrança</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <PixKeyForm pixKey={user?.pixKey ?? null} />
        </div>
      </div>
    </div>
  );
}
