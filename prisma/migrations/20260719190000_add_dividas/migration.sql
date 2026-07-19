-- CreateTable
CREATE TABLE "Divida" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "dataServico" TIMESTAMP(3) NOT NULL,
    "valorOriginal" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Divida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoDivida" (
    "id" TEXT NOT NULL,
    "dividaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "formaPagamento" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagamentoDivida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Divida_clienteId_idx" ON "Divida"("clienteId");

-- CreateIndex
CREATE INDEX "Divida_dataServico_idx" ON "Divida"("dataServico");

-- CreateIndex
CREATE INDEX "PagamentoDivida_dividaId_idx" ON "PagamentoDivida"("dividaId");

-- AddForeignKey
ALTER TABLE "Divida" ADD CONSTRAINT "Divida_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoDivida" ADD CONSTRAINT "PagamentoDivida_dividaId_fkey" FOREIGN KEY ("dividaId") REFERENCES "Divida"("id") ON DELETE CASCADE ON UPDATE CASCADE;
