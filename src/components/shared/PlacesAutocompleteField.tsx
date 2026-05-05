import { type FC, useEffect, useRef } from "react";

interface Location {
  latitude: string;
  longitude: string;
}

interface PlacesAutocompleteFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onLocationChange?: (location: Location) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const BASE_INPUT_CLASSES =
  "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 sm:text-sm/6 transition-colors";

const NORMAL_INPUT_CLASSES =
  "outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600";

const ERROR_INPUT_CLASSES =
  "outline-1 -outline-offset-1 outline-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600";

const DEFAULT_CENTER = { lat: 37.3886303, lng: -5.9952279 };
const DEFAULT_ZOOM = 12;

let mapsLoadPromise: Promise<void> | null = null;

const loadGoogleMaps = (): Promise<void> => {
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

export const PlacesAutocompleteField: FC<PlacesAutocompleteFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onLocationChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder,
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const onLocationChangeRef = useRef(onLocationChange);
  const inputId = `places-${name}`;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    let active = true;

    loadGoogleMaps().then(() => {
      if (!active || !inputRef.current || !mapContainerRef.current) return;

      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["establishment", "geocode"],
          componentRestrictions: { country: "es" },
          fields: ["formatted_address", "geometry", "name"],
        },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        const address =
          place?.formatted_address ??
          (place?.name ? place.name : inputRef.current?.value ?? "");

        onChangeRef.current(address);
        if (inputRef.current) inputRef.current.value = address;

        if (place?.geometry?.location) {
          const position = place.geometry.location;
          mapRef.current?.setCenter(position);
          mapRef.current?.setZoom(15);
          markerRef.current?.setMap(null);
          markerRef.current = new google.maps.Marker({
            map: mapRef.current,
            position,
          });
          if (onLocationChangeRef.current) {
            onLocationChangeRef.current({
              latitude: String(position.lat()),
              longitude: String(position.lng()),
            });
          }
        }
      });
    });

    return () => {
      active = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="block text-sm/6 font-medium text-gray-900"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div
        ref={mapContainerRef}
        className="mt-2 h-64 w-full overflow-hidden rounded-xl border border-gray-200"
      />
      <div className="mt-3">
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          defaultValue={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`${BASE_INPUT_CLASSES} ${error ? ERROR_INPUT_CLASSES : NORMAL_INPUT_CLASSES} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};
