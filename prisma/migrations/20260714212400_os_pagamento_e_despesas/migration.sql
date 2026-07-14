-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusOS" ADD VALUE 'aguardando_peca';
ALTER TYPE "StatusOS" ADD VALUE 'aguardando_cliente';

-- AlterTable
ALTER TABLE "OrdemServico" ADD COLUMN     "dataPagamento" TIMESTAMP(3),
ADD COLUMN     "pago" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Despesa" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Despesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Despesa_data_idx" ON "Despesa"("data");

-- CreateIndex
CREATE INDEX "OrdemServico_pago_idx" ON "OrdemServico"("pago");
