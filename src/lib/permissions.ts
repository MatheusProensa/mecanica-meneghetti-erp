import type { UserRole } from "@/generated/prisma/client";

export type Permission =
  | "editar"
  | "excluir"
  | "verFinanceiro"
  | "acessarConfiguracoes"
  | "gerenciarUsuarios"
  | "verClientes"
  | "verOS"
  | "verNotas";

export interface Permissoes {
  editar: boolean;
  excluir: boolean;
  verFinanceiro: boolean;
  acessarConfiguracoes: boolean;
  gerenciarUsuarios: boolean;
  verClientes: boolean;
  verOS: boolean;
  verNotas: boolean;
}

interface FlagsUsuario {
  role: UserRole;
  podeEditar: boolean;
  podeVerFinanceiro: boolean;
  podeExcluir: boolean;
  podeAcessarConfiguracoes: boolean;
  podeVerClientes: boolean;
  podeVerOS: boolean;
  podeVerNotas: boolean;
}

/** Calcula as permissões efetivas a partir do perfil e, pro funcionário e
 * visualizador, das flags configuradas pelo Dono. Visualizador nunca
 * edita/exclui/acessa Configurações, independente das flags — só o que ele
 * pode *ver* (Clientes, OS, Notas) é configurável pro visualizador. */
export function calcularPermissoes(user: FlagsUsuario): Permissoes {
  if (user.role === "dono") {
    return {
      editar: true,
      excluir: true,
      verFinanceiro: true,
      acessarConfiguracoes: true,
      gerenciarUsuarios: true,
      verClientes: true,
      verOS: true,
      verNotas: true,
    };
  }

  if (user.role === "visualizador") {
    return {
      editar: false,
      excluir: false,
      verFinanceiro: true,
      acessarConfiguracoes: false,
      gerenciarUsuarios: false,
      verClientes: user.podeVerClientes,
      verOS: user.podeVerOS,
      verNotas: user.podeVerNotas,
    };
  }

  return {
    editar: user.podeEditar,
    excluir: user.podeExcluir,
    verFinanceiro: user.podeVerFinanceiro,
    acessarConfiguracoes: user.podeAcessarConfiguracoes,
    gerenciarUsuarios: false,
    verClientes: user.podeVerClientes,
    verOS: user.podeVerOS,
    verNotas: user.podeVerNotas,
  };
}
