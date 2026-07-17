import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/getCurrentUser";
import type { Permission } from "@/lib/permissions";

/** Confere autenticação dentro da própria Server Action, além da proteção do middleware
 * (defesa em profundidade — a action não deve depender só do middleware pra barrar acesso). */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Não autenticado.");
  }
  return session;
}

/** Confere autenticação E uma permissão específica dentro da Server Action.
 * Lança erro se o usuário não tiver a permissão — usar nas ações que criam,
 * editam, excluem ou mexem em áreas restritas do sistema. */
export async function requirePermission(permissao: Permission) {
  const usuario = await getCurrentUser();
  if (!usuario) throw new Error("Não autenticado.");
  if (!usuario.permissoes[permissao]) {
    throw new Error("Você não tem permissão para fazer isso.");
  }
  return usuario;
}
