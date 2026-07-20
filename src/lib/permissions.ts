import type { UserRole } from "@/generated/prisma/client";

export type Permission =
  | "verDashboard"
  | "verClientes"
  | "editarClientes"
  | "excluirClientes"
  | "verOS"
  | "editarOS"
  | "excluirOS"
  | "verFinanceiro"
  | "editarFinanceiro"
  | "excluirFinanceiro"
  | "verDevedores"
  | "editarDevedores"
  | "excluirDevedores"
  | "verExtras"
  | "editarExtras"
  | "excluirExtras"
  | "verNotas"
  | "editarNotas"
  | "excluirNotas"
  | "acessarConfiguracoes"
  | "gerenciarUsuarios";

export interface Permissoes {
  verDashboard: boolean;
  verClientes: boolean;
  editarClientes: boolean;
  excluirClientes: boolean;
  verOS: boolean;
  editarOS: boolean;
  excluirOS: boolean;
  verFinanceiro: boolean;
  editarFinanceiro: boolean;
  excluirFinanceiro: boolean;
  verDevedores: boolean;
  editarDevedores: boolean;
  excluirDevedores: boolean;
  verExtras: boolean;
  editarExtras: boolean;
  excluirExtras: boolean;
  verNotas: boolean;
  editarNotas: boolean;
  excluirNotas: boolean;
  acessarConfiguracoes: boolean;
  gerenciarUsuarios: boolean;
}

interface FlagsUsuario {
  role: UserRole;
  podeVerDashboard: boolean;
  podeVerClientes: boolean;
  podeEditarClientes: boolean;
  podeExcluirClientes: boolean;
  podeVerOS: boolean;
  podeEditarOS: boolean;
  podeExcluirOS: boolean;
  podeVerFinanceiro: boolean;
  podeEditarFinanceiro: boolean;
  podeExcluirFinanceiro: boolean;
  podeVerDevedores: boolean;
  podeEditarDevedores: boolean;
  podeExcluirDevedores: boolean;
  podeVerExtras: boolean;
  podeEditarExtras: boolean;
  podeExcluirExtras: boolean;
  podeVerNotas: boolean;
  podeEditarNotas: boolean;
  podeExcluirNotas: boolean;
  podeAcessarConfiguracoes: boolean;
}

/** Calcula as permissões efetivas a partir do perfil e, pro funcionário e
 * visualizador, das flags configuradas pelo Administrador — ver, editar e excluir são
 * controlados por página (Dashboard só tem "ver"; Clientes, OS, Financeiro,
 * Devedores, Extras e Notas têm ver/editar/excluir independentes).
 * Visualizador nunca edita, exclui, ou acessa Configurações, independente
 * das flags — só o que ele pode *ver* é configurável. */
export function calcularPermissoes(user: FlagsUsuario): Permissoes {
  if (user.role === "dono") {
    return {
      verDashboard: true,
      verClientes: true,
      editarClientes: true,
      excluirClientes: true,
      verOS: true,
      editarOS: true,
      excluirOS: true,
      verFinanceiro: true,
      editarFinanceiro: true,
      excluirFinanceiro: true,
      verDevedores: true,
      editarDevedores: true,
      excluirDevedores: true,
      verExtras: true,
      editarExtras: true,
      excluirExtras: true,
      verNotas: true,
      editarNotas: true,
      excluirNotas: true,
      acessarConfiguracoes: true,
      gerenciarUsuarios: true,
    };
  }

  if (user.role === "visualizador") {
    return {
      verDashboard: user.podeVerDashboard,
      verClientes: user.podeVerClientes,
      editarClientes: false,
      excluirClientes: false,
      verOS: user.podeVerOS,
      editarOS: false,
      excluirOS: false,
      verFinanceiro: user.podeVerFinanceiro,
      editarFinanceiro: false,
      excluirFinanceiro: false,
      verDevedores: user.podeVerDevedores,
      editarDevedores: false,
      excluirDevedores: false,
      verExtras: user.podeVerExtras,
      editarExtras: false,
      excluirExtras: false,
      verNotas: user.podeVerNotas,
      editarNotas: false,
      excluirNotas: false,
      acessarConfiguracoes: false,
      gerenciarUsuarios: false,
    };
  }

  return {
    verDashboard: user.podeVerDashboard,
    verClientes: user.podeVerClientes,
    editarClientes: user.podeEditarClientes,
    excluirClientes: user.podeExcluirClientes,
    verOS: user.podeVerOS,
    editarOS: user.podeEditarOS,
    excluirOS: user.podeExcluirOS,
    verFinanceiro: user.podeVerFinanceiro,
    editarFinanceiro: user.podeEditarFinanceiro,
    excluirFinanceiro: user.podeExcluirFinanceiro,
    verDevedores: user.podeVerDevedores,
    editarDevedores: user.podeEditarDevedores,
    excluirDevedores: user.podeExcluirDevedores,
    verExtras: user.podeVerExtras,
    editarExtras: user.podeEditarExtras,
    excluirExtras: user.podeExcluirExtras,
    verNotas: user.podeVerNotas,
    editarNotas: user.podeEditarNotas,
    excluirNotas: user.podeExcluirNotas,
    acessarConfiguracoes: user.podeAcessarConfiguracoes,
    gerenciarUsuarios: false,
  };
}
