import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { BanknotesIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/shared/Card";
import { useAppSelector } from "@/redux/hooks";

export const Accounting: FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleFacturasClick = () => {
    navigate("/accounting/invoices");
  };
  const handleGastosClick = () => navigate("/accounting/expenses");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contabilidad</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestiona las operaciones contables de tu negocio
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Facturas"
          color="#3B82F6"
          icon={DocumentTextIcon}
          onClick={handleFacturasClick}
        />
        {user?.role === "ADMIN" && (
          <Card title="Gastos" color="#10B981" icon={BanknotesIcon} onClick={handleGastosClick} />
        )}
      </div>
    </div>
  );
};

export default Accounting;
