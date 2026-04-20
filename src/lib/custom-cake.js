import { createClientRecordId } from '@/lib/record-id';
import {
  buildMapsLink,
  getCoordinatesText,
  getStoredAddress,
} from '@/lib/location';

const CUSTOM_CAKE_SIZE_OPTIONS = [
  { value: '16cm', label: '16 cm', desc: '4-6 porsi' },
  { value: '20cm', label: '20 cm', desc: '8-10 porsi' },
  { value: '24cm', label: '24 cm', desc: '12-15 porsi' },
];

const CUSTOM_CAKE_FLAVOR_OPTIONS = [
  { value: 'coklat', label: 'Coklat', icon: '🍫' },
  { value: 'vanilla', label: 'Vanilla', icon: '🍦' },
  { value: 'red-velvet', label: 'Red Velvet', icon: '❤️' },
  { value: 'tiramisu', label: 'Tiramisu', icon: '☕' },
];

export const CUSTOM_CAKE_STORAGE_BUCKET = 'custom-cake-designs';
export const CUSTOM_CAKE_WHATSAPP_NUMBER = '6285823458349';
export const customCakeSizeOptions = CUSTOM_CAKE_SIZE_OPTIONS;
export const customCakeFlavorOptions = CUSTOM_CAKE_FLAVOR_OPTIONS;

export function getCustomCakeFlavorMeta(value) {
  return CUSTOM_CAKE_FLAVOR_OPTIONS.find((option) => option.value === value)
    || CUSTOM_CAKE_FLAVOR_OPTIONS[0];
}

export function getCustomCakeSizeMeta(value) {
  return CUSTOM_CAKE_SIZE_OPTIONS.find((option) => option.value === value)
    || CUSTOM_CAKE_SIZE_OPTIONS[0];
}

export function buildCustomCakeMessage(formData, designImageUrl) {
  const flavorMeta = getCustomCakeFlavorMeta(formData.flavor);
  const sizeMeta = getCustomCakeSizeMeta(formData.size);
  const imageLine = designImageUrl ? `Gambar referensi: ${designImageUrl}\n` : '';
  const coordinatesText = getCoordinatesText(formData.locationLat, formData.locationLng);
  const mapsLink = formData.locationLink || buildMapsLink(formData.locationLat, formData.locationLng);
  const locationLines = [
    formData.address ? `Detail alamat: ${formData.address}` : '',
    coordinatesText ? `Koordinat: ${coordinatesText}` : '',
    mapsLink ? `Link Maps: ${mapsLink}` : '',
  ].filter(Boolean);

  return [
    'Halo Sweet Celebration Cake!',
    '',
    'Saya ingin memesan custom cake:',
    '',
    `Nama: ${formData.name}`,
    `Email: ${formData.email}`,
    `No. WhatsApp: ${formData.whatsapp}`,
    ...locationLines,
    `Rasa: ${flavorMeta.label}`,
    `Ukuran: ${sizeMeta.label}`,
    `Estimasi porsi: ${sizeMeta.desc}`,
    `${imageLine}Catatan: ${formData.notes || '-'}`,
    '',
    'Mohon diproses ya. Terima kasih.',
  ].join('\n');
}

export function buildCustomCakePayload({ formData, designFile, designImagePath, designImageUrl }) {
  const flavorMeta = getCustomCakeFlavorMeta(formData.flavor);
  const sizeMeta = getCustomCakeSizeMeta(formData.size);
  const mapsLink = formData.locationLink || buildMapsLink(formData.locationLat, formData.locationLng);

  return {
    customer_name: formData.name,
    customer_email: formData.email,
    customer_phone: formData.whatsapp,
    customer_address: getStoredAddress(formData.address, formData.locationLat, formData.locationLng),
    customer_location_lat: Number.parseFloat(formData.locationLat),
    customer_location_lng: Number.parseFloat(formData.locationLng),
    customer_location_link: mapsLink || null,
    flavor: formData.flavor,
    flavor_label: flavorMeta.label,
    size_value: formData.size,
    size_label: sizeMeta.label,
    serving_estimate: sizeMeta.desc,
    customer_notes: formData.notes || null,
    design_image_path: designImagePath || null,
    design_image_url: designImageUrl || null,
    design_image_name: designFile?.name || null,
    design_image_mime_type: designFile?.type || null,
    design_image_size_bytes: designFile?.size || null,
    whatsapp_message: buildCustomCakeMessage(formData, designImageUrl),
    request_channel: 'website',
    status: 'baru',
  };
}

export function createCustomCakeStoragePath(file, uniqueId = createClientRecordId()) {
  const safeExtension = file.name.includes('.')
    ? file.name.split('.').pop()?.toLowerCase()
    : 'jpg';

  const extension = safeExtension || 'jpg';

  return `website/${new Date().toISOString().slice(0, 10)}/${uniqueId}.${extension}`;
}
