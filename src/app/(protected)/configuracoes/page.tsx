import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, User, Wallet, UserCog, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEmpresa } from "@/lib/getEmpresa";
import { getCurrentUser } from "@/lib/getCurrentUser";
import PageHeader from "@/components/ui/PageHeader";
import PasswordForm from "./PasswordForm";
import PixKeyForm from "./PixKeyForm";
import MecanicosSection from "./MecanicosSection";
import EmpresaForm from "./EmpresaForm";
import UsuariosSection from "./UsuariosSection";

const TODAS_SECOES = [
  { key: "conta", label: "Conta", icon: User, requer: null },
  { key: "empresa", label: "Dados da empresa", icon: Building2, requer: "acessarConfiguracoes" },
  { key: "cobranca", label: "Cobrança", icon: Wallet, requer: "acessarConfiguracoes" },
  { key: "mecanicos", label: "Mecânicos", icon: UserCog, requer: "acessarConfiguracoes" },
  { key: "usuarios", label: "Usuários", icon: Users, requer: "gerenciarUsuarios" },
] as const;

type SecaoKey = (typeof TODAS_SECOES)[number]["key"];

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ secao?: string }>;
}) {
  const usuarioAtual = await getCurrentUser();
  if (!usuarioAtual) redirect("/login");

  const secoes = TODAS_SECOES.filter(
    (s) => s.requer === null || usuarioAtual.permissoes[s.requer]
  );

  const { secao: secaoRaw } = await searchParams;
  const secao: SecaoKey = secoes.some((s) => s.key === secaoRaw)
    ? (secaoRaw as SecaoKey)
    : "conta";

  const [session, empresa] = await Promise.all([auth(), getEmpresa()]);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { pixKey: true, dadosBancarios: true },
      })
    : null;

  return (
    <div>
      <PageHeader title="Configurações" />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
          {secoes.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              href={`/configuracoes?secao=${key}`}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                secao === key
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="min-w-0 flex-1 max-w-2xl">
          {secao === "conta" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Conta</h2>
              <div className="mt-4 space-y-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <div>
                  <p className="text-sm text-gray-500">Logado como</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {session?.user?.name} — {session?.user?.email}
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900">Trocar senha</h3>
                  <div className="mt-3">
                    <PasswordForm />
                  </div>
                </div>
              </div>
            </div>
          )}

          {secao === "empresa" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Dados da empresa</h2>
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <EmpresaForm empresa={empresa} />
              </div>
            </div>
          )}

          {secao === "cobranca" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cobrança</h2>
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <PixKeyForm
                  pixKey={user?.pixKey ?? null}
                  dadosBancarios={user?.dadosBancarios ?? null}
                />
              </div>
            </div>
          )}

          {secao === "mecanicos" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mecânicos</h2>
              <p className="mt-1 text-sm text-gray-500">
                Cadastre os mecânicos da oficina para vincular às OS e acompanhar o serviço de
                cada um.
              </p>
              <div className="mt-4">
                <MecanicosSection />
              </div>
            </div>
          )}

          {secao === "usuarios" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Usuários</h2>
              <p className="mt-1 text-sm text-gray-500">
                Crie logins pra outras pessoas e controle o que cada uma pode fazer no sistema.
              </p>
              <div className="mt-4">
                <UsuariosSection meuId={usuarioAtual.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
