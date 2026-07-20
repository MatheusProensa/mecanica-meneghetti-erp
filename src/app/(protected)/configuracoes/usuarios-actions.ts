"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { requirePermission } from "@/lib/requireAuth";
import type { UserRole } from "@/generated/prisma/client";

const ROLES_VALIDOS: UserRole[] = ["dono", "funcionario", "visualizador"];

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function roleValido(value: string): UserRole {
  return ROLES_VALIDOS.includes(value as UserRole) ? (value as UserRole) : "funcionario";
}

function permissoesFromFormData(formData: FormData, role: UserRole) {
  const on = (key: string) => formData.get(key) === "on";
  if (role === "dono") {
    return {
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
    };
  }
  const editarExcluir = role === "funcionario";
  return {
    podeVerDashboard: on("podeVerDashboard"),
    podeVerClientes: on("podeVerClientes"),
    podeEditarClientes: editarExcluir && on("podeEditarClientes"),
    podeExcluirClientes: editarExcluir && on("podeExcluirClientes"),
    podeVerOS: on("podeVerOS"),
    podeEditarOS: editarExcluir && on("podeEditarOS"),
    podeExcluirOS: editarExcluir && on("podeExcluirOS"),
    podeVerFinanceiro: on("podeVerFinanceiro"),
    podeEditarFinanceiro: editarExcluir && on("podeEditarFinanceiro"),
    podeExcluirFinanceiro: editarExcluir && on("podeExcluirFinanceiro"),
    podeVerDevedores: on("podeVerDevedores"),
    podeEditarDevedores: editarExcluir && on("podeEditarDevedores"),
    podeExcluirDevedores: editarExcluir && on("podeExcluirDevedores"),
    podeVerExtras: on("podeVerExtras"),
    podeEditarExtras: editarExcluir && on("podeEditarExtras"),
    podeExcluirExtras: editarExcluir && on("podeExcluirExtras"),
    podeVerNotas: on("podeVerNotas"),
    podeEditarNotas: editarExcluir && on("podeEditarNotas"),
    podeExcluirNotas: editarExcluir && on("podeExcluirNotas"),
    podeAcessarConfiguracoes: editarExcluir && on("podeAcessarConfiguracoes"),
  };
}

export async function createUsuario(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  await requirePermission("gerenciarUsuarios");

  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const senha = str(formData, "senha");
  const role = roleValido(str(formData, "role"));

  if (!name || !email || !senha) return "Preencha nome, e-mail e senha.";
  if (senha.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) return "Já existe uma conta com esse e-mail.";

  const passwordHash = await bcrypt.hash(senha, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      ...permissoesFromFormData(formData, role),
    },
  });

  revalidatePath("/configuracoes");
  return "Usuário criado com sucesso.";
}

export async function updateUsuarioPermissoes(id: string, formData: FormData) {
  await requirePermission("gerenciarUsuarios");

  const role = roleValido(str(formData, "role"));
  const atual = await getCurrentUser();

  if (atual?.id === id && role !== "dono") {
    const donos = await prisma.user.count({ where: { role: "dono" } });
    if (donos <= 1) {
      throw new Error("Você é o único Administrador — não dá pra tirar seu próprio acesso de admin.");
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      role,
      ...permissoesFromFormData(formData, role),
    },
  });

  revalidatePath("/configuracoes");
}

export async function deleteUsuario(id: string) {
  await requirePermission("gerenciarUsuarios");

  const atual = await getCurrentUser();
  if (atual?.id === id) throw new Error("Você não pode excluir sua própria conta.");

  const alvo = await prisma.user.findUniqueOrThrow({ where: { id } });
  if (alvo.role === "dono") {
    const donos = await prisma.user.count({ where: { role: "dono" } });
    if (donos <= 1) throw new Error("Não dá pra excluir o único Administrador do sistema.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/configuracoes");
}

/** Administrador redefine a senha de outro usuário (ex: funcionário esqueceu e não tem e-mail configurado). */
export async function resetSenhaUsuario(id: string, formData: FormData) {
  await requirePermission("gerenciarUsuarios");

  const novaSenha = str(formData, "novaSenha");
  if (novaSenha.length < 8) throw new Error("A senha precisa ter pelo menos 8 caracteres.");

  const passwordHash = await bcrypt.hash(novaSenha, 10);
  await prisma.user.update({
    where: { id },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  revalidatePath("/configuracoes");
}
