'use client';

import { useEffect, useRef, useState } from 'react';
import {
  buildMapsLink,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  formatCoordinate,
  hasValidCoordinates,
  SELECTED_MAP_ZOOM,
  toCoordinateNumber,
} from '@/lib/location';

const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_LAYER_ATTRIBUTION = '&copy; OpenStreetMap contributors';

export default function LocationPicker({
  value,
  onChange,
  title = 'Lokasi di Maps',
  helperText = 'Klik di peta untuk memilih titik lokasi.',
}) {
  const latitude = toCoordinateNumber(value?.latitude);
  const longitude = toCoordinateNumber(value?.longitude);
  const hasCoordinates = hasValidCoordinates(latitude, longitude);
  const mapsLink = value?.mapLink || buildMapsLink(latitude, longitude);
  const coordinatesText = hasCoordinates
    ? `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`
    : '';

  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletRef = useRef(null);
  const latestOnChangeRef = useRef(onChange);
  const updateLocationRef = useRef(null);
  const initialLocationRef = useRef({
    hasCoordinates,
    latitude,
    longitude,
  });
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    latestOnChangeRef.current = onChange;
  }, [onChange]);

  const setMarkerLocation = (leaflet, nextLatitude, nextLongitude) => {
    if (!mapRef.current) {
      return;
    }

    if (!markerRef.current) {
      markerRef.current = leaflet.circleMarker([nextLatitude, nextLongitude], {
        radius: 9,
        color: '#d45480',
        weight: 3,
        fillColor: '#f8b4c8',
        fillOpacity: 0.9,
      }).addTo(mapRef.current);

      return;
    }

    markerRef.current.setLatLng([nextLatitude, nextLongitude]);
  };

  const updateLocation = (nextLatitude, nextLongitude, { recenter = true } = {}) => {
    if (!hasValidCoordinates(nextLatitude, nextLongitude)) {
      return;
    }

    const normalizedLatitude = formatCoordinate(nextLatitude);
    const normalizedLongitude = formatCoordinate(nextLongitude);
    const nextMapsLink = buildMapsLink(normalizedLatitude, normalizedLongitude);

    latestOnChangeRef.current?.({
      latitude: normalizedLatitude,
      longitude: normalizedLongitude,
      mapLink: nextMapsLink,
    });

    if (mapRef.current && leafletRef.current) {
      setMarkerLocation(leafletRef.current, Number.parseFloat(normalizedLatitude), Number.parseFloat(normalizedLongitude));

      if (recenter) {
        mapRef.current.setView(
          [Number.parseFloat(normalizedLatitude), Number.parseFloat(normalizedLongitude)],
          SELECTED_MAP_ZOOM
        );
      }
    }
  };
  updateLocationRef.current = updateLocation;

  useEffect(() => {
    let isActive = true;

    async function initializeMap() {
      if (!mapElementRef.current || mapRef.current) {
        return;
      }

      try {
        const leafletModule = await import('leaflet');
        const leaflet = leafletModule.default;
        leafletRef.current = leaflet;

        const initialCenter = initialLocationRef.current.hasCoordinates
          ? [initialLocationRef.current.latitude, initialLocationRef.current.longitude]
          : [DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude];

        const map = leaflet.map(mapElementRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
        });

        map.setView(
          initialCenter,
          initialLocationRef.current.hasCoordinates ? SELECTED_MAP_ZOOM : DEFAULT_MAP_ZOOM
        );

        leaflet.tileLayer(TILE_LAYER_URL, {
          attribution: TILE_LAYER_ATTRIBUTION,
        }).addTo(map);

        map.on('click', (event) => {
          setMapError('');
          updateLocationRef.current?.(event.latlng.lat, event.latlng.lng);
        });

        mapRef.current = map;

        if (initialLocationRef.current.hasCoordinates) {
          setMarkerLocation(
            leaflet,
            initialLocationRef.current.latitude,
            initialLocationRef.current.longitude
          );
        }

        if (isActive) {
          setIsMapLoading(false);
          requestAnimationFrame(() => map.invalidateSize());
        }
      } catch (error) {
        console.error('Failed to initialize location picker map:', error);

        if (isActive) {
          setMapError('Peta belum bisa dimuat. Coba refresh halaman lalu pilih lokasi lagi.');
          setIsMapLoading(false);
        }
      }
    }

    initializeMap();

    return () => {
      isActive = false;

      if (mapRef.current) {
        mapRef.current.remove();
      }

      mapRef.current = null;
      markerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) {
      return;
    }

    if (!hasCoordinates) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      mapRef.current.setView([DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude], DEFAULT_MAP_ZOOM);
      return;
    }

    setMarkerLocation(leafletRef.current, latitude, longitude);
    mapRef.current.setView([latitude, longitude], SELECTED_MAP_ZOOM);
  }, [hasCoordinates, latitude, longitude]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMapError('Browser ini tidak mendukung geolocation.');
      return;
    }

    setMapError('');
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
        setIsLocating(false);
      },
      () => {
        setMapError('Lokasi perangkat tidak bisa diakses. Pilih titik lokasi langsung di peta.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleResetLocation = () => {
    latestOnChangeRef.current?.({
      latitude: '',
      longitude: '',
      mapLink: '',
    });
    setMapError('');
  };

  return (
    <div className="rounded-2xl border border-pink-200/70 bg-[#fffaf8] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-charcoal/60">{helperText}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-charcoal transition hover:border-pink-default hover:text-pink-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLocating ? 'Mencari lokasi...' : 'Gunakan Lokasi Saya'}
          </button>

          <button
            type="button"
            onClick={handleResetLocation}
            className="rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-charcoal transition hover:border-pink-default hover:text-pink-dark"
          >
            Reset Pin
          </button>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-pink-100 bg-white">
        {isMapLoading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/90 text-sm font-medium text-charcoal/60">
            Memuat peta...
          </div>
        )}

        <div ref={mapElementRef} className="h-80 w-full" />
      </div>

      {mapError && (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mapError}
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-charcoal/45">
            Koordinat
          </p>
          <p className="mt-2 text-sm font-medium text-charcoal">
            {coordinatesText || 'Belum ada titik yang dipilih.'}
          </p>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-charcoal/45">
            Link Maps
          </p>
          {mapsLink ? (
            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-sm font-semibold text-pink-dark hover:underline"
            >
              Buka lokasi di Google Maps
            </a>
          ) : (
            <p className="mt-2 text-sm font-medium text-charcoal/60">
              Pilih titik di peta terlebih dahulu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
