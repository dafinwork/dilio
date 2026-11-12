/**
 * Category, Cutting, Material, and Exclusive Category Manager
 * Centralizes defaults, persistence, and cloud synchronization with Supabase
 */
import { supabase } from '../lib/supabase';
import { computeDiscountInfo, normalizeCutting } from './helpers';

export const STORE_CONFIG_PRODUCT_ID = '__dilio_store_config__';

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
  'HOODIE',
  'SABLON',
];

export const DEFAULT_CUTTINGS = [
  { value: 'oversized', label: 'Oversized Fit' },
  { value: 'regular', label: 'Regular Fit' },
  { value: 'fitted', label: 'Fitted' },
  { value: 'boxy', label: 'Boxy Cut' },
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

export const IGNORED_MATERIAL_LABELS = new Set([
  'cotton combed 24s',
  'cotton combed 20s',
  'cotton combed 30s',
  'heavyweight 16s',
  'heavyweight cotton 16s',
  'washed cotton 20s',
  'partner brand',
  'limited collab',
  'limited edition',
  'graphic tees',
]);

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
    syncStoreConfigToCloud();
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
    syncStoreConfigToCloud();
  } catch {
    // ignore
  }
}

/**
 * Builds the store configuration payload from localStorage to sync with Supabase
 */
