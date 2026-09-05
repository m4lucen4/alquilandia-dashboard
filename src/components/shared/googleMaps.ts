let mapsLoadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (mapsLoadPromise) return mapsLoadPromise;
  if (typeof google !== "undefined" && google.maps) {
    mapsLoadPromise = Promise.resolve();
    return mapsLoadPromise;
  }
  mapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Error al cargar Google Maps"));
    document.head.appendChild(script);
  });
  return mapsLoadPromise;
};
