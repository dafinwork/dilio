/**
 * Formats a number or numeric string to Indonesian Rupiah currency format.
 * Example: 65000 -> "Rp 65.000"
 */
export function formatRupiah(number) {
  const num = Number(number);
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Ensures colors is always a valid array of hex color strings.
 */
export function safeColors(colors) {
  let list = [];
  if (Array.isArray(colors)) {
    list = colors;
  } else if (typeof colors === 'string') {
    try {
      const parsed = JSON.parse(colors);
      if (Array.isArray(parsed)) list = parsed;
      else if (typeof parsed === 'string') list = [parsed];
    } catch {
      if (colors.startsWith('#')) list = [colors];
      else list = [];
    }
  }

  return list
    .map((c) => {
      if (typeof c === 'string') return c.trim();
      if (c && typeof c === 'object' && c.hex) return String(c.hex).trim();
      return '';
    })
    .filter((c) => typeof c === 'string' && c.startsWith('#'));
}

/**
 * Generates WhatsApp click-to-chat URL with predefined consultation message.
 */
export function getWhatsAppUrl(productName = '') {
  const phone = '628990809822';
  const message = productName
    ? `Halo Admin Kaos Dilio, saya tertarik dan ingin konsultasi/pesan produk: ${productName}. Apakah masih tersedia?`
    : `Halo Admin Kaos Dilio, saya ingin konsultasi pemesanan kaos polos / custom sablon.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Standard Shopee-style color palette for catalog filtering
 */
export const BASE_COLORS = [
  { id: 'hitam', name: 'Hitam', hex: '#000000', isLight: false },
  { id: 'putih', name: 'Putih', hex: '#FFFFFF', isLight: true },
  { id: 'navy', name: 'Navy', hex: '#0B132B', isLight: false },
  { id: 'abu', name: 'Abu-Abu', hex: '#64748B', isLight: false },
  { id: 'biru', name: 'Biru', hex: '#2563EB', isLight: false },
  { id: 'hijau', name: 'Hijau', hex: '#15803D', isLight: false },
  { id: 'merah', name: 'Merah', hex: '#DC2626', isLight: false },
  { id: 'kuning', name: 'Kuning', hex: '#FACC15', isLight: true },
];

export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [0, 0, 0];
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  if (clean.length >= 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return [0, 0, 0];
}

export function getClosestColorId(hex) {
  const hexStr = typeof hex === 'string' ? hex : (hex?.hex || String(hex || ''));
  if (!hexStr || typeof hexStr !== 'string' || !hexStr.startsWith('#')) return 'hitam';
  const upper = hexStr.trim().toUpperCase();
  if (['#000000', '#111827', '#020617', '#0F172A', '#18181B'].includes(upper)) return 'hitam';
  if (['#FFFFFF', '#F8FAFC', '#F9FAFB', '#F1F5F9', '#FAFAFA'].includes(upper)) return 'putih';
  if (['#0B132B', '#1E293B', '#1E40AF', '#1D4ED8'].includes(upper)) return 'navy';
  if (['#64748B', '#94A3B8', '#334155', '#475569'].includes(upper)) return 'abu';
  if (['#2563EB', '#3B82F6', '#60A5FA'].includes(upper)) return 'biru';
  if (['#15803D', '#10B981', '#16A34A', '#22C55E'].includes(upper)) return 'hijau';
  if (['#DC2626', '#EF4444', '#B91C1C'].includes(upper)) return 'merah';
  if (['#FACC15', '#F59E0B', '#EAB308', '#FBBF24'].includes(upper)) return 'kuning';

  const [r, g, b] = hexToRgb(hexStr);
  let minD = Infinity;
  let closestId = 'hitam';
  for (const c of BASE_COLORS) {
    const [cr, cg, cb] = hexToRgb(c.hex);
    const dist = Math.pow(r - cr, 2) + Math.pow(g - cg, 2) + Math.pow(b - cb, 2);
    if (dist < minD) {
      minD = dist;
      closestId = c.id;
    }
  }
  return closestId;
}

export const COLOR_DICTIONARY = {
  '#000000': 'Hitam',
  '#FFFFFF': 'Putih',
  '#15803D': 'Hijau Botol',
  '#16A34A': 'Hijau Daun',
  '#10B981': 'Emerald Green',
  '#2563EB': 'Biru Royal',
  '#1E40AF': 'Biru Benhur',
  '#1E293B': 'Navy',
  '#0F172A': 'Midnight Navy',
  '#020617': 'Deep Black',
  '#DC2626': 'Merah Cabe',
  '#B91C1C': 'Merah Maroon',
  '#FACC15': 'Kuning Kenari',
  '#F59E0B': 'Kuning Mustard',
  '#94A3B8': 'Abu Misty',
  '#64748B': 'Abu-Abu',
  '#475569': 'Slate Grey',
  '#0B132B': 'Navy Dark',
};

export function getColorName(hex) {
  if (!hex) return 'Warna';
  const hexStr = typeof hex === 'string' ? hex : (hex?.hex || String(hex || ''));
  const cleanHex = hexStr.trim().toUpperCase();
  for (const [key, name] of Object.entries(COLOR_DICTIONARY)) {
    if (key.toUpperCase() === cleanHex) return name;
  }
  const closestId = getClosestColorId(hexStr);
  const found = BASE_COLORS.find((c) => c.id === closestId);
  return found ? found.name : cleanHex;
}

/**
 * Normalizes cutting_type to 5 standard cuts:
 * oversized, regular, fitted, boxy, long-sleeve
 */
export function normalizeCutting(cut) {
  if (!cut) return 'regular';
  const s = String(cut).toLowerCase().trim();
  if (s === 'oversize' || s === 'oversized') return 'oversized';
  if (s === 'reguler' || s === 'regular') return 'regular';
  if (s === 'fitted') return 'fitted';
  if (s === 'boxy' || s === 'boxy cut' || s === 'boxy crop') return 'boxy';
  if (s === 'long sleeve' || s === 'long-sleeve' || s === 'longsleeve') return 'long-sleeve';
  return s;
}

/**
 * Explodes products into 1 card per color variant so each card represents 1 color
 * (Membuat setiap gambar/katalog dijadikan 1 warna saja agar katalog terlihat banyak).
 */
export function flattenProductsByColor(products) {
  if (!Array.isArray(products)) return [];

  const result = [];
  products.forEach((product) => {
    if (!product) return;
    const rawColors = safeColors(product.colors);
    const colors = rawColors.length > 0 ? rawColors : ['#000000'];

    // If product only has 1 color, keep 1 card
    if (colors.length <= 1) {
      const primaryHex = typeof colors[0] === 'string' ? colors[0] : '#000000';
      result.push({
        ...product,
        id: product.id,
        parent_id: product.id,
        is_variant: false,
        colors: [primaryHex],
        color_hex: primaryHex,
        color_name: getColorName(primaryHex),
        extra_colors_count: 0,
      });
      return;
    }

    // If product has multiple colors, explode into 1 separate card per color variant
    colors.forEach((hex, idx) => {
      const hexStr = typeof hex === 'string' ? hex : '#000000';
      const colorName = getColorName(hexStr);
      const cleanHex = hexStr.replace('#', '').toLowerCase();
      result.push({
        ...product,
        id: `${product.id}-${cleanHex || idx}`,
        parent_id: product.id,
        is_variant: true,
        variant_index: idx,
        name: `${product.name} - ${colorName}`,
        colors: [hexStr],
        color_hex: hexStr,
        color_name: colorName,
        extra_colors_count: 0,
      });
    });
  });

  return result;
}


