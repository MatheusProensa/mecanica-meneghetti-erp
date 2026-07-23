export interface DadosEmpresa {
  nome: string;
  endereco: string;
  cidade: string;
  telefone: string;
  cnpj: string;
}

/** Usado só até a oficina configurar os dados dela em Configurações. */
export const EMPRESA_PADRAO: DadosEmpresa = {
  nome: "Mecânica Meneghetti",
  endereco: "Av. João Machado Soares, 345",
  cidade: "Santa Maria",
  telefone: "(55) 99969-1553",
  cnpj: "20.398.372/0001-25",
};
