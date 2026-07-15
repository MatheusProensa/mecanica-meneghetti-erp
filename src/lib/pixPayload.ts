/**
 * Monta o payload "Pix Copia e Cola" (BR Code / EMV QR Code) conforme o manual
 * do Banco Central: https://www.bcb.gov.br/estabilidadefinanceira/pix
 * Cada campo é codificado como ID(2 dígitos) + TAMANHO(2 dígitos) + VALOR.
 */

function campoEMV(id: string, valor: string): string {
  const tamanho = valor.length.toString().padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}

/** CRC-16/CCITT-FALSE (polinômio 0x1021, valor inicial 0xFFFF) — exigido no final do payload. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const REGEX_DIACRITICOS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g"
);

function removerAcentos(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(REGEX_DIACRITICOS, "")
    .replace(/[^a-zA-Z0-9 ]/g, "");
}

/** Normaliza a chave Pix conforme o tipo: CPF/CNPJ e telefone só com dígitos (e-mail e chave aleatória mantêm o valor). */
export function normalizarChavePix(chaveOriginal: string): string {
  const chave = chaveOriginal.trim();
  if (chave.includes("@")) return chave.toLowerCase();
  if (chave.startsWith("+")) return `+${chave.slice(1).replace(/\D/g, "")}`;

  const apenasDigitos = chave.replace(/\D/g, "");
  const eraSoNumeroFormatado = apenasDigitos.length === chave.replace(/[.\-/() ]/g, "").length;
  if (eraSoNumeroFormatado && (apenasDigitos.length === 11 || apenasDigitos.length === 14)) {
    return apenasDigitos;
  }
  return chave;
}

export function gerarPayloadPix({
  chave,
  nomeRecebedor,
  cidade,
  valor,
  txid = "***",
}: {
  chave: string;
  nomeRecebedor: string;
  cidade: string;
  valor?: number;
  txid?: string;
}): string {
  const merchantAccountInfo = campoEMV(
    "26",
    campoEMV("00", "BR.GOV.BCB.PIX") + campoEMV("01", normalizarChavePix(chave))
  );

  const valorField = valor && valor > 0 ? campoEMV("54", valor.toFixed(2)) : "";

  const additionalData = campoEMV("62", campoEMV("05", (txid || "***").slice(0, 25)));

  const semCRC =
    campoEMV("00", "01") +
    merchantAccountInfo +
    campoEMV("52", "0000") +
    campoEMV("53", "986") +
    valorField +
    campoEMV("58", "BR") +
    campoEMV("59", removerAcentos(nomeRecebedor).toUpperCase().slice(0, 25)) +
    campoEMV("60", removerAcentos(cidade).toUpperCase().slice(0, 15)) +
    additionalData +
    "6304";

  return semCRC + crc16(semCRC);
}
