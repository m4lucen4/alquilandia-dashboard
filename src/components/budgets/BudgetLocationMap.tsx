import { type FC, useEffect, useMemo, useRef, useState } from "react";
import type { Budget } from "@/types/budgets";
import { loadGoogleMaps } from "@/components/shared/googleMaps";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  getMapPosition,
  type MapPosition,
} from "./budgetLocationMap.utils";

interface BudgetLocationMapProps {
  budgets: Budget[];
  onBudgetSelect: (budget: Budget) => void;
}

interface BudgetMapLocation {
  budget: Budget;
  position: MapPosition;
}

const getMappableBudgets = (budgets: Budget[]): BudgetMapLocation[] =>
  budgets.flatMap((budget) => {
    const position = getMapPosition(budget.location);
    return position ? [{ budget, position }] : [];
  });

export const BudgetLocationMap: FC<BudgetLocationMapProps> = ({
  budgets,
  onBudgetSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const locations = useMemo(() => getMappableBudgets(budgets), [budgets]);

  useEffect(() => {
    let active = true;

    loadGoogleMaps()
      .then(() => {
        if (!active || !mapContainerRef.current) return;

        mapRef.current = new google.maps.Map(mapContainerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        setIsMapReady(true);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
      markersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = locations.map(({ budget, position }) => {
      const marker = new google.maps.Marker({ map, position });
      marker.addListener("click", () => onBudgetSelect(budget));
      return marker;
    });

    if (locations.length === 0) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
      return;
    }

    if (locations.length === 1) {
      map.setCenter(locations[0].position);
      map.setZoom(14);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    locations.forEach(({ position }) => bounds.extend(position));
    map.fitBounds(bounds, 48);
  }, [isMapReady, locations, onBudgetSelect]);

  if (loadError) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        No se pudo cargar el mapa de ubicaciones.
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-[60vh] min-h-96 w-full overflow-hidden rounded-xl border border-gray-200"
      aria-label="Mapa de ubicaciones de presupuestos"
    />
  );
};
