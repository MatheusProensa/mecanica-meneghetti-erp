-- CreateTable
CREATE TABLE "AnexoCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnexoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnexoCliente_clienteId_idx" ON "AnexoCliente"("clienteId");

-- AddForeignKey
ALTER TABLE "AnexoCliente" ADD CONSTRAINT "AnexoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
