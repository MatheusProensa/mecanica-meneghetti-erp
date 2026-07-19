-- CreateTable
CREATE TABLE "AnexoDivida" (
    "id" TEXT NOT NULL,
    "dividaId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnexoDivida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnexoDivida_dividaId_idx" ON "AnexoDivida"("dividaId");

-- AddForeignKey
ALTER TABLE "AnexoDivida" ADD CONSTRAINT "AnexoDivida_dividaId_fkey" FOREIGN KEY ("dividaId") REFERENCES "Divida"("id") ON DELETE CASCADE ON UPDATE CASCADE;
