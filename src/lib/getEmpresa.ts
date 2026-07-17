import { prisma } from "@/lib/prisma";
import { EMPRESA_PADRAO, type DadosEmpresa } from "@/lib/business";

const EMPRESA_ID = "default";

/** Busca os dados da oficina configurados em Configurações, com fallback pro padrão. */
export async function getEmpresa(): Promise<DadosEmpresa> {
  const empresa = await prisma.empresa.findUnique({ where: { id: EMPRESA_ID } });
  if (!empresa) return EMPRESA_PADRAO;
  return {
    nome: empresa.nome,
    endereco: empresa.endereco,
    cidade: empresa.cidade,
    telefone: empresa.telefone,
    cnpj: empresa.cnpj,
  };
}
