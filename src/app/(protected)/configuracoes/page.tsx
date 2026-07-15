import { auth } from "@/lib/auth";
import PasswordForm from "./PasswordForm";

export default async function ConfiguracoesPage() {
  const session = await auth();

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Conta</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Logado como</p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {session?.user?.name} — {session?.user?.email}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Trocar senha</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
