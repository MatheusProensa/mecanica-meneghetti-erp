-- CreateTable
CREATE TABLE "Mecanico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mecanico_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "OrdemServico" ADD COLUMN     "mecanicoId" TEXT;

-- CreateIndex
CREATE INDEX "OrdemServico_mecanicoId_idx" ON "OrdemServico"("mecanicoId");

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_mecanicoId_fkey" FOREIGN KEY ("mecanicoId") REFERENCES "Mecanico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
