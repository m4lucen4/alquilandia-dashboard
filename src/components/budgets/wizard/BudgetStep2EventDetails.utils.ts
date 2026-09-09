import type { Warehouse } from "@/types/warehouses";

export interface EventLocation {
  latitude: string;
  longitude: string;
}

interface RouteComputer {
  computeRoutes: (
    request: google.maps.routes.ComputeRoutesRequest,
  ) => Promise<{ routes: google.maps.routes.Route[] | undefined }>;
}

export const formatDrivingMileage = (distanceKm: number): string =>
  `${distanceKm.toLocaleString("es-ES", { maximumFractionDigits: 1 })} km`;

export const calculateDrivingMileage = async (
  routeComputer: RouteComputer,
  location: EventLocation,
  warehouses: Warehouse[],
): Promise<string> => {
  if (warehouses.length === 0) {
    throw new Error("No mileage warehouses available");
  }

  const destination = {
    lat: Number.parseFloat(location.latitude),
    lng: Number.parseFloat(location.longitude),
  };

  if (!Number.isFinite(destination.lat) || !Number.isFinite(destination.lng)) {
    throw new TypeError("Invalid event location");
  }

  const distancesKm = await Promise.all(
    warehouses.map(async (warehouse) => {
      if (!Number.isFinite(warehouse.latitude) || !Number.isFinite(warehouse.longitude)) {
        throw new TypeError("Invalid warehouse location");
      }

      const { routes } = await routeComputer.computeRoutes({
        origin: { lat: warehouse.latitude, lng: warehouse.longitude },
        destination,
        travelMode: "DRIVING",
        computeAlternativeRoutes: false,
        fields: ["distanceMeters"],
      });
      const distanceMeters = routes?.[0]?.distanceMeters;

      if (
        distanceMeters === undefined ||
        !Number.isFinite(distanceMeters) ||
        distanceMeters < 0
      ) {
        throw new Error("No driving route found");
      }

      return distanceMeters / 1000;
    }),
  );

  return formatDrivingMileage(Math.min(...distancesKm));
};
