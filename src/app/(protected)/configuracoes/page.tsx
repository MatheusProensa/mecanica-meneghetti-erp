import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, User, Wallet, UserCog, Users, KeyRound, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEmpresa } from "@/lib/getEmpresa";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import DarkPatternBg from "@/components/ui/DarkPatternBg";
import PasswordForm from "./PasswordForm";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import PixKeyForm from "./PixKeyForm";
import MecanicosSection from "./MecanicosSection";
import EmpresaForm from "./EmpresaForm";
import UsuariosSection from "./UsuariosSection";

const TODAS_SECOES = [
  {
    key: "conta",
    label: "Conta",
    descricao: "Sua senha e seus dados de acesso",
    icon: User,
    requer: null,
  },
  {
    key: "empresa",
    label: "Dados da empresa",
    descricao: "Nome, endereço e contato usados no PDF",
    icon: Building2,
    requer: "acessarConfiguracoes",
  },
  {
    key: "cobranca",
    label: "Cobrança",
    descricao: "Chave Pix e dados bancários",
    icon: Wallet,
    requer: "acessarConfiguracoes",
  },
  {
    key: "mecanicos",
    label: "Mecânicos",
    descricao: "Equipe vinculada às ordens de serviço",
    icon: UserCog,
    requer: "acessarConfiguracoes",
  },
  {
    key: "usuarios",
    label: "Usuários",
    descricao: "Logins e permissões por página",
    icon: Users,
    requer: "gerenciarUsuarios",
  },
] as const;

type SecaoKey = (typeof TODAS_SECOES)[number]["key"];

const ROLE_INFO: Record<string, { label: string; tone: BadgeTone }> = {
  dono: { label: "Administrador", tone: "purple" },
  funcionario: { label: "Funcionário", tone: "blue" },
  visualizador: { label: "Visualizador", tone: "gray" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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

  const roleInfo = ROLE_INFO[usuarioAtual.role] ?? ROLE_INFO.funcionario;

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Sua conta, os dados da oficina e o acesso da equipe."
      />

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 shadow-sm">
        <DarkPatternBg />
        <div className="relative flex flex-wrap items-center gap-4 px-5 py-5 sm:px-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white ring-1 ring-inset ring-white/20">
            {initials(usuarioAtual.name || "?")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold text-white">{usuarioAtual.name}</p>
              <StatusBadge label={roleInfo.label} tone={roleInfo.tone} />
            </div>
            <p className="mt-0.5 truncate text-sm text-gray-300">{usuarioAtual.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav className="flex flex-wrap gap-1.5 lg:w-64 lg:shrink-0 lg:flex-col lg:flex-nowrap">
          {secoes.map(({ key, label, descricao, icon: Icon }) => {
            const ativo = secao === key;
            return (
              <Link
                key={key}
                href={`/configuracoes?secao=${key}`}
                className={`flex shrink-0 items-start gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors lg:w-full ${
                  ativo
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    ativo ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="hidden min-w-0 lg:block">
                  <span className={`block font-medium ${ativo ? "text-blue-700" : "text-gray-900"}`}>
                    {label}
                  </span>
                  <span className="block truncate text-xs text-gray-500">{descricao}</span>
                </span>
                <span className="whitespace-nowrap font-medium lg:hidden">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0 max-w-2xl flex-1">
          {secao === "conta" && (
            <SectionCard icon={KeyRound} title="Conta" subtitle="Seus dados de acesso e senha">
              <div className="space-y-6">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Logado como
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {session?.user?.name} — {session?.user?.email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
                  <div className="mt-3">
                    <PushNotificationToggle />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Trocar senha</h3>
                  <div className="mt-3">
                    <PasswordForm />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {secao === "empresa" && (
            <SectionCard
              icon={Building2}
              title="Dados da empresa"
              subtitle="Usados no cabeçalho dos PDFs de cobrança"
            >
              <EmpresaForm empresa={empresa} />
            </SectionCard>
          )}

          {secao === "cobranca" && (
            <SectionCard icon={Wallet} title="Cobrança" subtitle="Chave Pix e dados bancários">
              <PixKeyForm
                pixKey={user?.pixKey ?? null}
                dadosBancarios={user?.dadosBancarios ?? null}
              />
            </SectionCard>
          )}

          {secao === "mecanicos" && (
            <SectionCard
              icon={UserCog}
              title="Mecânicos"
              subtitle="Cadastre a equipe para vincular às OS e acompanhar o serviço de cada um"
            >
              <MecanicosSection />
            </SectionCard>
          )}

          {secao === "usuarios" && (
            <SectionCard
              icon={ShieldCheck}
              title="Usuários"
              subtitle="Crie logins e controle o que cada pessoa vê, edita e exclui"
            >
              <UsuariosSection meuId={usuarioAtual.id} />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">{children}</div>
    </div>
  );
}
