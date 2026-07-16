import { auth } from "@/lib/auth";

/** Confere autenticação dentro da própria Server Action, além da proteção do middleware
 * (defesa em profundidade — a action não deve depender só do middleware pra barrar acesso). */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Não autenticado.");
  }
  return session;
}
