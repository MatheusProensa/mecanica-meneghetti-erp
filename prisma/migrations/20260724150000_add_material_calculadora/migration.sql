-- CreateTable
CREATE TABLE "MaterialCalculadora" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valorKg" DOUBLE PRECISION NOT NULL,
    "densidade" DOUBLE PRECISION NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialCalculadora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaterialCalculadora_nome_key" ON "MaterialCalculadora"("nome");

-- Materiais iniciais da Calculadora de Serviço (densidade em kg/m³)
INSERT INTO "MaterialCalculadora" ("id", "nome", "valorKg", "densidade", "ordem", "updatedAt") VALUES
    (gen_random_uuid()::text, 'Aço 1020', 20, 7850, 0, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Inox 304', 100, 8000, 1, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Alumínio', 80, 2700, 2, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Bronze SAE 660', 150, 8800, 3, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Nylon PA6', 100, 1140, 4, CURRENT_TIMESTAMP);
