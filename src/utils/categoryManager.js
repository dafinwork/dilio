/**
 * Category, Cutting, Material, and Exclusive Category Manager
 * Centralizes defaults, persistence, and synchronization with products
 */

export const DEFAULT_MATERIALS = [
  'Heavyweight 16s',
  'Cotton Combed 24s',
  'Cotton Combed 20s',
  'Cotton Combed 30s',
  'Washed Cotton 20s',
  'Pique Cotton (Polo)',
  'Dry-Fit / Polyester (Olahraga)',
  'Cotton Fleece (Jaket/Hoodie)',
];

export const DEFAULT_KAOS_CATEGORIES = [
  'KASUAL',
  'POLO',
  'OLAHRAGA',
  'BASIC',
  'STREETWEAR',
  'HOODIE',
  'LIMITED EDITION',
];

export const DEFAULT_CUTTINGS = [
  { value: 'oversized', label: 'Oversized Fit' },
  { value: 'regular', label: 'Regular Fit' },
  { value: 'fitted', label: 'Fitted' },
  { value: 'boxy', label: 'Boxy Cut' },
  { value: 'long-sleeve', label: 'Long Sleeve (Lengan Panjang)' },
];

export const DEFAULT_EXCLUSIVE_CATEGORIES = [
  { value: 'dilio', label: 'Dilio (Brand Sendiri)' },
  { value: 'thinking-out', label: 'Thinking Out (Partner Brand)' },
  { value: 'dilio-x-one-piece', label: 'Dilio x One Piece (Collab)' },
];

export const CUSTOM_MATERIALS_KEY = 'kaos_dilio_custom_materials';
export const CUSTOM_KAOS_CAT_KEY = 'kaos_dilio_custom_kaos_categories';
export const CUSTOM_CUTTINGS_KEY = 'kaos_dilio_custom_cuttings';
export const CUSTOM_EXCLUSIVE_CAT_KEY = 'kaos_dilio_custom_exclusive_cats';

export const REMOVED_KAOS_CAT_KEY = 'kaos_dilio_removed_kaos_categories';
export const REMOVED_CUTTINGS_KEY = 'kaos_dilio_removed_cuttings';
export const REMOVED_MATERIALS_KEY = 'kaos_dilio_removed_materials';
export const REMOVED_EXCLUSIVE_CAT_KEY = 'kaos_dilio_removed_exclusive_cats';

export function readRemovedValues(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed.map((v) => String(v).toLowerCase().trim()) : [];
  } catch {
    return [];
  }
}

export function writeRemovedValues(key, values) {
  try {
    const clean = Array.from(new Set(values.map((v) => String(v).toLowerCase().trim()))).filter(Boolean);
    localStorage.setItem(key, JSON.stringify(clean));
  } catch {
    // ignore
  }
}

export function readCustomList(key) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCustomList(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/**
 * Derives the complete list of Kaos Categories:
 * Defaults + Custom stored + Active categories used across all products.
 */
export function getAllKaosCategories(products = [], currentVal = null) {
  const custom = readCustomList(CUSTOM_KAOS_CAT_KEY);
  const fromProducts = (products || [])
    .map((p) => (p.kaos_category || p.category_label || '').trim().toUpperCase())
    .filter(Boolean);

  const set = new Set([
    ...DEFAULT_KAOS_CATEGORIES,
    ...custom.map((c) => String(c).trim().toUpperCase()),
    ...fromProducts,
    ...(currentVal ? [String(currentVal).trim().toUpperCase()] : []),
  ]);

  return Array.from(set).filter(Boolean);
}

/**
 * Derives the complete list of Cuttings:
 * Defaults + Custom stored + Cuttings used across products.
 */
export function getAllCuttings(products = [], currentVal = null) {
  const custom = readCustomList(CUSTOM_CUTTINGS_KEY);
  const map = new Map();

  DEFAULT_CUTTINGS.forEach((c) => map.set(c.value.toLowerCase(), c));
  custom.forEach((c) => {
    if (c && c.value) map.set(c.value.toLowerCase(), c);
  });

  (products || []).forEach((p) => {
    if (p.cutting_type) {
      const slug = p.cutting_type.toLowerCase();
      if (!map.has(slug)) {
        const autoLabel = p.cutting_type
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        map.set(slug, { value: p.cutting_type, label: autoLabel });
      }
    }
  });

  if (currentVal) {
    const slug = String(currentVal).toLowerCase();
    if (!map.has(slug)) {
      const autoLabel = String(currentVal)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      map.set(slug, { value: currentVal, label: autoLabel });
    }
  }

  return Array.from(map.values());
}

/**
 * Derives the complete list of Materials:
 * Defaults + Custom stored + Materials used across products.
 */
export function getAllMaterials(products = [], currentVal = null) {
  const custom = readCustomList(CUSTOM_MATERIALS_KEY);
  const fromProducts = (products || []).map((p) => p.material).filter(Boolean);

  const set = new Set([
    ...DEFAULT_MATERIALS,
    ...custom,
    ...fromProducts,
    ...(currentVal ? [currentVal] : []),
  ]);

  return Array.from(set).filter(Boolean);
}

/**
 * Derives the complete list of Exclusive Categories:
 * Defaults + Custom stored + Categories used across products.
 */
export function getAllExclusiveCategories(products = [], currentVal = null) {
  const custom = readCustomList(CUSTOM_EXCLUSIVE_CAT_KEY);
  const map = new Map();

  DEFAULT_EXCLUSIVE_CATEGORIES.forEach((c) => map.set(c.value.toLowerCase(), c));
  custom.forEach((c) => {
    if (c && c.value) map.set(c.value.toLowerCase(), c);
  });

  (products || []).forEach((p) => {
    if (p.exclusive_category) {
      const slug = p.exclusive_category.toLowerCase();
      if (!map.has(slug)) {
        const autoLabel = p.exclusive_category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        map.set(slug, { value: p.exclusive_category, label: autoLabel });
      }
    }
  });

  if (currentVal) {
    const slug = String(currentVal).toLowerCase();
    if (!map.has(slug)) {
      const autoLabel = String(currentVal)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      map.set(slug, { value: currentVal, label: autoLabel });
    }
  }

  return Array.from(map.values());
}
