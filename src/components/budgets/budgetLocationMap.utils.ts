import type { Location } from "@/types/budgets";

export interface MapPosition {
  lat: number;
  lng: number;
}

export const DEFAULT_CENTER: MapPosition = { lat: 37.3044241, lng: -5.9738342 };
export const DEFAULT_ZOOM = 10;

export const getMapPosition = (
  location: Location | null | undefined,
): MapPosition | null => {
  if (!location) return null;

  const latitude = Number.parseFloat(location.latitude);
  const longitude = Number.parseFloat(location.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return { lat: latitude, lng: longitude };
};
