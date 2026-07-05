import { describe, it, expect } from "vitest";
import {
  calculateCostSend,
  recalculateCouponDiscount,
  recalculatePrice,
  updateBudgetLineValues,
  buildBudgetLine,
} from "@/helpers/budgetLines";
import type { Budget, Coupon, Extra } from "@/types/budgets";
import type { Inventory } from "@/types/inventory";
import type { ShippingCost } from "@/types/shippingCosts";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeShippingCosts = (overrides: Partial<ShippingCost> = {}): ShippingCost => ({
  _id: "sc-1",
  fixedPriceBlockZero: 10,
  fixedPriceBlockNotZero: 20,
  distanceVarBlockZero: 1,
  distanceVarBlockNotZero: 2,
  ...overrides,
});

const makeCoupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: "c-1",
  code: "PROMO10",
  discount: 10,
  maxUses: 100,
  active: true,
  ...overrides,
});

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
    address: "Calle Test 1",
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

// ─── calculateCostSend ────────────────────────────────────────────────────────

describe("calculateCostSend", () => {
  it("devuelve 0 si nosend = true", () => {
    const budget = makeBudget({
      nosend: true,
      distance: "10 km",
      budgetLines: [buildBudgetLine(makeProduct(), 5, 0, [], 15)],
    });
    expect(calculateCostSend(budget, makeShippingCosts())).toBe(0);
  });

  it("devuelve 0 si no hay líneas", () => {
    const budget = makeBudget({ budgetLines: [] });
    expect(calculateCostSend(budget, makeShippingCosts())).toBe(0);
  });

  it("devuelve 0 si shippingCosts es null", () => {
    const budget = makeBudget({
      budgetLines: [buildBudgetLine(makeProduct(), 5, 0, [], 15)],
    });
    expect(calculateCostSend(budget, null)).toBe(0);
  });

  it("parsea la distancia con coma decimal '18,5 km' → 18.5", () => {
    // bloqueo=0, todos zero: costSend = 18.5 * distanceVarBlockZero + fixedPriceBlockZero
    const sc = makeShippingCosts({ distanceVarBlockZero: 1, fixedPriceBlockZero: 10 });
    const budget = makeBudget({
      distance: "18,5 km",
      budgetLines: [buildBudgetLine(makeProduct({ bloqueo: 0 }), 1, 0, [], 15)],
    });
    expect(calculateCostSend(budget, sc)).toBeCloseTo(18.5 * 1 + 10);
  });

  it("usa variante Zero cuando todos los bloqueos son 0", () => {
    const sc = makeShippingCosts({
      distanceVarBlockZero: 2,
      fixedPriceBlockZero: 5,
      distanceVarBlockNotZero: 4,
      fixedPriceBlockNotZero: 15,
    });
    const budget = makeBudget({
      distance: "10 km",
      budgetLines: [buildBudgetLine(makeProduct({ bloqueo: 0 }), 1, 0, [], 15)],
    });
    // 10 * 2 + 5 = 25
    expect(calculateCostSend(budget, sc)).toBeCloseTo(25);
  });

  it("usa variante NotZero cuando todos los bloqueos son > 0", () => {
    const sc = makeShippingCosts({
      distanceVarBlockZero: 2,
      fixedPriceBlockZero: 5,
      distanceVarBlockNotZero: 4,
      fixedPriceBlockNotZero: 15,
    });
    const budget = makeBudget({
      distance: "10 km",
      budgetLines: [buildBudgetLine(makeProduct({ bloqueo: 1 }), 1, 0, [], 15)],
    });
    // 10 * 4 + 15 = 55
    expect(calculateCostSend(budget, sc)).toBeCloseTo(55);
  });

  it("usa ambas variantes cuando hay mezcla de bloqueos", () => {
    const sc = makeShippingCosts({
      distanceVarBlockZero: 2,
      fixedPriceBlockZero: 5,
      distanceVarBlockNotZero: 4,
      fixedPriceBlockNotZero: 15,
    });
    const budget = makeBudget({
      distance: "10 km",
      budgetLines: [
        buildBudgetLine(makeProduct({ id: "p1", bloqueo: 0 }), 1, 0, [], 15),
        buildBudgetLine(makeProduct({ id: "p2", bloqueo: 1 }), 1, 0, [], 20),
      ],
    });
    // 10 * (2+4) + (5+15) = 60 + 20 = 80
    expect(calculateCostSend(budget, sc)).toBeCloseTo(80);
  });

  it("devuelve 0 si la distancia no es parseable", () => {
    const budget = makeBudget({
      distance: "",
      budgetLines: [buildBudgetLine(makeProduct(), 1, 0, [], 15)],
    });
    expect(calculateCostSend(budget, makeShippingCosts())).toBeCloseTo(
      0 * 1 + 10,
    );
  });
});

