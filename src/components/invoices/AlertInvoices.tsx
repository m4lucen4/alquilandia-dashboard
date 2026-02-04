import { type FC } from "react";
import { Alert } from "@/components/shared/Alert";
import type { IRequest } from "@/types/auth";

interface AlertInvoicesProps {
  fetchInvoicesRequest: IRequest;
  createCorrectiveInvoiceRequest: IRequest;
  onClose: () => void;
}

export const AlertInvoices: FC<AlertInvoicesProps> = ({
  fetchInvoicesRequest,
  createCorrectiveInvoiceRequest,
  onClose,
}) => {
  const shouldShowError =
    (fetchInvoicesRequest.messages &&
      !fetchInvoicesRequest.inProgress &&
      !fetchInvoicesRequest.ok) ||
    (createCorrectiveInvoiceRequest.messages &&
      !createCorrectiveInvoiceRequest.inProgress &&
      !createCorrectiveInvoiceRequest.ok);

  const getErrorTitle = () => {
    if (
      fetchInvoicesRequest.messages &&
      !fetchInvoicesRequest.inProgress &&
      !fetchInvoicesRequest.ok
    ) {
      return "Error al cargar facturas";
    }
    if (
      createCorrectiveInvoiceRequest.messages &&
      !createCorrectiveInvoiceRequest.inProgress &&
      !createCorrectiveInvoiceRequest.ok
    ) {
      return "Error al crear factura rectificativa";
    }
    return "Error";
  };

  const getErrorMessage = () => {
    if (
      fetchInvoicesRequest.messages &&
      !fetchInvoicesRequest.inProgress &&
      !fetchInvoicesRequest.ok
    ) {
      return fetchInvoicesRequest.messages;
    }
    if (
      createCorrectiveInvoiceRequest.messages &&
      !createCorrectiveInvoiceRequest.inProgress &&
      !createCorrectiveInvoiceRequest.ok
    ) {
      return createCorrectiveInvoiceRequest.messages;
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
