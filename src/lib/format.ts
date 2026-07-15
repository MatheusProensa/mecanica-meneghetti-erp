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

/**
 * Formata progressivamente um valor em reais enquanto o usuário digita:
 * separador de milhar "." e decimal ",". Ex: "1520" -> "1.520", "1520,5" -> "1.520,5".
 */
export function formatCurrencyBR(raw: string): string {
  let cleaned = raw.replace(/[^\d,]/g, "");

  const firstComma = cleaned.indexOf(",");
  if (firstComma !== -1) {
    cleaned = cleaned.slice(0, firstComma + 1) + cleaned.slice(firstComma + 1).replace(/,/g, "");
  }

  const [intPartRaw, decPartRaw] = cleaned.split(",");
  const intDigits = (intPartRaw ?? "").replace(/^0+(?=\d)/, "");
  const grouped = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (decPartRaw === undefined) return grouped;
  return `${grouped},${decPartRaw.slice(0, 2)}`;
}

/** Converte um valor formatado como "1.520,50" (ou "1520,5", "1520") de volta para number. */
export function parseCurrencyBR(value: string | null | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

/** Formata um número (vindo do banco) no padrão de exibição do CurrencyInput: "1520.5" -> "1.520,50". */
export function formatNumberToCurrencyInput(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
