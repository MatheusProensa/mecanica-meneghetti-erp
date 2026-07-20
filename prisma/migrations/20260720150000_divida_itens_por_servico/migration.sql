-- CreateTable
CREATE TABLE "ItemDivida" (
    "id" TEXT NOT NULL,
    "dividaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemDivida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemDivida_dividaId_idx" ON "ItemDivida"("dividaId");

-- AddForeignKey
ALTER TABLE "ItemDivida" ADD CONSTRAINT "ItemDivida_dividaId_fkey" FOREIGN KEY ("dividaId") REFERENCES "Divida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migra os dados existentes: cada dívida antiga vira um item único
INSERT INTO "ItemDivida" ("id", "dividaId", "data", "descricao", "valor")
SELECT gen_random_uuid()::text, "id", "dataServico", 'Dívida original', "valorOriginal"
FROM "Divida";

-- DropIndex
DROP INDEX "Divida_dataServico_idx";

-- AlterTable
ALTER TABLE "Divida" DROP COLUMN "dataServico",
DROP COLUMN "valorOriginal";