export function buildStoreConfigPayload() {
  return {
    customKaosCategories: readCustomList(CUSTOM_KAOS_CAT_KEY),
    removedKaosCategories: readRemovedValues(REMOVED_KAOS_CAT_KEY),
    customCuttings: readCustomList(CUSTOM_CUTTINGS_KEY),
    removedCuttings: readRemovedValues(REMOVED_CUTTINGS_KEY),
    customMaterials: readCustomList(CUSTOM_MATERIALS_KEY),
    removedMaterials: readRemovedValues(REMOVED_MATERIALS_KEY),
    customExclusiveCats: readCustomList(CUSTOM_EXCLUSIVE_CAT_KEY),
    removedExclusiveCats: readRemovedValues(REMOVED_EXCLUSIVE_CAT_KEY),
    catalogOrder: (() => {
      try {
        return JSON.parse(localStorage.getItem('kaos_dilio_catalog_order')) || {};
      } catch {
        return {};
      }
    })(),
    bannerSlides: (() => {
      try {
        return JSON.parse(localStorage.getItem('kaos_dilio_banner_slides')) || null;
      } catch {
        return null;
      }
    })(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Persists the current store configuration to Supabase so all devices stay in sync
 */
export async function syncStoreConfigToCloud() {
  try {
    const configPayload = buildStoreConfigPayload();
    const row = {
      id: STORE_CONFIG_PRODUCT_ID,
      name: '__DILIO_STORE_CONFIG__',
      slug: '__dilio_store_config__',
      description: 'System store configuration (categories, cuttings, order, banners)',
      price: 0,
      product_group: '__config__',
      mockup_angles: configPayload,
    };
    const { error } = await supabase
      .from('products')
      .upsert([row], { onConflict: 'id' });
    if (error) {
      console.warn('Cloud config sync warning:', error.message);
    }
    window.dispatchEvent(new Event('kaos_dilio_config_updated'));
  } catch (err) {
    console.warn('Cloud config sync error:', err);
  }
}

/**
 * Applies store configuration loaded from Supabase into localStorage and notifies components
 */
export function applyCloudStoreConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') return;
  try {
    if (Array.isArray(cfg.customKaosCategories)) {
      localStorage.setItem(CUSTOM_KAOS_CAT_KEY, JSON.stringify(cfg.customKaosCategories));
    }
    if (Array.isArray(cfg.removedKaosCategories)) {
      localStorage.setItem(REMOVED_KAOS_CAT_KEY, JSON.stringify(cfg.removedKaosCategories));
    }
    if (Array.isArray(cfg.customCuttings)) {
      localStorage.setItem(CUSTOM_CUTTINGS_KEY, JSON.stringify(cfg.customCuttings));
    }
    if (Array.isArray(cfg.removedCuttings)) {
      localStorage.setItem(REMOVED_CUTTINGS_KEY, JSON.stringify(cfg.removedCuttings));
    }
    if (Array.isArray(cfg.customMaterials)) {
      localStorage.setItem(CUSTOM_MATERIALS_KEY, JSON.stringify(cfg.customMaterials));
    }
    if (Array.isArray(cfg.removedMaterials)) {
      localStorage.setItem(REMOVED_MATERIALS_KEY, JSON.stringify(cfg.removedMaterials));
    }
    if (Array.isArray(cfg.customExclusiveCats)) {
      localStorage.setItem(CUSTOM_EXCLUSIVE_CAT_KEY, JSON.stringify(cfg.customExclusiveCats));
    }
    if (Array.isArray(cfg.removedExclusiveCats)) {
      localStorage.setItem(REMOVED_EXCLUSIVE_CAT_KEY, JSON.stringify(cfg.removedExclusiveCats));
    }
    if (cfg.catalogOrder && typeof cfg.catalogOrder === 'object' && Object.keys(cfg.catalogOrder).length > 0) {
      localStorage.setItem('kaos_dilio_catalog_order', JSON.stringify(cfg.catalogOrder));
      localStorage.setItem('kaos_dilio_slider_order', JSON.stringify(cfg.catalogOrder));
      window.dispatchEvent(new Event('kaos_dilio_order_updated'));
    }
    if (Array.isArray(cfg.bannerSlides) && cfg.bannerSlides.length > 0) {
      localStorage.setItem('kaos_dilio_banner_slides', JSON.stringify(cfg.bannerSlides));
      window.dispatchEvent(new Event('kaos_dilio_banner_updated'));
    }
    window.dispatchEvent(new Event('kaos_dilio_config_updated'));
  } catch (err) {
    console.warn('Error applying cloud store config:', err);
  }
}

/**
 * Derives the complete list of Kaos Categories:
 * Defaults + Custom stored + Active categories used across all products (minus removed).
 */
export function getAllKaosCategories(products = [], currentVal = null) {
  const removed = readRemovedValues(REMOVED_KAOS_CAT_KEY);
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

  return Array.from(set).filter((cat) => {
    if (!cat) return false;
    const lower = cat.toLowerCase().trim();
    if (lower === 'casual') return false; // normalized to KASUAL
    if (IGNORED_MATERIAL_LABELS.has(lower)) return false;
    if (removed.includes(lower)) return false;
    return true;
  });
}

/**
 * Derives the complete list of Cuttings for Admin dropdown:
 * Defaults + Custom stored (minus removed).
 */
export function getAllCuttings(_products = [], currentVal = null) {
  const removed = readRemovedValues(REMOVED_CUTTINGS_KEY);
  const custom = readCustomList(CUSTOM_CUTTINGS_KEY);
  const map = new Map();

  DEFAULT_CUTTINGS.forEach((c) => {
    const slug = c.value.toLowerCase();
    if (!removed.includes(slug)) {
      map.set(slug, c);
    }
  });
  custom.forEach((c) => {
    if (c && c.value) {
      const slug = String(c.value).toLowerCase().trim();
      if (slug && !removed.includes(slug)) {
        map.set(slug, c);
      }
    }
  });

  if (currentVal) {
    const slug = String(currentVal).toLowerCase().trim();
    if (slug && !removed.includes(slug) && !map.has(slug)) {
      const autoLabel = String(currentVal)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      map.set(slug, { value: currentVal, label: autoLabel });
    }
  }

  return Array.from(map.values());
}

/**
 * Returns the active cutting options for the storefront Filter Sidebar (synchronized with Admin setup)
 */
export function getActiveCuttingOptions() {
  const removedCuttings = readRemovedValues(REMOVED_CUTTINGS_KEY);
  const base = [
    { label: 'Semua Cut', value: 'all' },
    { label: 'Oversized', value: 'oversized' },
    { label: 'Regular', value: 'regular' },
    { label: 'Fitted', value: 'fitted' },
    { label: 'Boxy', value: 'boxy' },
  ].filter((c) => c.value === 'all' || !removedCuttings.includes(c.value));

  const known = new Set(base.map((b) => b.value));
  const ignored = new Set(['kasual', 'casual', 'polo', 'olahraga']);

  const custom = readCustomList(CUSTOM_CUTTINGS_KEY);
  custom.forEach((c) => {
    const val = typeof c === 'object' && c !== null ? c.value : c;
    const lbl = typeof c === 'object' && c !== null ? c.label : null;
    if (!val) return;
    const norm = normalizeCutting(val);
    if (!norm || known.has(norm) || ignored.has(norm)) return;
    if (removedCuttings.includes(norm)) return;
    known.add(norm);
    const formatted =
      lbl ||
      norm
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (ch) => ch.toUpperCase());
    base.push({ label: formatted, value: norm });
  });

  return base;
}

/**
 * Derives the complete list of Materials:
 * Defaults + Custom stored + Materials used across products (minus removed).
 */
export function getAllMaterials(products = [], currentVal = null) {
  const removed = readRemovedValues(REMOVED_MATERIALS_KEY);
  const custom = readCustomList(CUSTOM_MATERIALS_KEY);
  const fromProducts = (products || []).map((p) => p.material).filter(Boolean);

  const set = new Set([
    ...DEFAULT_MATERIALS,
    ...custom,
    ...fromProducts,
    ...(currentVal ? [currentVal] : []),
  ]);

  return Array.from(set).filter((m) => m && !removed.includes(String(m).toLowerCase().trim()));
}

/**
 * Derives the complete list of Exclusive Categories:
 * Defaults + Custom stored + Categories used across products (minus removed).
 */
export function getAllExclusiveCategories(products = [], currentVal = null) {
  const removed = readRemovedValues(REMOVED_EXCLUSIVE_CAT_KEY);
  const custom = readCustomList(CUSTOM_EXCLUSIVE_CAT_KEY);
  const map = new Map();

  DEFAULT_EXCLUSIVE_CATEGORIES.forEach((c) => {
    const slug = c.value.toLowerCase();
    if (!removed.includes(slug)) map.set(slug, c);
  });
  custom.forEach((c) => {
    if (c && c.value) {
      const slug = String(c.value).toLowerCase();
      if (!removed.includes(slug)) map.set(slug, c);
    }
  });

  (products || []).forEach((p) => {
    if (p.exclusive_category) {
      const slug = p.exclusive_category.toLowerCase().trim();
      if (slug && !removed.includes(slug) && !map.has(slug)) {
        const autoLabel = p.exclusive_category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        map.set(slug, { value: p.exclusive_category, label: autoLabel });
      }
    }
  });

  if (currentVal) {
    const slug = String(currentVal).toLowerCase().trim();
    if (slug && !removed.includes(slug) && !map.has(slug)) {
      const autoLabel = String(currentVal)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      map.set(slug, { value: currentVal, label: autoLabel });
    }
  }

  return Array.from(map.values());
}

/**
 * Returns the display category label for a product card / modal.
 * If the product's category was deleted in Admin, automatically falls back to 'KASUAL'.
 */
export function getDisplayCategoryLabel(product) {
  if (!product) return 'KASUAL';
  const removedCats = readRemovedValues(REMOVED_KAOS_CAT_KEY);
  const raw = (product.kaos_category || product.category_label || '').trim();
  const lower = raw.toLowerCase();
  if (
    !raw ||
    lower === 'casual' ||
    lower === 'kasual' ||
    IGNORED_MATERIAL_LABELS.has(lower) ||
    removedCats.includes(lower)
  ) {
    return 'KASUAL';
  }
  return raw.toUpperCase();
}

export function getAppCategoryTabs(products = []) {
  const removedCats = readRemovedValues(REMOVED_KAOS_CAT_KEY);

  // 2 Kategori default khusus permanen: SALE dulu baru Exclusive (tidak bisa dihapus/diubah)
  const baseTabs = [
    { label: 'Semua Kategori', value: 'all' },
    { label: '🏷️ SALE!', value: 'sale' },
    { label: '👑 Exclusive', value: 'exclusive' },
  ];

  const known = new Set(baseTabs.map((t) => t.value));
  known.add('eksklusif');
  known.add('casual');
  known.add('harian');
  known.add('custom');

  const addTab = (raw) => {
    if (!raw || typeof raw !== 'string') return;
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    if (!lower || known.has(lower) || IGNORED_MATERIAL_LABELS.has(lower)) return;
    if (removedCats.includes(lower)) return;
    known.add(lower);
    const label = trimmed.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
    baseTabs.push({ label, value: lower });
  };

  // 1. Default admin categories (Kasual, Polo, Olahraga, Hoodie, Sablon)
  DEFAULT_KAOS_CATEGORIES.forEach(addTab);

  // 2. Custom categories added by Admin
  const custom = readCustomList(CUSTOM_KAOS_CAT_KEY);
  custom.forEach(addTab);

  // 3. Categories present on active products
  (products || []).forEach((p) => {
    addTab(p.kaos_category);
    addTab(p.category_label);
  });

  return baseTabs;
}

export function filterMatchesCategory(p, targetCat) {
  if (!targetCat || targetCat === 'all') return true;
  const target = targetCat.toLowerCase().trim();

  // Special Tab 1: SALE!
  if (target === 'sale') {
    return computeDiscountInfo(p.price, p.original_price).hasDiscount;
  }

  // Special Tab 2: Exclusive
  if (target === 'exclusive' || target === 'eksklusif') {
    return Boolean(p.is_exclusive || p.product_group === 'eksklusif');
  }

  const removedCats = readRemovedValues(REMOVED_KAOS_CAT_KEY);
  const rawCat = (p.kaos_category || p.category_label || '').toLowerCase().trim();
  const effectiveCat =
    !rawCat ||
    rawCat === 'casual' ||
    IGNORED_MATERIAL_LABELS.has(rawCat) ||
    removedCats.includes(rawCat)
      ? 'kasual'
      : rawCat;

  if (target === 'kasual' || target === 'casual') {
    return (
      effectiveCat === 'kasual' ||
      effectiveCat.includes('kasual') ||
      normalizeCutting(p.cutting_type) === 'kasual'
    );
  }

  return (
    effectiveCat === target ||
    effectiveCat.includes(target) ||
    normalizeCutting(p.cutting_type) === target
  );
}
