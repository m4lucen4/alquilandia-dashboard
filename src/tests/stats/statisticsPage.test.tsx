import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockApiClient, mockFetchScopedVatStatistics } = vi.hoisted(() => ({
  mockApiClient: vi.fn(),
  mockFetchScopedVatStatistics: vi.fn(async () => ({
    expenses: [{ month: 7, totalAmount: 0, totalVAT: 0 }],
    gaining: [{ month: 7, totalAmount: 0, totalVAT: 0 }],
  })),
}));

vi.mock("@/services/api", () => ({ apiClient: mockApiClient }));
vi.mock("@/services/statisticsVatService", () => ({
  fetchScopedVatStatistics: mockFetchScopedVatStatistics,
}));
vi.mock("recharts", () => {
  const Container = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  return {
    Bar: ({ dataKey, name }: { dataKey: string; name: string }) => <div data-series={dataKey}>{name}</div>,
    BarChart: Container,
    CartesianGrid: () => null,
    Legend: () => null,
    ResponsiveContainer: Container,
    Tooltip: () => null,
    XAxis: ({ dataKey }: { dataKey: string }) => <div data-axis={dataKey} />,
    YAxis: ({ tick }: { tick?: { fontSize?: number } }) => (
      <div data-axis="y" data-tick-font-size={tick?.fontSize} />
    ),
  };
});

import Statistics from "@/pages/accounting/Statistics";
import statisticsReducer from "@/redux/slices/statisticsSlice";

const currentYear = new Date().getFullYear();

const moneyResponse = {
  expenses: [{ month: 1, totalAmount: 0 }],
  gaining: [{ month: 1, totalAmount: 0 }],
};
const adviserResponse = [
  { month: 3, totalAmount: 300, technician: { id: "zoe", firstName: "Zoe", lastName: "Zulueta" } },
  { month: 1, totalAmount: 100, technician: { id: "ana", firstName: "Ana", lastName: "Álvarez" } },
];
const inventoryResponse = [
  { subcategory: { nombre: "Sillas" }, price: 100 },
  { subcategory: { nombre: "Armarios" }, price: 50 },
  { subcategory: { nombre: "Mesas" }, price: 75 },
];
const vatResponse = {
  expenses: [{ month: 1, totalAmount: 0, totalVAT: 0 }],
  gaining: [{ month: 1, totalAmount: 0, totalVAT: 0 }],
};

const responseFor = (endpoint: string) => {
  if (endpoint === "/statistics/inventory") return inventoryResponse;
  if (endpoint.includes("adviser")) return adviserResponse;
  if (endpoint.includes("vat")) return vatResponse;
  return moneyResponse;
};

const renderPage = () => {
  const store = configureStore({ reducer: { statistics: statisticsReducer } });
  return render(
    <Provider store={store}>
      <Statistics />
    </Provider>,
  );
};

const expectEuroValue = (value: string) =>
  expect(screen.getAllByText((_, element) => element?.textContent === value).length).toBeGreaterThan(0);

afterEach(() => {
  mockApiClient.mockReset();
  mockFetchScopedVatStatistics.mockReset();
  mockFetchScopedVatStatistics.mockResolvedValue({
    expenses: [{ month: 7, totalAmount: 0, totalVAT: 0 }],
    gaining: [{ month: 7, totalAmount: 0, totalVAT: 0 }],
  });
});

