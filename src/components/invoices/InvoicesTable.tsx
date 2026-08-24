import { type FC, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { Invoice } from "@/types/invoices";
import { formatDate } from "@/helpers/dates";
import { formatCurrency, formatInvoiceNumber } from "@/helpers";
import { Table } from "@/components/shared/Table";

interface InvoicesTableProps {
  invoices: Invoice[];
  total: number;
  pageIndex: number;
  pageSize: number;
  isLoading: boolean;
  rectifiedIds: Set<string>;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCorrectiveModal: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
}

export const InvoicesTable: FC<InvoicesTableProps> = ({
  invoices,
  total,
  pageIndex,
  pageSize,
  isLoading,
  rectifiedIds,
  onPageChange,
  onPageSizeChange,
  onOpenCorrectiveModal,
  onEditInvoice,
}) => {
  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoice_number",
        header: "Nº Factura",
        cell: (info) => {
          const invoice = info.row.original;
          const invoiceTypeName = invoice.invoices_type?.invoices;

          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-900">
                {formatInvoiceNumber(
                  info.getValue() as number,
                  invoice.created_at,
                )}
              </span>
              <div className="flex items-center gap-1">
                {invoice.is_corrective ? (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    Rectificativa
                  </span>
                ) : (
                  invoiceTypeName && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {invoiceTypeName}
                    </span>
                  )
                )}
                {rectifiedIds.has(invoice.id) && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Rectificada
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "budget_reference",
        header: "Nº Presupuesto",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            #{info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "business.name",
        header: "Empresa",
        cell: (info) => {
          const invoice = info.row.original;
          const businessName = invoice.business?.name || "-";
          return (
            <div className="flex flex-col gap-1">
              <span className="text-gray-900">{businessName}</span>
              {invoice.client_name && (
                <span className="text-xs text-gray-500">
                  {invoice.client_name}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "price.total",
        header: "Total",
        cell: (info) => {
          const invoice = info.row.original;
          return (
            <span className="font-semibold text-gray-900">
              {formatCurrency(invoice.price?.total || 0)}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Fecha Creación",
        cell: (info) => (
          <span className="text-gray-600">
            {formatDate(info.getValue() as string)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (info) => {
          const invoice = info.row.original;
          return (
            <div className="flex items-center gap-2">
              {invoice.pdf_url ? (
                <a
                  href={invoice.pdf_url}
                  download={`${formatInvoiceNumber(invoice.invoice_number, invoice.created_at).replaceAll(/[/\\:*?"<>|]/g, "_")}_${(invoice.client_name || "").replaceAll(/[/\\:*?"<>|]/g, "").replaceAll(/\s+/g, "_")}_${invoice.budget_reference}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Descargar PDF"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </a>
              ) : (
                <span className="text-xs text-gray-400">Sin PDF</span>
              )}

              {!invoice.is_corrective && (
                <button
                  onClick={() => onEditInvoice(invoice)}
                  className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  title="Editar factura"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
              )}

              {!invoice.is_corrective && !rectifiedIds.has(invoice.id) && (
                <button
                  onClick={() => onOpenCorrectiveModal(invoice)}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  title="Crear factura rectificativa"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onOpenCorrectiveModal, onEditInvoice, rectifiedIds],
  );

  return (
    <Table
      data={invoices}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando facturas..."
      emptyMessage="No se encontraron facturas"
      pagination={{
        pageIndex,
        pageSize,
        total,
        onPageChange,
        onPageSizeChange,
      }}
    />
  );
};