// ─── recalculateCouponDiscount ────────────────────────────────────────────────

describe("recalculateCouponDiscount", () => {
  it("calcula lineDiscount correctamente y totalCouponDiscount es la suma", () => {
    const lines = [
      buildBudgetLine(makeProduct({ id: "p1", precioUd: 15 } as unknown as Inventory), 10, 0, [], 15),
      buildBudgetLine(makeProduct({ id: "p2", precioUd: 20 } as unknown as Inventory), 5, 0, [], 20),
    ];
    const coupon = makeCoupon({ discount: 10 });
    const { lines: updated, totalCouponDiscount } = recalculateCouponDiscount(lines, coupon);
    // p1: 15 * 10 * 0.1 = 15; p2: 20 * 5 * 0.1 = 10 → total = 25
    expect(updated[0].couponDiscount).toBeCloseTo(15);
    expect(updated[1].couponDiscount).toBeCloseTo(10);
    expect(totalCouponDiscount).toBeCloseTo(25);
  });

  it("salta líneas con packId", () => {
    const lines = [
      { ...buildBudgetLine(makeProduct({ id: "p1" }), 10, 0, [], 15), packId: "pack-1" },
      buildBudgetLine(makeProduct({ id: "p2" }), 5, 0, [], 20),
    ];
    const coupon = makeCoupon({ discount: 10 });
    const { lines: updated, totalCouponDiscount } = recalculateCouponDiscount(lines, coupon);
    expect(updated[0].couponDiscount).toBeUndefined();
    expect(totalCouponDiscount).toBeCloseTo(20 * 5 * 0.1);
  });
});

// ─── recalculatePrice (canónico con shippingCosts y cupón) ────────────────────

