import { describe, it, expect } from "vitest";
import {
  getExceptionPrice,
  buildBudgetLine,
  recalculatePrice,
  upsertBudgetLine,
  removeBudgetLine,
  setBudgetLineUnits,
} from "@/helpers/budgetLines";
import type { Budget, Extra } from "@/types/budgets";
import type { Inventory } from "@/types/inventory";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeProduct = (overrides: Partial<Inventory> = {}): Inventory => ({
  id: "prod-1",
  elemento: "Silla Windsor",
  categoria: "Mobiliario",
  categoriaObj: { id: "cat-1", principal: "Mobiliario", nombre: "Sillas" },
  costeTotal: 160,
  unidades: 50,
  precioUd: 15,
  precioCoste: 5,
  bloqueo: 0,
  private: false,
  priceExceptionList: [],
  extras: [],
  archivo: [],
  datetime: "",
  observaciones: "",
  objetoid: "",
  units: 0,
  warehouseUnits: 40,
  warehouseWarningUnitsLimit: 5,
  documents: [],
  ...overrides,
});

const makeExtra = (overrides: Partial<Extra> = {}): Extra => ({
  id: "e-1",
  extraName: "Funda roja",
  price: 2,
  checked: false,
  units: 1,
  ...overrides,
});

const makeBudget = (overrides: Partial<Budget> = {}): Budget =>
  ({
    id: "budget-1",
    budgetId: "uuid-1",
    budgetReference: 1001,
    eventDate: "2026-06-05T22:00:00Z",
    address: "",
    location: { latitude: "37", longitude: "-5" },
    distance: "10 km",
    concepto: "",
    comments: "",
    commentsalquilandia: "",
    cancelled: false,
    finished: false,
    isDelayed: false,
    locality: "",
    nosend: false,
    status: "PENDING",
    creationDate: "",
    lastUpdatedDate: "",
    deletedAt: null,
    technicianEmailHash: "",
    userEmailHash: "",
    client: "",
    phone: "",
    nReceipt: 0,
    receiptDate: "",
    afiliatedPhone: "",
    totalCouponDiscount: 0,
    payment: { type: "", hpp: { AMOUNT: "", ORDER_ID: "", MERCHANT_ID: "", TIMESTAMP: "" } },
    user: {
      id: "u-1",
      firstName: "Juan",
      lastName: "García",
      email: "juan@test.com",
      phone: "600",
      phone2: "",
      dnif: "",
      address: "",
      blocked: false,
      discount: 0,
      emailHash: "",
      estado: "",
      FullName: "Juan García",
      googleId: "",
      appleId: "",
      company: null,
      isDeleted: false,
      deletedAt: "",
      problematic: false,
      locality: "",
      population: "",
      registered: "",
      role: "CLIENT",
      zipCode: "",
      password: "",
    },
    technician: null as unknown as Budget["technician"],
    price: {
      subTotal: 0,
      extras: 0,
      subTotalWithExtras: 0,
      userDiscountPercentage: 0,
      userDiscount: 0,
      costSend: 0,
      packs: 0,
      vat: 0,
      total: 0,
      withIVA: true,
      alreadyPaid: 0,
    },
    budgetLines: [],
    ...overrides,
  }) as Budget;

// ─── getExceptionPrice ────────────────────────────────────────────────────────

