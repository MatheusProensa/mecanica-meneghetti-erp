import type { UserRole } from "@/generated/prisma/client";

export type Permission =
  | "editar"
  | "excluir"
  | "verFinanceiro"
  | "acessarConfiguracoes"
  | "gerenciarUsuarios";

export interface Permissoes {
  editar: boolean;
  excluir: boolean;
  verFinanceiro: boolean;
  acessarConfiguracoes: boolean;
  gerenciarUsuarios: boolean;
}

interface FlagsUsuario {
  role: UserRole;
  podeVerFinanceiro: boolean;
  podeExcluir: boolean;
  podeAcessarConfiguracoes: boolean;
}

/** Calcula as permissões efetivas a partir do perfil e, pro funcionário, das flags
 * configuradas pelo Dono. Visualizador nunca edita/exclui, independente das flags. */
export function calcularPermissoes(user: FlagsUsuario): Permissoes {
  if (user.role === "dono") {
    return {
      editar: true,
      excluir: true,
      verFinanceiro: true,
      acessarConfiguracoes: true,
      gerenciarUsuarios: true,
    };
  }

  if (user.role === "visualizador") {
    return {
      editar: false,
      excluir: false,
      verFinanceiro: true,
      acessarConfiguracoes: false,
      gerenciarUsuarios: false,
    };
  }

  return {
    editar: true,
    excluir: user.podeExcluir,
    verFinanceiro: user.podeVerFinanceiro,
    acessarConfiguracoes: user.podeAcessarConfiguracoes,
    gerenciarUsuarios: false,
  };
}
