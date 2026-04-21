import { formatPrice } from '@/data/products';
import { createClientRecordId } from '@/lib/record-id';
import {
  buildMapsLink,
  getCoordinatesText,
  getStoredAddress,
} from '@/lib/location';

const CUSTOM_CAKE_SIZE_OPTIONS = [
  {
    value: 'small',
    label: 'Small',
    desc: 'Diameter 14-16 cm',
    servingEstimate: '6-8 porsi',
    basePrice: 175000,
    previewScale: 0.82,
  },
  {
    value: 'medium',
    label: 'Medium',
    desc: 'Diameter 18-20 cm',
    servingEstimate: '10-14 porsi',
    basePrice: 255000,
    previewScale: 0.96,
  },
  {
    value: 'large',
    label: 'Large',
    desc: 'Diameter 22-24 cm',
    servingEstimate: '18-24 porsi',
    basePrice: 355000,
    previewScale: 1.08,
  },
];

const CUSTOM_CAKE_FLAVOR_OPTIONS = [
  { value: 'coklat', label: 'Coklat', note: 'Rich chocolate sponge', previewColor: '#7b4a3b' },
  { value: 'vanilla', label: 'Vanilla', note: 'Soft vanilla butter cake', previewColor: '#f6d8b8' },
  { value: 'red-velvet', label: 'Red Velvet', note: 'Moist red velvet crumb', previewColor: '#c94c64' },
  { value: 'tiramisu', label: 'Tiramisu', note: 'Coffee mascarpone profile', previewColor: '#9d7a63' },
  { value: 'matcha', label: 'Matcha', note: 'Earthy premium matcha', previewColor: '#8fa97e' },
];

const CUSTOM_CAKE_FILLING_OPTIONS = [
  { value: 'vanilla-cream', label: 'Vanilla Cream', priceAdd: 0, note: 'Light and classic' },
  { value: 'choco-ganache', label: 'Choco Ganache', priceAdd: 25000, note: 'Creamy dark chocolate' },
  { value: 'strawberry-jam', label: 'Strawberry Jam', priceAdd: 20000, note: 'Fresh fruity layer' },
  { value: 'cream-cheese', label: 'Cream Cheese', priceAdd: 30000, note: 'Tangy and smooth' },
];

const CUSTOM_CAKE_TOPPING_OPTIONS = [
  { value: 'fresh-fruit', label: 'Fresh Fruit', priceAdd: 35000, note: 'Berry and seasonal fruit' },
  { value: 'buttercream-flower', label: 'Buttercream Flower', priceAdd: 25000, note: 'Soft floral piping' },
  { value: 'fondant-detail', label: 'Fondant Detail', priceAdd: 45000, note: 'Clean sculpted finish' },
  { value: 'sprinkle-party', label: 'Sprinkle Party', priceAdd: 15000, note: 'Colorful cheerful texture' },
];

const CUSTOM_CAKE_DESIGN_STYLE_OPTIONS = [
  { value: 'minimalist', label: 'Minimalist', priceAdd: 0, note: 'Soft clean lines', accentClass: 'from-[#f8d7e5] to-[#fff6ef]' },
  { value: 'character', label: 'Karakter', priceAdd: 60000, note: 'Playful and detailed', accentClass: 'from-[#ffe5b8] to-[#ffd6de]' },
  { value: 'wedding', label: 'Wedding', priceAdd: 80000, note: 'Elegant and formal', accentClass: 'from-[#f5efe6] to-[#f9d7c8]' },
  { value: 'kids-party', label: 'Kids Cake', priceAdd: 45000, note: 'Bright and festive', accentClass: 'from-[#dff3ff] to-[#ffd9ef]' },
  { value: 'custom-unik', label: 'Custom Unik', priceAdd: 70000, note: 'Extra handcrafted details', accentClass: 'from-[#f2e4ff] to-[#ffd7ca]' },
];

const CUSTOM_CAKE_INSPIRATION_CATEGORIES = [
  { value: 'all', label: 'Semua Inspirasi' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'kids-cake', label: 'Kids Cake' },
  { value: 'custom-unik', label: 'Custom Unik' },
];

