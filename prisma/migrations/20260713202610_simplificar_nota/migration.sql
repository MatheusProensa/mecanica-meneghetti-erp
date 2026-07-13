/*
  Warnings:

  - You are about to drop the column `categoria` on the `Nota` table. All the data in the column will be lost.
  - You are about to drop the column `clienteOuFornecedor` on the `Nota` table. All the data in the column will be lost.
  - You are about to drop the column `cpfCnpj` on the `Nota` table. All the data in the column will be lost.
  - You are about to drop the column `dataVencimento` on the `Nota` table. All the data in the column will be lost.
  - You are about to drop the column `formaPagamento` on the `Nota` table. All the data in the column will be lost.
  - You are about to drop the column `ordemServicoId` on the `Nota` table. All the data in the column will be lost.
  - You are about to drop the column `situacao` on the `Nota` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `Nota` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "dataEmissao" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "observacoes" TEXT,
    "arquivoPdfPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Nota" ("arquivoPdfPath", "createdAt", "dataEmissao", "id", "numero", "observacoes", "tipo", "updatedAt") SELECT "arquivoPdfPath", "createdAt", "dataEmissao", "id", "numero", "observacoes", "tipo", "updatedAt" FROM "Nota";
DROP TABLE "Nota";
ALTER TABLE "new_Nota" RENAME TO "Nota";
CREATE INDEX "Nota_tipo_idx" ON "Nota"("tipo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
