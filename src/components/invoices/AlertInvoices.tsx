import { type FC } from "react";
import { Alert } from "@/components/shared/Alert";
import type { IRequest } from "@/types/auth";

interface AlertInvoicesProps {
  fetchInvoicesRequest: IRequest;
  createCorrectiveInvoiceRequest: IRequest;
  updateInvoiceRequest: IRequest;
  onClose: () => void;
}

export const AlertInvoices: FC<AlertInvoicesProps> = ({
  fetchInvoicesRequest,
  createCorrectiveInvoiceRequest,
  updateInvoiceRequest,
  onClose,
}) => {
  const hasError = (req: IRequest) =>
    req.messages && !req.inProgress && !req.ok;

  const shouldShowError =
    hasError(fetchInvoicesRequest) ||
    hasError(createCorrectiveInvoiceRequest) ||
    hasError(updateInvoiceRequest);

  const getErrorTitle = () => {
    if (hasError(fetchInvoicesRequest)) {
      return "Error al cargar facturas";
    }
    if (hasError(createCorrectiveInvoiceRequest)) {
      return "Error al crear factura rectificativa";
    }
    if (hasError(updateInvoiceRequest)) {
      return "Error al actualizar factura";
    }
    return "Error";
  };

  const getErrorMessage = () => {
    if (hasError(fetchInvoicesRequest)) {
      return fetchInvoicesRequest.messages;
    }
    if (hasError(createCorrectiveInvoiceRequest)) {
      return createCorrectiveInvoiceRequest.messages;
    }
    if (hasError(updateInvoiceRequest)) {
      return updateInvoiceRequest.messages;
    }
    return "";
  };

  if (!shouldShowError) {
    return null;
  }

  return (
    <Alert
      title={getErrorTitle()}
      description={getErrorMessage()}
      onClose={onClose}
    />
  );
};
