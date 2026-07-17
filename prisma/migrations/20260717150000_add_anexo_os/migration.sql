-- CreateTable
CREATE TABLE "AnexoOS" (
    "id" TEXT NOT NULL,
    "ordemServicoId" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnexoOS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnexoOS_ordemServicoId_idx" ON "AnexoOS"("ordemServicoId");

-- AddForeignKey
ALTER TABLE "AnexoOS" ADD CONSTRAINT "AnexoOS_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
