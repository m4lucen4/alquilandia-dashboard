import type { FC } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  canPreviousPage,
  canNextPage,
}) => {
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages: number[] = [];

    if (totalPages <= maxVisiblePages) {
      // Si hay 5 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calcular el rango de páginas a mostrar
      const currentPageNumber = currentPage + 1; // Convertir de 0-indexed a 1-indexed

      let startPage: number;
      let endPage: number;

      // Si estamos en las primeras páginas (1, 2, 3)
      if (currentPageNumber <= 3) {
        startPage = 1;
        endPage = maxVisiblePages;
      }
      // Si estamos cerca del final
      else if (currentPageNumber >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      }
      // En el medio: mostrar 2 antes y 2 después
      else {
        startPage = currentPageNumber - 2;
        endPage = currentPageNumber + 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  const pageNumbers = getPageNumbers();

  const baseButtonStyles =
    "relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0";

  const activePageStyles = "z-10 bg-blue-600 text-white ring-blue-600";
  const inactivePageStyles =
    "text-gray-900 hover:bg-gray-50 cursor-pointer";

  const arrowButtonStyles =
    "relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      {/* Mobile */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPreviousPage}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNextPage}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startItem}</span> a{" "}
            <span className="font-medium">{endItem}</span> de{" "}
            <span className="font-medium">{totalItems}</span> resultados
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            {/* Botón Anterior */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canPreviousPage}
              className={`${arrowButtonStyles} rounded-l-md`}
            >
              <span className="sr-only">Anterior</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Números de página */}
            {pageNumbers.map((pageNum) => {
              const isCurrentPage = pageNum === currentPage + 1;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum - 1)}
                  aria-current={isCurrentPage ? "page" : undefined}
                  className={`${baseButtonStyles} ${
                    isCurrentPage ? activePageStyles : inactivePageStyles
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Botón Siguiente */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canNextPage}
              className={`${arrowButtonStyles} rounded-r-md`}
            >
              <span className="sr-only">Siguiente</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
