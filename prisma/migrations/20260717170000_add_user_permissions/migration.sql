-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('dono', 'funcionario', 'visualizador');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'funcionario',
ADD COLUMN     "podeVerFinanceiro" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "podeExcluir" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "podeAcessarConfiguracoes" BOOLEAN NOT NULL DEFAULT false;

-- Contas existentes (criadas antes do sistema de permissões) viram Dono,
-- pra ninguém perder acesso que já tinha.
UPDATE "User" SET "role" = 'dono';
