-- Permissões granulares por página: separa Devedores e Extras de Financeiro,
-- adiciona Dashboard (só "ver") e substitui os antigos podeEditar/podeExcluir
-- globais por um par editar/excluir por página.

ALTER TABLE "User"
  ADD COLUMN "podeVerDashboard" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeEditarClientes" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeExcluirClientes" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeEditarOS" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeExcluirOS" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeEditarNotas" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeExcluirNotas" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeEditarFinanceiro" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeExcluirFinanceiro" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeVerDevedores" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeEditarDevedores" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeExcluirDevedores" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeVerExtras" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeEditarExtras" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "podeExcluirExtras" BOOLEAN NOT NULL DEFAULT true;

UPDATE "User" SET
  "podeEditarClientes" = "podeEditar",
  "podeExcluirClientes" = "podeExcluir",
  "podeEditarOS" = "podeEditar",
  "podeExcluirOS" = "podeExcluir",
  "podeEditarNotas" = "podeEditar",
  "podeExcluirNotas" = "podeExcluir",
  "podeEditarFinanceiro" = "podeEditar",
  "podeExcluirFinanceiro" = "podeExcluir",
  "podeVerDevedores" = "podeVerFinanceiro",
  "podeEditarDevedores" = "podeEditar",
  "podeExcluirDevedores" = "podeExcluir",
  "podeVerExtras" = "podeVerFinanceiro",
  "podeEditarExtras" = "podeEditar",
  "podeExcluirExtras" = "podeExcluir";

ALTER TABLE "User"
  DROP COLUMN "podeEditar",
  DROP COLUMN "podeExcluir";
