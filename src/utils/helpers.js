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
 * Formats a number or digit string with thousand separator dots.
 * Example: "65000" -> "65.000", 1500000 -> "1.500.000"
 */
export function formatNumberDots(val) {
  if (val === null || val === undefined || val === '') return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parses a dotted number string into a clean numeric integer.
 * Example: "65.000" -> 65000
 */
export function parseNumberDots(val) {
  if (val === null || val === undefined || val === '') return 0;
  const digits = String(val).replace(/\D/g, '');
  return digits ? Number(digits) : 0;
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
export function getWhatsAppUrl(productOrCustomText = '') {
  const phone = '628990809822';
  let message = `Halo Admin Kaos Dilio, saya ingin konsultasi pemesanan kaos polos / custom sablon.`;

  if (productOrCustomText) {
    if (typeof productOrCustomText === 'object') {
      const p = productOrCustomText;
      const poText = p.is_preorder
        ? ` [PRE-ORDER: ${p.preorder_duration || '7-14 Hari'}]`
        : '';
      message = `Halo Admin Kaos Dilio, saya tertarik dan ingin pesan produk: ${p.name}${poText} (${formatRupiah(p.price)}). Apakah masih tersedia?`;
    } else if (productOrCustomText.startsWith('Halo')) {
      message = productOrCustomText;
    } else {
      message = `Halo Admin Kaos Dilio, saya tertarik dan ingin konsultasi/pesan produk: ${productOrCustomText}. Apakah masih tersedia?`;
    }
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Standard Shopee-style color palette for fallback
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
  { id: 'coklat', name: 'Coklat / Cream', hex: '#A16207', isLight: false },
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

export function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

export function isColorLight(hex) {
  const [r, g, b] = hexToRgb(hex);
  // HSP formula for perceived brightness
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return hsp > 175;
}

export function getClosestColorId(hex) {
  const hexStr = typeof hex === 'string' ? hex : (hex?.hex || String(hex || ''));
  if (!hexStr || typeof hexStr !== 'string') return 'hitam';
  const lower = hexStr.trim().toLowerCase();
  const baseMatch = BASE_COLORS.find((c) => c.id === lower);
  if (baseMatch) return baseMatch.id;
  if (!hexStr.startsWith('#')) return 'hitam';

  const upper = hexStr.trim().toUpperCase();
  if (['#000000', '#111827', '#020617', '#18181B', '#1F2937'].includes(upper)) return 'hitam';
  if (['#FFFFFF', '#F8FAFC', '#F9FAFB', '#F1F5F9', '#FAFAFA', '#F3F4F6'].includes(upper)) return 'putih';
  if (['#0B132B', '#0F172A', '#1E293B', '#1E3A8A', '#172554'].includes(upper)) return 'navy';
  if (['#64748B', '#94A3B8', '#334155', '#475569', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'].includes(upper)) return 'abu';
  if (['#2563EB', '#3B82F6', '#60A5FA', '#1D4ED8', '#1E40AF', '#0284C7', '#0EA5E9', '#38BDF8'].includes(upper)) return 'biru';
  if (['#15803D', '#10B981', '#16A34A', '#22C55E', '#9CAF88', '#464B35', '#1E3A2F', '#1E824C', '#84CC16', '#A7F3D0', '#4D7C0F', '#065F46'].includes(upper)) return 'hijau';
  if (['#DC2626', '#EF4444', '#B91C1C', '#991B1B', '#7F1D1D', '#581825', '#C51D24'].includes(upper)) return 'merah';
  if (['#FACC15', '#F59E0B', '#EAB308', '#FBBF24', '#FEF08A', '#D99426'].includes(upper)) return 'kuning';
  if (
    [
      '#C2410C',
      '#78350F',
      '#A16207',
      '#3A2A22',
      '#D5C3A5',
      '#9A3412',
      '#B45309',
      '#F5F5DC',
      '#FFF8DC',
      '#FAF0E6',
      '#EDE8D0',
      '#FFFFF0',
      '#FDF5E6',
      '#F8F4E6',
      '#F5F0E1',
      '#EFECE6',
      '#EAE0C8',
      '#E8E4C9',
      '#F3E5AB',
      '#DFD3C3',
    ].includes(upper)
  )
    return 'coklat';

  const [r, g, b] = hexToRgb(hexStr);
  const [h, s, l] = rgbToHsl(r, g, b);

  if (l <= 14) return 'hitam';
  // Warm cream / ivory / beige tones (yellow-orange hue with noticeable warmth) belong to Coklat / Cream, not Putih
  if (h >= 18 && h <= 65 && s >= 6 && l >= 75 && l < 98) return 'coklat';
  if (l >= 93 && s <= 15) return 'putih';
  if (s <= 10) return l > 86 ? 'putih' : l < 20 ? 'hitam' : 'abu';

  if (h >= 70 && h <= 168) return 'hijau';
  if (h > 168 && h <= 255) return l < 28 ? 'navy' : 'biru';
  if (h >= 45 && h < 70) return l < 45 ? 'coklat' : 'kuning';
  if (h >= 15 && h < 45) return 'coklat';
  return 'merah';
}

export const COLOR_DICTIONARY = {
  '#000000': 'Hitam',
  '#111827': 'Hitam',
  '#18181B': 'Hitam',
  '#020617': 'Hitam',
  '#FFFFFF': 'Putih',
  '#9CAF88': 'Hijau',
  '#15803D': 'Hijau',
  '#16A34A': 'Hijau',
  '#10B981': 'Hijau',
  '#22C55E': 'Hijau',
  '#2563EB': 'Biru',
  '#1E3A8A': 'Navy',
  '#1E40AF': 'Biru',
  '#1D4ED8': 'Biru',
  '#3B82F6': 'Biru',
  '#1E293B': 'Navy',
  '#0F172A': 'Navy',
  '#0B132B': 'Navy',
  '#DC2626': 'Merah',
  '#EF4444': 'Merah',
  '#B91C1C': 'Merah',
  '#C2410C': 'Coklat',
  '#FACC15': 'Kuning',
  '#F59E0B': 'Kuning',
  '#EAB308': 'Kuning',
  '#94A3B8': 'Abu-Abu',
  '#64748B': 'Abu-Abu',
  '#475569': 'Abu-Abu',
  '#334155': 'Abu-Abu',
  '#374151': 'Abu-Abu',
  '#7F95A8': 'Abu-Abu',
  '#CDD9E5': 'Biru',
  '#D5DFEA': 'Biru',
  '#E5E7EB': 'Abu-Abu',
  '#F3F4F6': 'Putih',
  '#5B21B6': 'Ungu',
  '#8B5CF6': 'Ungu',
  '#EC4899': 'Pink',
  '#F97316': 'Oranye',
  '#78350F': 'Coklat',
  '#A16207': 'Coklat',
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
 * Returns color filter groups (Hitam, Putih, Navy, Abu-Abu, Biru, Hijau, Merah, Kuning, Coklat / Cream)
 * plus any dynamic custom colors inputted in products that fall outside the base families.
 */
export function extractUniqueColorsFromProducts(products = []) {
  if (!Array.isArray(products) || products.length === 0) return BASE_COLORS;

  const baseIds = new Set(BASE_COLORS.map((b) => b.id));
  const seenCustomHexes = new Set();
  const customColors = [];

  products.forEach((p) => {
    const pColors = safeColors(p?.colors);
    const hexList = pColors.length > 0 ? pColors : p?.color_hex ? [p.color_hex] : [];
    hexList.forEach((hex) => {
      if (!hex || typeof hex !== 'string') return;
      const upper = hex.trim().toUpperCase();
      const familyId = getClosestColorId(hex);
      if (!baseIds.has(familyId) && !seenCustomHexes.has(upper)) {
        seenCustomHexes.add(upper);
        customColors.push({
          id: upper,
          name: getColorName(hex) || upper,
          hex: upper,
          isLight: isColorLight(hex),
        });
      }
    });
  });

  return [...BASE_COLORS, ...customColors];
}

/**
 * Normalizes cutting_type / kategori kaos:
 * oversized, regular, fitted, boxy, long-sleeve, kasual, polo, olahraga
 */
export function normalizeCutting(cut) {
  if (!cut) return 'regular';
  const s = String(cut).toLowerCase().trim();
  if (s === 'kasual' || s === 'casual') return 'kasual';
  if (s === 'polo' || s === 'kaos polo' || s === 'kerah') return 'polo';
  if (s === 'olahraga' || s === 'sport' || s === 'jersey') return 'olahraga';
  if (s === 'oversize' || s === 'oversized') return 'oversized';
  if (s === 'reguler' || s === 'regular') return 'regular';
  if (s === 'fitted') return 'fitted';
  if (s === 'boxy' || s === 'boxy cut' || s === 'boxy crop') return 'boxy';
  if (s === 'long sleeve' || s === 'long-sleeve' || s === 'long_sleeve' || s === 'longsleeve') return 'long-sleeve';
  return s;
}

/**
 * Keeps 1 card per product without appending color names ("- Merah Cabe", "- Hijau Botol")
 * or splitting a single product into duplicate cards.
 */
export function flattenProductsByColor(products) {
  if (!Array.isArray(products)) return [];

  return products
    .filter(Boolean)
    .map((product) => {
      const rawColors = safeColors(product.colors);
      const colors = rawColors.length > 0 ? rawColors : ['#000000'];
      const primaryHex = typeof colors[0] === 'string' ? colors[0] : '#000000';

      const images =
        Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : product.image_url
          ? [product.image_url]
          : [];

      return {
        ...product,
        id: product.id,
        parent_id: product.id,
        is_variant: false,
        images,
        image_url: images[0] || product.image_url || '',
        colors,
        color_hex: primaryHex,
        color_name: getColorName(primaryHex),
      };
    });
}
