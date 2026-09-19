import type { FC, ReactNode } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { IRequest } from "@/types/auth";

interface StatisticsResourceStateProps {
  request: IRequest;
  hasData: boolean;
  emptyMessage: string;
  onRetry: () => void;
  children: ReactNode;
}

export const StatisticsResourceState: FC<StatisticsResourceStateProps> = ({
  request,
  hasData,
  emptyMessage,
  onRetry,
  children,
}) => {
  if (request.inProgress) {
    return <p className="py-12 text-center text-sm text-gray-500" role="status">Cargando estadísticas…</p>;
  }

  if (request.messages) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
        <p>{request.messages}</p>
        <button type="button" onClick={onRetry} className="mt-3 inline-flex items-center gap-2 rounded-md bg-red-700 px-3 py-2 font-semibold text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2">
          <ArrowPathIcon className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (!hasData) return <p className="py-12 text-center text-sm text-gray-500">{emptyMessage}</p>;
  return <>{children}</>;
};