const CUSTOM_CAKE_INSPIRATIONS = [
  {
    id: 'birthday-bloom',
    name: 'Birthday Bloom',
    category: 'birthday',
    categoryLabel: 'Birthday',
    image: '/images/products/vanilla-garden-bloom.jpeg',
    description: 'Look floral yang lembut untuk ulang tahun intimate dan dinner celebration.',
    suggestedSize: 'medium',
    suggestedFlavor: 'vanilla',
    suggestedFilling: 'vanilla-cream',
    suggestedTopping: 'buttercream-flower',
    suggestedDesignStyle: 'minimalist',
  },
  {
    id: 'wedding-pearl',
    name: 'Wedding Pearl',
    category: 'wedding',
    categoryLabel: 'Wedding',
    image: '/images/products/purple-ombre-pearl.jpeg',
    description: 'Inspirasi cake wedding kecil dengan sentuhan pearl dan gradasi elegan.',
    suggestedSize: 'large',
    suggestedFlavor: 'vanilla',
    suggestedFilling: 'cream-cheese',
    suggestedTopping: 'fondant-detail',
    suggestedDesignStyle: 'wedding',
  },
  {
    id: 'kids-butterfly',
    name: 'Butterfly Party',
    category: 'kids-cake',
    categoryLabel: 'Kids Cake',
    image: '/images/products/pink-butterfly-bliss.jpeg',
    description: 'Warna ceria dan dekor playful untuk pesta ulang tahun anak atau sweet sixteen.',
    suggestedSize: 'medium',
    suggestedFlavor: 'red-velvet',
    suggestedFilling: 'strawberry-jam',
    suggestedTopping: 'sprinkle-party',
    suggestedDesignStyle: 'kids-party',
  },
  {
    id: 'unik-choco-drip',
    name: 'Choco Art Drip',
    category: 'custom-unik',
    categoryLabel: 'Custom Unik',
    image: '/images/products/berry-choco-drip.jpeg',
    description: 'Desain custom bold dengan drip dan buah segar untuk statement celebration.',
    suggestedSize: 'large',
    suggestedFlavor: 'coklat',
    suggestedFilling: 'choco-ganache',
    suggestedTopping: 'fresh-fruit',
    suggestedDesignStyle: 'custom-unik',
  },
];

export const CUSTOM_CAKE_STORAGE_BUCKET = 'custom-cake-designs';
export const CUSTOM_CAKE_WHATSAPP_NUMBER = '6285823458349';
export const customCakeSizeOptions = CUSTOM_CAKE_SIZE_OPTIONS;
export const customCakeFlavorOptions = CUSTOM_CAKE_FLAVOR_OPTIONS;
export const customCakeFillingOptions = CUSTOM_CAKE_FILLING_OPTIONS;
export const customCakeToppingOptions = CUSTOM_CAKE_TOPPING_OPTIONS;
export const customCakeDesignStyleOptions = CUSTOM_CAKE_DESIGN_STYLE_OPTIONS;
export const customCakeInspirationCategories = CUSTOM_CAKE_INSPIRATION_CATEGORIES;
export const customCakeInspirations = CUSTOM_CAKE_INSPIRATIONS;

export function getCustomCakeSizeMeta(value) {
  return CUSTOM_CAKE_SIZE_OPTIONS.find((option) => option.value === value)
    || CUSTOM_CAKE_SIZE_OPTIONS[1];
}

export function getCustomCakeFlavorMeta(value) {
  return CUSTOM_CAKE_FLAVOR_OPTIONS.find((option) => option.value === value)
    || CUSTOM_CAKE_FLAVOR_OPTIONS[0];
}

export function getCustomCakeFillingMeta(value) {
  return CUSTOM_CAKE_FILLING_OPTIONS.find((option) => option.value === value)
    || CUSTOM_CAKE_FILLING_OPTIONS[0];
}

export function getCustomCakeToppingMeta(value) {
  return CUSTOM_CAKE_TOPPING_OPTIONS.find((option) => option.value === value)
    || CUSTOM_CAKE_TOPPING_OPTIONS[0];
}

export function getCustomCakeDesignStyleMeta(value) {
  return CUSTOM_CAKE_DESIGN_STYLE_OPTIONS.find((option) => option.value === value)
    || CUSTOM_CAKE_DESIGN_STYLE_OPTIONS[0];
}

export function getCustomCakeInspirationCategoryMeta(value) {
  return CUSTOM_CAKE_INSPIRATION_CATEGORIES.find((option) => option.value === value)
    || CUSTOM_CAKE_INSPIRATION_CATEGORIES[0];
}

export function getCustomCakeInspirationMeta(value) {
  return CUSTOM_CAKE_INSPIRATIONS.find((item) => item.id === value) || null;
}

export function calculateCustomCakePrice(formData) {
  const sizeMeta = getCustomCakeSizeMeta(formData.size);
  const fillingMeta = getCustomCakeFillingMeta(formData.filling);
  const toppingMeta = getCustomCakeToppingMeta(formData.topping);
  const designMeta = getCustomCakeDesignStyleMeta(formData.designStyle);
  const messageSurcharge = formData.cakeMessage.trim() ? 15000 : 0;

  return sizeMeta.basePrice
    + fillingMeta.priceAdd
    + toppingMeta.priceAdd
    + designMeta.priceAdd
    + messageSurcharge;
}