describe("getExceptionPrice", () => {
  it("devuelve precioUd cuando no hay excepciones", () => {
    const p = makeProduct({ precioUd: 15, priceExceptionList: [] });
    expect(getExceptionPrice(p, "2026-06-05T22:00:00Z")).toBe(15);
  });

  it("devuelve el precio de excepción cuando la fecha coincide en día local", () => {
    const p = makeProduct({
      precioUd: 15,
      priceExceptionList: [{ id: "ex-1", date: "2026-06-06T00:00:00Z", price: 25 }],
    });
    // eventDate: 2026-06-05T22:00:00Z → en UTC es el 5, pero en local (UTC+2) es el 6
    // La comparación es por día local de ambas fechas
    const eventDate = "2026-06-05T22:00:00Z";
    const exceptionDate = "2026-06-06T00:00:00Z";
    const eDay = new Date(exceptionDate);
    const evDay = new Date(eventDate);
    // Si coinciden en día local, devuelve 25; si no, 15
    const expected =
      eDay.getFullYear() === evDay.getFullYear() &&
      eDay.getMonth() === evDay.getMonth() &&
      eDay.getDate() === evDay.getDate()
        ? 25
        : 15;
    expect(getExceptionPrice(p, eventDate)).toBe(expected);
  });

  it("devuelve precioUd cuando la excepción no coincide", () => {
    const p = makeProduct({
      precioUd: 15,
      priceExceptionList: [{ id: "ex-1", date: "2026-12-25T00:00:00Z", price: 50 }],
    });
    expect(getExceptionPrice(p, "2026-06-05T22:00:00Z")).toBe(15);
  });

  it("devuelve precioUd con fecha cero de Go", () => {
    const p = makeProduct({ precioUd: 15 });
    expect(getExceptionPrice(p, "0001-01-01T00:00:00Z")).toBe(15);
  });

  it("devuelve precioUd con eventDate vacío", () => {
    const p = makeProduct({ precioUd: 15 });
    expect(getExceptionPrice(p, "")).toBe(15);
  });
});

// ─── buildBudgetLine ──────────────────────────────────────────────────────────

describe("buildBudgetLine", () => {
  it("mapea correctamente las claves divergentes", () => {
    const p = makeProduct({ precioCoste: 5, costeTotal: 160, precioUd: 15 });
    const line = buildBudgetLine(p, 10, 0, [], 15);
    expect(line.preciocoste).toBe(5);
    expect(line.costetotal).toBe(160);
    expect(line.originalPrice).toBe(15);
    expect(line.nombre).toBeNull();
    expect(line.codigo).toBeNull();
  });

  it("calcula totalPrice correctamente sin descuento", () => {
    const line = buildBudgetLine(makeProduct(), 10, 0, [], 15);
    expect(line.totalPrice).toBe(150);
  });

  it("calcula totalPrice con descuento del 10%", () => {
    const line = buildBudgetLine(makeProduct(), 10, 10, [], 15);
    expect(line.totalPrice).toBeCloseTo(135);
  });
});

// ─── recalculatePrice ─────────────────────────────────────────────────────────

describe("recalculatePrice", () => {
  it("calcula subTotal, extras, vat y total correctamente", () => {
    const budget = makeBudget({
      budgetLines: [
        buildBudgetLine(makeProduct({ id: "p1" }), 10, 0, [makeExtra({ checked: true, units: 10, price: 2 })], 15),
        buildBudgetLine(makeProduct({ id: "p2" }), 5, 0, [], 20),
      ],
    });
    const result = recalculatePrice(budget);
    // subTotal = 10*15 + 5*20 = 150 + 100 = 250
    expect(result.price.subTotal).toBeCloseTo(250);
    // extras = 10 * 2 (checked) = 20
    expect(result.price.extras).toBeCloseTo(20);
    // subTotalWithExtras = 270
    expect(result.price.subTotalWithExtras).toBeCloseTo(270);
    // vat = 270 * 0.21 = 56.7
    expect(result.price.vat).toBeCloseTo(56.7);
    // total = 270 * 1.21 = 326.7
    expect(result.price.total).toBeCloseTo(326.7);
  });

  it("aplica descuento de usuario si user.discount > 0", () => {
    const budget = makeBudget({
      user: { ...makeBudget().user, discount: 10 },
      budgetLines: [
        buildBudgetLine(makeProduct(), 10, 0, [], 15),
      ],
    });
    const result = recalculatePrice(budget);
    // subTotal = 150, packs = 0 → userDiscount = (150 - 0) * 0.1 = 15
    expect(result.price.userDiscount).toBeCloseTo(15);
    expect(result.price.userDiscountPercentage).toBe(10);
  });

  it("ignora extras no marcados", () => {
    const budget = makeBudget({
      budgetLines: [
        buildBudgetLine(makeProduct(), 10, 0, [makeExtra({ checked: false })], 15),
      ],
    });
    const result = recalculatePrice(budget);
    expect(result.price.extras).toBe(0);
  });
});

// ─── upsertBudgetLine ─────────────────────────────────────────────────────────

