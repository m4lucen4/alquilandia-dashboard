import { type FC, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessTab } from "@/components/settings/business/BusinessTab";
import { TaxesTypesTab } from "@/components/settings/taxesTypes/TaxesTypesTab";
import { InvoicesTypesTab } from "@/components/settings/invoicesTypes/InvoicesTypesTab";
import { ShippingCostsTab } from "@/components/settings/shippingCosts/ShippingCostsTab";

type TabId = "business" | "taxesTypes" | "invoicesTypes" | "shippingCosts";

const TABS: { id: TabId; label: string }[] = [
  { id: "business", label: "Empresas" },
  { id: "taxesTypes", label: "Tipos de Impuestos" },
  { id: "invoicesTypes", label: "Tipos de Facturas" },
  { id: "shippingCosts", label: "Gastos de Envío" },
];

const TAB_COMPONENTS: Record<TabId, FC> = {
  business: BusinessTab,
  taxesTypes: TaxesTypesTab,
  invoicesTypes: InvoicesTypesTab,
  shippingCosts: ShippingCostsTab,
};

export const Settings: FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("business");
  const ActiveTab = TAB_COMPONENTS[activeTab];

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Ajustes"
        description="Gestiona los datos fiscales, tipos de impuestos, tipos de facturas y gastos de envío"
      />

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <ActiveTab />
    </div>
  );
};
