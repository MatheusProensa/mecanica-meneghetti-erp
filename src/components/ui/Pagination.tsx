import Link from "next/link";

export const PAGE_SIZE = 30;

export default function Pagination({
  paginaAtual,
  totalItens,
  hrefForPage,
}: {
  paginaAtual: number;
  totalItens: number;
  hrefForPage: (pagina: number) => string;
}) {
  const totalPaginas = Math.max(1, Math.ceil(totalItens / PAGE_SIZE));
  if (totalPaginas <= 1) return null;

  const semAnterior = paginaAtual <= 1;
  const semProxima = paginaAtual >= totalPaginas;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 sm:px-6">
      {semAnterior ? (
        <span className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-300">
          Anterior
        </span>
      ) : (
        <Link
          href={hrefForPage(paginaAtual - 1)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Anterior
        </Link>
      )}
      <span className="text-sm text-gray-600">
        Página {paginaAtual} de {totalPaginas}
      </span>
      {semProxima ? (
        <span className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-300">
          Próxima
        </span>
      ) : (
        <Link
          href={hrefForPage(paginaAtual + 1)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Próxima
        </Link>
      )}
    </div>
  );
}
