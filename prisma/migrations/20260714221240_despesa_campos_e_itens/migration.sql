-- AlterTable
ALTER TABLE "Despesa" ADD COLUMN     "anexoPath" TEXT,
ADD COLUMN     "formaPagamento" TEXT,
ADD COLUMN     "fornecedor" TEXT,
ADD COLUMN     "observacoes" TEXT;

-- CreateTable
CREATE TABLE "DespesaItem" (
    "id" TEXT NOT NULL,
    "despesaId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DespesaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DespesaItem_despesaId_idx" ON "DespesaItem"("despesaId");

-- CreateIndex
CREATE INDEX "Despesa_categoria_idx" ON "Despesa"("categoria");

-- AddForeignKey
ALTER TABLE "DespesaItem" ADD CONSTRAINT "DespesaItem_despesaId_fkey" FOREIGN KEY ("despesaId") REFERENCES "Despesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
