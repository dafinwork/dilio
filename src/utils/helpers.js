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
 * Standard Indonesian color name dictionary for common hex codes
 */
export const COLOR_DICTIONARY = {
  '#000000': 'Hitam',
  '#FFFFFF': 'Putih',
  '#15803D': 'Hijau Botol',
  '#16A34A': 'Hijau Daun',
  '#10B981': 'Emerald Green',
  '#2563EB': 'Biru Royal',
  '#1E40AF': 'Biru Benhur',
  '#1E293B': 'Navy / Dark Slate',
  '#0F172A': 'Midnight Navy',
  '#020617': 'Deep Black Navy',
  '#DC2626': 'Merah Cabe',
  '#B91C1C': 'Merah Maroon',
  '#FACC15': 'Kuning Kenari',
  '#F59E0B': 'Kuning Mustard',
  '#94A3B8': 'Abu Muda / Misty',
  '#64748B': 'Abu Tua / Charcoal',
  '#475569': 'Slate Grey',
  '#E5E7EB': 'Soft Lilac Grey',
  '#F3F4F6': 'Warm Cream White',
  '#7F95A8': 'Vintage Washed Slate',
  '#D5DFEA': 'Ice Denim Blue',
  '#D8B4FE': 'Lilac Purple',
  '#A16207': 'Cokelat Karamel',
  '#78350F': 'Cokelat Kopi',
};

export function getColorName(hex) {
  if (!hex) return 'Warna';
  const cleanHex = hex.trim().toUpperCase();
  for (const [key, name] of Object.entries(COLOR_DICTIONARY)) {
    if (key.toUpperCase() === cleanHex) return name;
  }
  return cleanHex;
}

/**
 * Ensures colors is always a valid array of { hex, name } objects.
 */
export function safeColors(colors) {
  let list = [];
  if (Array.isArray(colors)) {
    list = colors;
  } else if (typeof colors === 'string') {
    try {
      const parsed = JSON.parse(colors);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [];
    }
  }

  if (list.length === 0) {
    return [{ hex: '#000000', name: 'Hitam' }];
  }

  return list.map((c) => {
    if (typeof c === 'string') {
      return { hex: c, name: getColorName(c) };
    }
    if (c && typeof c === 'object') {
      const hex = c.hex || '#000000';
      return { hex, name: c.name || getColorName(hex) };
    }
    return { hex: '#000000', name: 'Hitam' };
  });
}

/**
 * Gets the primary color object { hex, name } of a product.
 */
export function getPrimaryColor(product) {
  if (!product) return { hex: '#000000', name: 'Hitam' };
  const list = safeColors(product.colors);
  return list[0] || { hex: product.color_hex || '#000000', name: product.color_name || 'Hitam' };
}

/**
 * Transforms products into 1 card per color variant (PRD Section 4: 1 varian warna = 1 kartu).
 * If a product has 3 colors, it expands into 3 distinct items for the catalog.
 */
export function flattenProductsByColor(products) {
  if (!Array.isArray(products)) return [];

  const result = [];
  products.forEach((product) => {
    const colors = safeColors(product.colors);

    // If product only has 1 color (or default), keep it as is
    if (colors.length <= 1) {
      const primaryColor = colors[0] || { hex: '#000000', name: 'Hitam' };
      result.push({
        ...product,
        primary_color: primaryColor,
        variant_name: product.name,
      });
      return;
    }

    // If product has multiple colors from old data, explode into 1 card per color variant
    colors.forEach((c, idx) => {
      const cleanHex = c.hex.replace('#', '').toLowerCase();
      result.push({
        ...product,
        id: `${product.id}-${cleanHex || idx}`,
        parent_id: product.id,
        name: `${product.name} - ${c.name}`,
        variant_name: `${product.name} - ${c.name}`,
        primary_color: c,
        colors: [c],
        extra_colors_count: 0,
      });
    });
  });

  return result;
}

/**
 * Standard cutting list according to PRD Section 5.1
 */
export const CUTTING_OPTIONS = [
  { id: 'all', label: 'Semua Cutting' },
  { id: 'regular', label: 'Regular Fit', matchKeys: ['regular', 'reguler'] },
  { id: 'oversize', label: 'Oversized Fit', matchKeys: ['oversize', 'oversized'] },
  { id: 'boxy', label: 'Boxy Cut', matchKeys: ['boxy'] },
  { id: 'long-sleeve', label: 'Long Sleeve', matchKeys: ['long-sleeve', 'longsleeve'] },
  { id: 'fitted', label: 'Fitted', matchKeys: ['fitted'] },
];

/**
 * Normalizes cutting_type to a standard key
 */
export function normalizeCutting(cuttingType) {
  if (!cuttingType) return 'regular';
  const val = String(cuttingType).toLowerCase().trim();
  for (const opt of CUTTING_OPTIONS) {
    if (opt.matchKeys && opt.matchKeys.includes(val)) {
      return opt.id;
    }
  }
  return val;
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
