import { formatPrice } from '@/data/products';
import {
  buildMapsLink,
  getCoordinatesText,
  getStoredAddress,
} from '@/lib/location';

export function normalizeUsername(value = '') {
  return value.trim().toLowerCase();
}

export function countOrderQuantity(items = []) {
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
}

export function serializeOrderItems(items = []) {
  return items.map((item) => ({
    product_id: item.id,
    name: item.name,
    image: item.image,
    unit_price: item.price,
    base_price: item.basePrice ?? item.price,
    size_label: item.sizeLabel,
    size_price: item.sizePrice ?? 0,
    quantity: item.quantity,
    line_total: item.price * item.quantity,
  }));
}

export function formatOrderLineItems(items = []) {
  return items
    .map((item, index) => {
      const lineTotal = item.price * item.quantity;
      return `${index + 1}. ${item.name} (${item.sizeLabel}) x${item.quantity} - ${formatPrice(lineTotal)}`;
    })
    .join('\n');
}

export function buildWhatsAppMessage(customer, items, total) {
  const coordinatesText = getCoordinatesText(customer.locationLat, customer.locationLng);
  const mapsLink = customer.locationLink || buildMapsLink(customer.locationLat, customer.locationLng);
  const locationLines = [
    customer.address ? `Alamat: ${customer.address}` : '',
    coordinatesText ? `Koordinat: ${coordinatesText}` : '',
    mapsLink ? `Link Maps: ${mapsLink}` : '',
    customer.notes ? `Catatan: ${customer.notes}` : '',
  ].filter(Boolean);

  return [
    'Halo Sweet Celebration Cake!',
    '',
    'Saya ingin memesan:',
    '',
    `Nama: ${customer.name}`,
    `Email: ${customer.email}`,
    `No. HP: ${customer.phone}`,
    ...locationLines,
    'Pesanan:',
    formatOrderLineItems(items),
    '',
    `Total: ${formatPrice(total)}`,
    '',
    'Mohon diproses ya. Terima kasih.',
  ].join('\n');
}

export function buildOrderPayload({ customer, items, total }) {
  const mapsLink = customer.locationLink || buildMapsLink(customer.locationLat, customer.locationLng);

  return {
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone,
    customer_address: getStoredAddress(customer.address, customer.locationLat, customer.locationLng),
    customer_location_lat: Number.parseFloat(customer.locationLat),
    customer_location_lng: Number.parseFloat(customer.locationLng),
    customer_location_link: mapsLink || null,
    customer_notes: customer.notes || null,
    items: serializeOrderItems(items),
    item_count: countOrderQuantity(items),
    total_amount: total,
    whatsapp_message: buildWhatsAppMessage(customer, items, total),
    order_channel: 'website',
    status: 'baru',
  };
}

export function formatOrderDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatOrderCode(value = '') {
  if (!value) {
    return 'ORD';
  }

  return `ORD-${String(value).slice(0, 8).toUpperCase()}`;
}
