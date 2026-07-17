-- AlterTable
ALTER TABLE "Nota" ADD COLUMN     "clienteId" TEXT,
ADD COLUMN     "ordemServicoId" INTEGER;

-- CreateIndex
CREATE INDEX "Nota_clienteId_idx" ON "Nota"("clienteId");

-- CreateIndex
CREATE INDEX "Nota_ordemServicoId_idx" ON "Nota"("ordemServicoId");

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
