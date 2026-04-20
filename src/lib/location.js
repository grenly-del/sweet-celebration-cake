export const DEFAULT_MAP_CENTER = {
  latitude: -2.548926,
  longitude: 118.0148634,
};

export const DEFAULT_MAP_ZOOM = 5;
export const SELECTED_MAP_ZOOM = 16;

export function toCoordinateNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value !== 'string') {
    return NaN;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return NaN;
  }

  const normalizedValue = trimmedValue.replace(',', '.');
  const parsedValue = Number.parseFloat(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : NaN;
}

export function hasValidCoordinates(latitude, longitude) {
  const latitudeNumber = toCoordinateNumber(latitude);
  const longitudeNumber = toCoordinateNumber(longitude);

  return Number.isFinite(latitudeNumber)
    && Number.isFinite(longitudeNumber)
    && latitudeNumber >= -90
    && latitudeNumber <= 90
    && longitudeNumber >= -180
    && longitudeNumber <= 180;
}

export function formatCoordinate(value) {
  const coordinateNumber = toCoordinateNumber(value);

  if (!Number.isFinite(coordinateNumber)) {
    return '';
  }

  return coordinateNumber.toFixed(6);
}

export function getCoordinatesText(latitude, longitude) {
  if (!hasValidCoordinates(latitude, longitude)) {
    return '';
  }

  return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
}

export function buildMapsLink(latitude, longitude) {
  const coordinatesText = getCoordinatesText(latitude, longitude);

  if (!coordinatesText) {
    return '';
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinatesText)}`;
}

export function getStoredAddress(addressDetail = '', latitude, longitude) {
  const trimmedAddress = addressDetail.trim();

  if (trimmedAddress) {
    return trimmedAddress;
  }

  const coordinatesText = getCoordinatesText(latitude, longitude);

  if (!coordinatesText) {
    return 'Dipilih via Maps';
  }

  return `Dipilih via Maps (${coordinatesText})`;
}