export function getCustomCakePreviewTheme(formData) {
  const flavorMeta = getCustomCakeFlavorMeta(formData.flavor);
  const designMeta = getCustomCakeDesignStyleMeta(formData.designStyle);
  const sizeMeta = getCustomCakeSizeMeta(formData.size);

  return {
    cakeColor: flavorMeta.previewColor,
    accentClass: designMeta.accentClass,
    scale: sizeMeta.previewScale,
  };
}

export function buildCustomCakeMessage(formData, designImageUrl, { forDiscussion = false } = {}) {
  const sizeMeta = getCustomCakeSizeMeta(formData.size);
  const flavorMeta = getCustomCakeFlavorMeta(formData.flavor);
  const fillingMeta = getCustomCakeFillingMeta(formData.filling);
  const toppingMeta = getCustomCakeToppingMeta(formData.topping);
  const designMeta = getCustomCakeDesignStyleMeta(formData.designStyle);
  const inspirationMeta = getCustomCakeInspirationMeta(formData.inspirationId);
  const estimatedPrice = calculateCustomCakePrice(formData);
  const imageLine = designImageUrl ? `Referensi gambar: ${designImageUrl}` : '';
  const coordinatesText = getCoordinatesText(formData.locationLat, formData.locationLng);
  const mapsLink = formData.locationLink || buildMapsLink(formData.locationLat, formData.locationLng);
  const locationLines = [
    formData.address ? `Alamat: ${formData.address}` : '',
    coordinatesText ? `Koordinat: ${coordinatesText}` : '',
    mapsLink ? `Link Maps: ${mapsLink}` : '',
  ].filter(Boolean);

  return [
    'Halo Sweet Celebration Cake!',
    '',
    forDiscussion ? 'Saya ingin diskusi lebih lanjut untuk custom cake ini:' : 'Saya ingin checkout custom cake ini:',
    '',
    `Nama: ${formData.name}`,
    `Email: ${formData.email}`,
    `No. WhatsApp: ${formData.whatsapp}`,
    ...locationLines,
    `Ukuran: ${sizeMeta.label} (${sizeMeta.servingEstimate})`,
    `Rasa: ${flavorMeta.label}`,
    `Filling: ${fillingMeta.label}`,
    `Topping: ${toppingMeta.label}`,
    `Desain: ${designMeta.label}`,
    inspirationMeta ? `Inspirasi: ${inspirationMeta.name} (${inspirationMeta.categoryLabel})` : '',
    formData.cakeMessage.trim() ? `Tulisan di kue: ${formData.cakeMessage.trim()}` : '',
    `Estimasi harga: ${formatPrice(estimatedPrice)}`,
    imageLine,
    `Catatan tambahan: ${formData.notes || '-'}`,
    '',
    forDiscussion ? 'Boleh bantu diskusikan revisi atau detail lanjutannya ya?' : 'Mohon diproses ya. Terima kasih.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildCustomCakeDiscussionUrl(formData, designImageUrl) {
  const message = buildCustomCakeMessage(formData, designImageUrl, { forDiscussion: true });
  return `https://wa.me/${CUSTOM_CAKE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildCustomCakePayload({ formData, designFile, designImagePath, designImageUrl }) {
  const sizeMeta = getCustomCakeSizeMeta(formData.size);
  const flavorMeta = getCustomCakeFlavorMeta(formData.flavor);
  const fillingMeta = getCustomCakeFillingMeta(formData.filling);
  const toppingMeta = getCustomCakeToppingMeta(formData.topping);
  const designMeta = getCustomCakeDesignStyleMeta(formData.designStyle);
  const inspirationMeta = getCustomCakeInspirationMeta(formData.inspirationId);
  const mapsLink = formData.locationLink || buildMapsLink(formData.locationLat, formData.locationLng);
  const estimatedPrice = calculateCustomCakePrice(formData);

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
    serving_estimate: sizeMeta.servingEstimate,
    filling_value: formData.filling,
    filling_label: fillingMeta.label,
    topping_value: formData.topping,
    topping_label: toppingMeta.label,
    design_style_value: formData.designStyle,
    design_style_label: designMeta.label,
    cake_message: formData.cakeMessage.trim() || null,
    estimated_price: estimatedPrice,
    inspiration_category_value: inspirationMeta?.category || null,
    inspiration_category_label: inspirationMeta?.categoryLabel || null,
    inspiration_name: inspirationMeta?.name || null,
    customer_notes: formData.notes || null,
    design_image_path: designImagePath || null,
    design_image_url: designImageUrl || null,
    design_image_name: designFile?.name || null,
    design_image_mime_type: designFile?.type || null,
    design_image_size_bytes: designFile?.size || null,
    whatsapp_message: buildCustomCakeMessage(formData, designImageUrl),
    request_channel: 'website-builder',
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
