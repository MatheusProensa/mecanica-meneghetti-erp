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

/** Converte "AAAA-MM-DD" (de um <input type="date">) numa data local, sem risco de fuso. */
export function parseDateInputValue(value: string | undefined | null): Date | null {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!match) return null;
  const [, ano, mes, dia] = match;
  return new Date(Number(ano), Number(mes) - 1, Number(dia));
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
 * Formata progressivamente um CPF ou CNPJ, identificando automaticamente qual dos dois pela
 * quantidade de dígitos: até 11 vira CPF (999.999.999-99), acima disso vira CNPJ
 * (99.999.999/9999-99). Funciona tanto pra digitar (parcial) quanto pra exibir (completo) —
 * mesmo padrão do formatPhoneBR.
 */
export function formatCpfCnpj(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "").slice(0, 14);
  if (digits.length === 0) return "";

  if (digits.length <= 11) {
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 9);
    const p4 = digits.slice(9, 11);
    let out = p1;
    if (p2) out += `.${p2}`;
    if (p3) out += `.${p3}`;
    if (p4) out += `-${p4}`;
    return out;
  }

  const p1 = digits.slice(0, 2);
  const p2 = digits.slice(2, 5);
  const p3 = digits.slice(5, 8);
  const p4 = digits.slice(8, 12);
  const p5 = digits.slice(12, 14);
  let out = p1;
  if (p2) out += `.${p2}`;
  if (p3) out += `.${p3}`;
  if (p4) out += `/${p4}`;
  if (p5) out += `-${p5}`;
  return out;
}

/** Monta o link do WhatsApp (wa.me) a partir de um telefone brasileiro. Retorna null se não houver dígitos suficientes. */
export function whatsappUrl(value: string | null | undefined, mensagem?: string): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const comCodigoPais = digits.length <= 11 ? `55${digits}` : digits;
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${comCodigoPais}${texto}`;
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