describe("Statistics page", () => {
  it("renders all four successful tabs with zero-valued Money and VAT data", async () => {
    mockApiClient.mockImplementation((endpoint: string) =>
      Promise.resolve({ json: () => Promise.resolve(responseFor(endpoint)) }),
    );

    renderPage();

    expect(await screen.findByRole("heading", { name: `Ingresos y gastos — ${currentYear}` })).toBeInTheDocument();
    expectEuroValue("0,00 €");
    expect(screen.getByRole("tabpanel", { name: "Ingresos y gastos" }).querySelector('[data-axis="y"]'))
      .toHaveAttribute("data-tick-font-size", "12");

    await userEvent.click(screen.getByRole("tab", { name: "Asesores" }));
    expect((await screen.findAllByText("Ana Álvarez")).length).toBeGreaterThan(0);
    const adviserPanel = screen.getByRole("tabpanel", { name: "Asesores" });
    expect(adviserPanel.querySelector('[data-axis="month"]')).toBeTruthy();
    expect(adviserPanel.querySelector('[data-axis="y"]')).not.toHaveAttribute("data-tick-font-size");
    expect(adviserPanel.querySelectorAll('[data-series^="series_"]')).toHaveLength(2);
    expect(
      screen.getAllByText("Ana Álvarez")[0].compareDocumentPosition(screen.getAllByText("Zoe Zulueta")[0])
        & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    await userEvent.click(screen.getByRole("tab", { name: "Inventario" }));
    expect(await screen.findByText("Coste total")).toBeInTheDocument();
    expectEuroValue("225,00 €");

    await userEvent.click(screen.getByRole("tab", { name: "IVA" }));
    expect(await screen.findByText("Detalle mensual")).toBeInTheDocument();
    expectEuroValue("0,00 €");
  });

  it("hides previous-year Money data while the selected year is pending", async () => {
    let resolveNextMoney: ((value: { json: () => Promise<typeof moneyResponse> }) => void) | undefined;
    mockApiClient.mockImplementation((endpoint: string) => {
      if (endpoint === `/statistics/money/${currentYear + 1}`) {
        return new Promise((resolve) => { resolveNextMoney = resolve; });
      }

      return Promise.resolve({ json: () => Promise.resolve(responseFor(endpoint)) });
    });

    renderPage();
    await screen.findAllByText("Ingresos");
    expectEuroValue("0,00 €");

    fireEvent.change(screen.getByLabelText("Año"), { target: { value: String(currentYear + 1) } });

    expect(await screen.findByRole("status")).toHaveTextContent("Cargando estadísticas");
    expect(screen.queryAllByText("Ingresos")).toHaveLength(0);

    resolveNextMoney?.({ json: () => Promise.resolve(moneyResponse) });
    expect((await screen.findAllByText("Ingresos")).length).toBeGreaterThan(0);
  });

  it("keeps the Adviser tab usable for an empty future Money year and recovers on return", async () => {
    mockApiClient.mockImplementation((endpoint: string) => {
      if (endpoint === `/statistics/money/${currentYear + 1}`) {
        return Promise.resolve({ json: () => Promise.resolve({ expenses: null, gaining: null }) });
      }
      if (endpoint === `/statistics/adviser/${currentYear + 1}`) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
      }

      return Promise.resolve({ json: () => Promise.resolve(responseFor(endpoint)) });
    });

    renderPage();
    await userEvent.click(screen.getByRole("tab", { name: "Asesores" }));
    await screen.findAllByText("Ana Álvarez");

    fireEvent.change(screen.getByLabelText("Año"), { target: { value: String(currentYear + 1) } });
    expect(await screen.findByText("No hay estadísticas para el año seleccionado.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Año"), { target: { value: String(currentYear) } });
    expect((await screen.findAllByText("Ana Álvarez")).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("tab", { name: "Ingresos y gastos" }));
    expect(await screen.findByRole("heading", { name: `Ingresos y gastos — ${currentYear}` })).toBeInTheDocument();
    expectEuroValue("0,00 €");
  });

  it.each([
    ["money", "Ingresos y gastos", `/statistics/money/${currentYear}`],
    ["adviser", "Asesores", `/statistics/adviser/${currentYear}`],
    ["inventory", "Inventario", "/statistics/inventory"],
  ] as const)("shows and retries the %s resource independently", async (_, tabName, failingEndpoint) => {
    let attempts = 0;
    mockApiClient.mockImplementation((endpoint: string) => {
      if (endpoint === failingEndpoint) {
        attempts += 1;
        if (attempts === 1) return Promise.reject(new Error(`${tabName} unavailable`));
      }

      return Promise.resolve({ json: () => Promise.resolve(responseFor(endpoint)) });
    });

    renderPage();
    if (tabName !== "Ingresos y gastos") {
      await userEvent.click(screen.getByRole("tab", { name: tabName }));
    }

    expect(await screen.findByRole("alert")).toHaveTextContent(`${tabName} unavailable`);
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => expect(attempts).toBe(2));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("sorts inventory immutably by category and cost in both directions", async () => {
    mockApiClient.mockImplementation((endpoint: string) =>
      Promise.resolve({ json: () => Promise.resolve(responseFor(endpoint)) }),
    );

    renderPage();
    await userEvent.click(screen.getByRole("tab", { name: "Inventario" }));
    await screen.findByText("Armarios");

    const tableText = () => screen.getByRole("table").textContent ?? "";
    expect(tableText().indexOf("Armarios")).toBeLessThan(tableText().indexOf("Mesas"));
    expect(tableText().indexOf("Mesas")).toBeLessThan(tableText().indexOf("Sillas"));

    await userEvent.click(screen.getByRole("button", { name: "Coste ↕" }));
    expect(tableText().indexOf("Armarios")).toBeLessThan(tableText().indexOf("Mesas"));
    expect(tableText().indexOf("Mesas")).toBeLessThan(tableText().indexOf("Sillas"));

    await userEvent.click(screen.getByRole("button", { name: "Coste ↑" }));
    expect(tableText().indexOf("Sillas")).toBeLessThan(tableText().indexOf("Mesas"));
    expect(tableText().indexOf("Mesas")).toBeLessThan(tableText().indexOf("Armarios"));
    expect(inventoryResponse.map((item) => item.subcategory.nombre)).toEqual(["Sillas", "Armarios", "Mesas"]);
  });

  it("moves focus with arrow-key tab navigation and hides the year selector for inventory", async () => {
    mockApiClient.mockImplementation((endpoint: string) =>
      Promise.resolve({ json: () => Promise.resolve(responseFor(endpoint)) }),
    );

    renderPage();
    const moneyTab = screen.getByRole("tab", { name: "Ingresos y gastos" });
    moneyTab.focus();
    fireEvent.keyDown(moneyTab, { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Asesores" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Asesores" })).toHaveAttribute("aria-selected", "true");

    await userEvent.click(screen.getByRole("tab", { name: "Inventario" }));
    expect(screen.queryByLabelText("Año")).not.toBeInTheDocument();
  });

  it("renders the 2026 historical and Eventos periods separately without mixed totals", async () => {
    mockApiClient.mockImplementation((endpoint: string) =>
      Promise.resolve({ json: () => Promise.resolve(responseFor(endpoint)) }),
    );
    mockFetchScopedVatStatistics.mockImplementation(async (...arguments_: unknown[]) => arguments_[1] === "historical"
      ? {
        expenses: [{ month: 1, totalAmount: 121, totalVAT: 100 }],
        gaining: [{ month: 1, totalAmount: 100, totalVAT: 121 }],
      }
      : {
        expenses: [{ month: 7, totalAmount: 121, totalVAT: 100 }],
        gaining: [{ month: 7, totalAmount: 0, totalVAT: 70 }],
      });

    renderPage();
    await userEvent.click(screen.getByRole("tab", { name: "IVA" }));
    expect(await screen.findByText("Julio")).toBeInTheDocument();
    expect(screen.getByText("Tercer trimestre")).toBeInTheDocument();
    expect(screen.queryByText("Primer trimestre")).not.toBeInTheDocument();
    expectEuroValue("49,00 €");

    await userEvent.selectOptions(screen.getByLabelText("Ámbito"), "historical");
    expect(await screen.findByText("Enero")).toBeInTheDocument();
    expect(screen.getByText("Primer trimestre")).toBeInTheDocument();
    expect(screen.queryByText("Julio")).not.toBeInTheDocument();
    expectEuroValue("0,00 €");
  });

  it("clears old scope values while a new scope is pending and forces Eventos after 2026", async () => {
    let resolveHistorical: ((value: { expenses: []; gaining: [] }) => void) | undefined;
    mockApiClient.mockImplementation((endpoint: string) =>
      Promise.resolve({ json: () => Promise.resolve(responseFor(endpoint)) }),
    );
    mockFetchScopedVatStatistics.mockImplementation((...arguments_: unknown[]) => {
      const [year, scope] = arguments_;
      if (year === 2026 && scope === "historical") {
        return new Promise((resolve) => { resolveHistorical = resolve; });
      }
      return Promise.resolve({
        expenses: [{ month: 7, totalAmount: 0, totalVAT: 0 }],
        gaining: [{ month: 7, totalAmount: 0, totalVAT: 70 }],
      });
    });

    renderPage();
    await userEvent.click(screen.getByRole("tab", { name: "IVA" }));
    await screen.findByText("Julio");
    expectEuroValue("70,00 €");

    await userEvent.selectOptions(screen.getByLabelText("Ámbito"), "historical");
    expect(await screen.findByRole("status")).toHaveTextContent("Cargando estadísticas");
    expect(screen.queryByText("Julio")).not.toBeInTheDocument();
    expect(screen.queryByText("70,00 €")).not.toBeInTheDocument();

    resolveHistorical?.({ expenses: [], gaining: [] });
    await screen.findByText("No hay estadísticas para el año seleccionado.");

    await userEvent.selectOptions(screen.getByLabelText("Año"), "2027");
    await waitFor(() => expect(screen.getByLabelText("Ámbito")).toHaveValue("eventos"));
    expect(screen.getByLabelText("Ámbito")).toHaveTextContent("Alquilandia Eventos");
    expect(mockFetchScopedVatStatistics).not.toHaveBeenCalledWith(2027, "historical");

    await userEvent.selectOptions(screen.getByLabelText("Año"), "2025");
    await waitFor(() => expect(screen.getByLabelText("Ámbito")).toHaveValue("historical"));
    expect(mockFetchScopedVatStatistics).not.toHaveBeenCalledWith(2025, "eventos");
  });
});
