import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularPermissoes, type Permissoes } from "@/lib/permissions";
import type { UserRole } from "@/generated/prisma/client";

export interface UsuarioAtual {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissoes: Permissoes;
}

/** Busca o usuário logado (via sessão) já com as permissões calculadas.
 * Retorna null se não estiver autenticado ou a conta não existir mais. */
export async function getCurrentUser(): Promise<UsuarioAtual | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      podeVerDashboard: true,
      podeVerClientes: true,
      podeEditarClientes: true,
      podeExcluirClientes: true,
      podeVerOS: true,
      podeEditarOS: true,
      podeExcluirOS: true,
      podeVerFinanceiro: true,
      podeEditarFinanceiro: true,
      podeExcluirFinanceiro: true,
      podeVerDevedores: true,
      podeEditarDevedores: true,
      podeExcluirDevedores: true,
      podeVerExtras: true,
      podeEditarExtras: true,
      podeExcluirExtras: true,
      podeVerNotas: true,
      podeEditarNotas: true,
      podeExcluirNotas: true,
      podeAcessarConfiguracoes: true,
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissoes: calcularPermissoes(user),
  };
}