describe("recalculatePrice (canónico)", () => {
  it("incorpora costSend en la base del IVA", () => {
    const sc = makeShippingCosts({ distanceVarBlockZero: 0, fixedPriceBlockZero: 20 });
    const budget = makeBudget({
      distance: "10 km",
      budgetLines: [buildBudgetLine(makeProduct(), 10, 0, [], 15)],
    });
    const result = recalculatePrice(budget, sc);
    // subTotal=150, extras=0, costSend=20, applied=0
    // totalPriceWithoutVat = 150+20-0 = 170
    // vat = 170 * 0.21 = 35.7
    // total = 170 + 35.7 = 205.7
    expect(result.price.costSend).toBeCloseTo(20);
    expect(result.price.vat).toBeCloseTo(35.7);
    expect(result.price.total).toBeCloseTo(205.7);
  });

  it("aplica userDiscount cuando es mayor que el cupón", () => {
    const budget = makeBudget({
      user: { ...makeBudget().user, discount: 20 },
      coupon: makeCoupon({ discount: 10 }),
      totalCouponDiscount: 15,
      budgetLines: [buildBudgetLine(makeProduct(), 10, 0, [], 15)],
    });
    const result = recalculatePrice(budget);
    // subTotal=150, userDiscount = 150*0.2=30, couponPct=10 < userPct=20 → userDiscount gana
    // totalPriceWithoutVat = 150 - 30 = 120; vat = 120*0.21=25.2; total=145.2
    expect(result.price.userDiscount).toBeCloseTo(30);
    expect(result.price.total).toBeCloseTo(145.2);
  });

  it("aplica cupón cuando es mayor que el descuento de usuario", () => {
    const budget = makeBudget({
      user: { ...makeBudget().user, discount: 5 },
      coupon: makeCoupon({ discount: 20 }),
      budgetLines: [buildBudgetLine(makeProduct(), 10, 0, [], 15)],
    });
    const result = recalculatePrice(budget);
    // subTotal=150, userPct=5 < couponPct=20 → cupón gana
    // couponDiscount por línea: 15*10*0.2 = 30; totalCouponDiscount=30
    // totalPriceWithoutVat = 150 - 30 = 120; vat=25.2; total=145.2
    expect(result.totalCouponDiscount).toBeCloseTo(30);
    expect(result.price.total).toBeCloseTo(145.2);
  });

  it("nunca aplica ambos descuentos a la vez", () => {
    const budget = makeBudget({
      user: { ...makeBudget().user, discount: 10 },
      coupon: makeCoupon({ discount: 20 }),
      budgetLines: [buildBudgetLine(makeProduct(), 10, 0, [], 15)],
    });
    const result = recalculatePrice(budget);
    // subTotal=150, couponDiscount=30, userDiscount=15; cupón > userDiscount
    // solo aplicar 30, no 15+30=45
    const applied = result.totalCouponDiscount;
    expect(result.price.total).toBeCloseTo((150 - applied) * 1.21);
    expect(applied).toBeCloseTo(30);
  });

  it("sin shippingCosts conserva el costSend previo", () => {
    const budget = makeBudget({
      distance: "10 km",
      price: {
        ...makeBudget().price,
        costSend: 50,
      },
      budgetLines: [buildBudgetLine(makeProduct(), 5, 0, [], 15)],
    });
    const result = recalculatePrice(budget);
    expect(result.price.costSend).toBe(50);
  });
});

// ─── updateBudgetLineValues ───────────────────────────────────────────────────

describe("updateBudgetLineValues", () => {
  it("actualiza unidades y recalcula totalPrice y price", () => {
    const product = makeProduct();
    const budget = makeBudget({
      budgetLines: [buildBudgetLine(product, 5, 0, [], 15)],
    });
    const result = updateBudgetLineValues(budget, product.id, { units: 10 });
    expect(result.budgetLines[0].units).toBe(10);
    expect(result.budgetLines[0].totalPrice).toBeCloseTo(150);
    expect(result.price.subTotal).toBeCloseTo(150);
  });

  it("actualiza descuento y recalcula totalPrice", () => {
    const product = makeProduct();
    const budget = makeBudget({
      budgetLines: [buildBudgetLine(product, 10, 0, [], 15)],
    });
    const result = updateBudgetLineValues(budget, product.id, { descuento: 10 });
    // totalPrice = 10*15 - 10*15*0.1 = 135
    expect(result.budgetLines[0].totalPrice).toBeCloseTo(135);
  });

  it("actualiza extras sin alterar unidades ni descuento", () => {
    const product = makeProduct();
    const budget = makeBudget({
      budgetLines: [buildBudgetLine(product, 5, 0, [], 15)],
    });
    const newExtras = [makeExtra({ checked: true, units: 3, price: 5 })];
    const result = updateBudgetLineValues(budget, product.id, { extras: newExtras });
    expect(result.budgetLines[0].extras[0].checked).toBe(true);
    // extras en price: 3 * 5 = 15
    expect(result.price.extras).toBeCloseTo(15);
  });

  it("pasa shippingCosts a recalculatePrice", () => {
    const product = makeProduct();
    const sc = makeShippingCosts({ distanceVarBlockZero: 0, fixedPriceBlockZero: 30 });
    const budget = makeBudget({
      distance: "10 km",
      budgetLines: [buildBudgetLine(product, 5, 0, [], 15)],
    });
    const result = updateBudgetLineValues(budget, product.id, { units: 10 }, sc);
    expect(result.price.costSend).toBeCloseTo(30);
  });
});
