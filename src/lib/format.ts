export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("pt-BR");
}

/**
 * Formata progressivamente um telefone brasileiro:
 * - até 10 dígitos (fixo): (99) 9999-9999
 * - 11 dígitos (celular, com o nono dígito): (99) 9 9999-9999
 */
export function formatPhoneBR(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "").slice(0, 11);
  const ddd = digits.slice(0, 2);

  if (digits.length <= 2) return ddd ? `(${ddd}` : "";

  const isCelular = digits.length > 10;
  const rest = digits.slice(2);
  const nine = isCelular ? rest.slice(0, 1) : "";
  const middle = isCelular ? rest.slice(1, 5) : rest.slice(0, 4);
  const end = isCelular ? rest.slice(5, 9) : rest.slice(4, 8);

  let out = `(${ddd}) `;
  if (nine) out += `${nine} `;
  out += middle;
  if (end) out += `-${end}`;
  return out.trimEnd();
}
