import { describe, expect, it, vi } from "vitest";
import {
  calculateDrivingMileage,
  formatDrivingMileage,
} from "./BudgetStep2EventDetails.utils";
import type { Warehouse } from "@/types/warehouses";

const warehouses: Warehouse[] = [
  {
    id: "warehouse-a",
    name: "Warehouse A",
    latitude: 37.4,
    longitude: -5.9,
    address: "Address A",
    use_for_mileage: true,
  },
  {
    id: "warehouse-b",
    name: "Warehouse B",
    latitude: 37.5,
    longitude: -6,
    address: "Address B",
    use_for_mileage: true,
  },
];

describe("calculateDrivingMileage", () => {
  it("selects the nearest warehouse using each recommended driving route", async () => {
    const computeRoutes = vi
      .fn()
      .mockResolvedValueOnce({ routes: [{ distanceMeters: 18340 }] })
      .mockResolvedValueOnce({ routes: [{ distanceMeters: 12650 }] });

    await expect(
      calculateDrivingMileage(
        { computeRoutes },
        { latitude: "37.3", longitude: "-5.8" },
        warehouses,
      ),
    ).resolves.toBe("12,7 km");

    expect(computeRoutes).toHaveBeenCalledTimes(2);
    expect(computeRoutes).toHaveBeenCalledWith({
      origin: { lat: 37.4, lng: -5.9 },
      destination: { lat: 37.3, lng: -5.8 },
      travelMode: "DRIVING",
      computeAlternativeRoutes: false,
      fields: ["distanceMeters"],
    });
  });

  it("rejects mileage when a warehouse has no recommended driving route", async () => {
    const computeRoutes = vi.fn().mockResolvedValue({ routes: [] });

    await expect(
      calculateDrivingMileage(
        { computeRoutes },
        { latitude: "37.3", longitude: "-5.8" },
        warehouses,
      ),
    ).rejects.toThrow("No driving route found");
  });

  it("rejects mileage when no warehouses are enabled", async () => {
    const computeRoutes = vi.fn();

    await expect(
      calculateDrivingMileage(
        { computeRoutes },
        { latitude: "37.3", longitude: "-5.8" },
        [],
      ),
    ).rejects.toThrow("No mileage warehouses available");

    expect(computeRoutes).not.toHaveBeenCalled();
  });

  it("rejects a negative route distance instead of using an incomplete minimum", async () => {
    const computeRoutes = vi
      .fn()
      .mockResolvedValueOnce({ routes: [{ distanceMeters: 12650 }] })
      .mockResolvedValueOnce({ routes: [{ distanceMeters: -1 }] });

    await expect(
      calculateDrivingMileage(
        { computeRoutes },
        { latitude: "37.3", longitude: "-5.8" },
        warehouses,
      ),
    ).rejects.toThrow("No driving route found");
  });

  it("formats one decimal kilometre values using the existing Spanish format", () => {
    expect(formatDrivingMileage(18.35)).toBe("18,4 km");
  });
});