describe("upsertBudgetLine", () => {
  it("añade una nueva línea si el producto no está en el carrito", () => {
    const budget = makeBudget();
    const result = upsertBudgetLine(budget, makeProduct(), { unitsToAdd: 5, descuento: 0, extras: [] });
    expect(result.budgetLines).toHaveLength(1);
    expect(result.budgetLines[0].units).toBe(5);
  });

  it("suma unidades sin duplicar si el producto ya está en el carrito", () => {
    const product = makeProduct();
    const budget = makeBudget({
      budgetLines: [buildBudgetLine(product, 5, 0, [], 15)],
    });
    const result = upsertBudgetLine(budget, product, { unitsToAdd: 3, descuento: 0, extras: [] });
    expect(result.budgetLines).toHaveLength(1);
    expect(result.budgetLines[0].units).toBe(8);
  });

  it("hace merge OR de extras checked al actualizar línea existente", () => {
    const product = makeProduct();
    const extraPrev: Extra = { id: "e-1", extraName: "Funda", price: 2, checked: true, units: 5 };
    const budget = makeBudget({
      budgetLines: [buildBudgetLine(product, 5, 0, [extraPrev], 15)],
    });
    // El usuario desmarca el extra en el modal
    const extraNew: Extra = { id: "e-1", extraName: "Funda", price: 2, checked: false, units: 3 };
    const result = upsertBudgetLine(budget, product, { unitsToAdd: 2, descuento: 0, extras: [extraNew] });
    // Como estaba checked antes, debe seguir checked (merge OR)
    expect(result.budgetLines[0].extras[0].checked).toBe(true);
  });

  it("recalcula price tras añadir", () => {
    const budget = makeBudget();
    const result = upsertBudgetLine(budget, makeProduct(), { unitsToAdd: 10, descuento: 0, extras: [] });
    expect(result.price.subTotal).toBeCloseTo(150);
    expect(result.price.total).toBeCloseTo(150 * 1.21);
  });

  it("aplica descuento por línea correctamente", () => {
    const budget = makeBudget();
    const result = upsertBudgetLine(budget, makeProduct(), { unitsToAdd: 10, descuento: 10, extras: [] });
    // totalPrice = 10*15 - 10*15*0.1 = 135
    expect(result.budgetLines[0].totalPrice).toBeCloseTo(135);
  });
});

// ─── removeBudgetLine ─────────────────────────────────────────────────────────

describe("removeBudgetLine", () => {
  it("elimina la línea y recalcula price", () => {
    const product = makeProduct();
    const budget = makeBudget({
      budgetLines: [
        buildBudgetLine(makeProduct({ id: "p1" }), 10, 0, [], 15),
        buildBudgetLine(product, 5, 0, [], 20),
      ],
    });
    const result = removeBudgetLine(budget, product.id);
    expect(result.budgetLines).toHaveLength(1);
    expect(result.price.subTotal).toBeCloseTo(150);
  });

  it("no falla si el id no existe", () => {
    const budget = makeBudget({ budgetLines: [buildBudgetLine(makeProduct(), 5, 0, [], 15)] });
    const result = removeBudgetLine(budget, "no-existe");
    expect(result.budgetLines).toHaveLength(1);
  });
});

// ─── setBudgetLineUnits ───────────────────────────────────────────────────────

describe("setBudgetLineUnits", () => {
  it("actualiza las unidades y recalcula totalPrice y price", () => {
    const product = makeProduct();
    const budget = makeBudget({
      budgetLines: [buildBudgetLine(product, 5, 0, [], 15)],
    });
    const result = setBudgetLineUnits(budget, product.id, 10);
    expect(result.budgetLines[0].units).toBe(10);
    expect(result.budgetLines[0].totalPrice).toBeCloseTo(150);
    expect(result.price.subTotal).toBeCloseTo(150);
  });

  it("respeta el descuento al recalcular unidades", () => {
    const product = makeProduct();
    const budget = makeBudget({
      budgetLines: [buildBudgetLine(product, 5, 10, [], 15)],
    });
    const result = setBudgetLineUnits(budget, product.id, 10);
    // totalPrice = 10*15 - 10*15*0.1 = 135
    expect(result.budgetLines[0].totalPrice).toBeCloseTo(135);
  });
});
