-- AlterTable
ALTER TABLE "ItemServico" ADD COLUMN "data" TIMESTAMP(3);

-- Backfill: usa a data de abertura da OS pra cada item já existente
UPDATE "ItemServico" AS item
SET "data" = os."data"
FROM "OrdemServico" AS os
WHERE os."id" = item."ordemServicoId";

-- Torna a coluna obrigatória depois do backfill
ALTER TABLE "ItemServico" ALTER COLUMN "data" SET NOT NULL;
