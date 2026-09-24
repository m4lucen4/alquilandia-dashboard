import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Budgets } from "./Budgets";
import { getBudgetDetailsByRecordId } from "@/services/budgetsServices";
import { getAdminAndTechniciansThunk } from "@/redux/actions/users";
import type { Budget, User } from "@/types/budgets";

const selectedBudget = { id: "budget-123", budgetReference: 123 } as Budget;
const dispatch = vi.fn();
let technicians: User[] = [];

vi.mock("@/redux/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (state: Record<string, unknown>) => unknown) => selector({
    budgets: { budgets: [selectedBudget], total: 1, fetchBudgetsRequest: {}, rejectBudgetRequest: {}, updateBudgetRequest: {} },
    auth: { user: null }, business: { businesses: [] }, taxesTypes: { taxesTypes: [] }, invoicesTypes: { invoicesTypes: [] },
    invoices: { invoices: [], createInvoiceRequest: {} },
    users: { technicians, getAdminAndTechniciansRequest: { inProgress: false, messages: "", ok: false } },
  }),
}));
vi.mock("@/redux/actions/budgets", () => ({ fetchBudgets: vi.fn() }));
vi.mock("@/redux/actions/business", () => ({ fetchAllBusiness: vi.fn() }));
vi.mock("@/redux/actions/taxesTypes", () => ({ fetchAllTaxesTypes: vi.fn() }));
vi.mock("@/redux/actions/invoicesTypes", () => ({ fetchAllInvoicesTypes: vi.fn() }));
vi.mock("@/redux/actions/invoices", () => ({ fetchAllInvoices: vi.fn() }));
vi.mock("@/redux/actions/users", () => ({ getAdminAndTechniciansThunk: vi.fn(() => ({ type: "users/getAdminAndTechnicians" })) }));
vi.mock("@/redux/slices/budgetsSlice", () => ({ clearBudgetsErrors: vi.fn(), clearRejectBudgetErrors: vi.fn() }));
vi.mock("@/redux/slices/invoicesSlice", () => ({ clearInvoicesErrors: vi.fn() }));
vi.mock("@/redux/slices/budgetWizardSlice", () => ({ resetWizard: vi.fn() }));
vi.mock("@/services/invoicesService", () => ({ getInvoicesByBudgetReference: vi.fn() }));
vi.mock("@/services/budgetsServices", () => ({ getBudgetDetailsByRecordId: vi.fn() }));
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/hooks/useBudgetSearch", () => ({ useBudgetSearch: () => ({ buildFiltersQuery: () => "", appliedFilters: {} }) }));
vi.mock("@/hooks/useInvoiceGeneration", () => ({ useInvoiceGeneration: () => ({}) }));
vi.mock("@/hooks/useBudgetPdfGeneration", () => ({ useBudgetPdfGeneration: () => ({}) }));
vi.mock("@/hooks/useBreakageInvoice", () => ({ useBreakageInvoice: () => ({}) }));
vi.mock("@/hooks/useBudgetDetails", () => ({ useBudgetDetails: () => ({}) }));
vi.mock("@/components/budgets/BudgetsTable", () => ({
  BudgetsTable: ({ onViewHistory }: { onViewHistory: (budget: Budget) => void }) => <button onClick={() => onViewHistory(selectedBudget)}>Ver historial</button>,
}));
vi.mock("@/components/budgets/ModalBudgetHistory", () => ({
  ModalBudgetHistory: ({ isOpen, entries, technicians, isLoading, error, onClose }: { isOpen: boolean; entries: unknown[] | null; technicians: User[]; isLoading: boolean; error: string | null; onClose: () => void }) => isOpen ? <div><span>{isLoading ? "loading" : error ?? `${entries?.length ?? 0} entries`}</span><span data-testid="history-technicians">{technicians.map((technician) => `${technician.firstName} ${technician.lastName}`).join(", ")}</span><button onClick={onClose}>Cerrar historial</button></div> : null,
}));
vi.mock("@/components/budgets/SearchBudgets", () => ({ SearchBudgets: () => null }));
vi.mock("@/components/budgets/ModalGenerateInvoice", () => ({ ModalGenerateInvoice: () => null }));
vi.mock("@/components/budgets/ModalGenerateBudgetPdf", () => ({ ModalGenerateBudgetPdf: () => null }));
vi.mock("@/components/budgets/ModalinvoiceData", () => ({ ModalInvoiceData: () => null }));
vi.mock("@/components/budgets/ModalBudgetData", () => ({ ModalBudgetData: () => null }));
vi.mock("@/components/budgets/ModalGenerateBreakageInvoice", () => ({ ModalGenerateBreakageInvoice: () => null }));
vi.mock("@/components/budgets/BudgetLocationMapPanel", () => ({ BudgetLocationMapPanel: () => null }));
vi.mock("@/components/shared/Alert", () => ({ Alert: () => null }));
vi.mock("@/components/shared/PageHeader", () => ({ PageHeader: () => null }));
vi.mock("@/components/shared/Button", () => ({ default: () => null }));

describe("Budgets history integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    technicians = [];
  });

  it("renders the history returned for the selected budget", async () => {
    const user = userEvent.setup();
    vi.mocked(getBudgetDetailsByRecordId).mockResolvedValue({
      ...selectedBudget,
      history: [{ historyDate: "2026-01-01", eventType: "BUDGET_CREATED" }],
    });
    render(<Budgets />);

    await user.click(screen.getByRole("button", { name: "Ver historial" }));

    expect(await screen.findByText("1 entries")).toBeVisible();
  });

  it("loads the selected budget history and ignores a late response after close", async () => {
    const user = userEvent.setup();
    let resolveHistory: (budget: Budget) => void = () => undefined;
    vi.mocked(getBudgetDetailsByRecordId).mockReturnValue(new Promise((resolve) => { resolveHistory = resolve; }));
    render(<Budgets />);

    await user.click(screen.getByRole("button", { name: "Ver historial" }));
    expect(screen.getByText("loading")).toBeVisible();
    expect(getBudgetDetailsByRecordId).toHaveBeenCalledWith("budget-123");

    await user.click(screen.getByRole("button", { name: "Cerrar historial" }));
    await act(async () => { resolveHistory({ ...selectedBudget, history: [{ historyDate: "2026-01-01", eventType: "BUDGET_CREATED" }] }); });

    expect(screen.queryByText("1 entries")).not.toBeInTheDocument();
  });

  it("shows the detail endpoint error in the history modal", async () => {
    const user = userEvent.setup();
    vi.mocked(getBudgetDetailsByRecordId).mockRejectedValue(new Error("No se pudo cargar el historial"));
    render(<Budgets />);

    await user.click(screen.getByRole("button", { name: "Ver historial" }));

    expect(await screen.findByText("No se pudo cargar el historial")).toBeVisible();
  });

  it("loads technicians only when the shared list is empty and passes them to history", async () => {
    const user = userEvent.setup();
    technicians = [{ id: "technician-1", firstName: "Grace", lastName: "Hopper" } as User];
    vi.mocked(getBudgetDetailsByRecordId).mockResolvedValue({ ...selectedBudget, history: [] });
    render(<Budgets />);

    expect(getAdminAndTechniciansThunk).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Ver historial" }));

    expect(screen.getByTestId("history-technicians")).toHaveTextContent("Grace Hopper");
  });

  it("loads technicians when the shared list has not been populated", () => {
    render(<Budgets />);

    expect(getAdminAndTechniciansThunk).toHaveBeenCalledOnce();
    expect(dispatch).toHaveBeenCalledWith({ type: "users/getAdminAndTechnicians" });
  });
});
