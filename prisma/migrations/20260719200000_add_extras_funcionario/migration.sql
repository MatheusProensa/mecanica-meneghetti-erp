-- CreateTable
CREATE TABLE "ExtraFuncionario" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "mecanicoId" TEXT NOT NULL,
    "clienteId" TEXT,
    "ordemServicoId" INTEGER,
    "descricao" TEXT NOT NULL,
    "valorServico" DOUBLE PRECISION NOT NULL,
    "valorExtra" DOUBLE PRECISION NOT NULL,
    "outrosCustos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraFuncionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoExtra" (
    "id" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "formaPagamento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagamentoExtra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExtraFuncionario_mecanicoId_idx" ON "ExtraFuncionario"("mecanicoId");

-- CreateIndex
CREATE INDEX "ExtraFuncionario_clienteId_idx" ON "ExtraFuncionario"("clienteId");

-- CreateIndex
CREATE INDEX "ExtraFuncionario_ordemServicoId_idx" ON "ExtraFuncionario"("ordemServicoId");

-- CreateIndex
CREATE INDEX "ExtraFuncionario_data_idx" ON "ExtraFuncionario"("data");

-- CreateIndex
CREATE INDEX "PagamentoExtra_extraId_idx" ON "PagamentoExtra"("extraId");

-- AddForeignKey
ALTER TABLE "ExtraFuncionario" ADD CONSTRAINT "ExtraFuncionario_mecanicoId_fkey" FOREIGN KEY ("mecanicoId") REFERENCES "Mecanico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraFuncionario" ADD CONSTRAINT "ExtraFuncionario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraFuncionario" ADD CONSTRAINT "ExtraFuncionario_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoExtra" ADD CONSTRAINT "PagamentoExtra_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "ExtraFuncionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
