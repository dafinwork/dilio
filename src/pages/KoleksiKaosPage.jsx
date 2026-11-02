import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import FilterSortBar from '../components/FilterSortBar';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import ShopeeColorFilter from '../components/ShopeeColorFilter';
import { useProducts } from '../context/ProductContext';
import {
  extractUniqueColorsFromProducts,
  normalizeCutting,
  flattenProductsByColor,
  safeColors,
  getClosestColorId,
} from '../utils/helpers';

const DEFAULT_CATEGORY_TABS = [
  { label: 'Semua Kategori', value: 'all' },
  { label: 'Kasual', value: 'kasual' },
  { label: 'Polo', value: 'polo' },
  { label: 'Olahraga', value: 'olahraga' },
];

const IGNORED_MATERIAL_LABELS = new Set([
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
  'basic',
  'streetwear',
]);

export default function KoleksiKaosPage() {
  const { products: allProducts } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  // Top Bar Filter: Kategori Jenis Kaos (Kasual, Polo, Olahraga)
  const initialCategory = searchParams.get('kategori') || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Sidebar Filter: Tshirt Cut (Oversized, Regular, Fitted, Boxy, Long Sleeve)
  const initialCutting = searchParams.get('cutting') || 'all';
  const [activeCutting, setActiveCutting] = useState(() => normalizeCutting(initialCutting));

  const [selectedColors, setSelectedColors] = useState([]);
  const [sortOption, setSortOption] = useState('latest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync with URL parameters
  useEffect(() => {
    const kat = searchParams.get('kategori');
    if (kat) setActiveCategory(kat);
    const cut = searchParams.get('cutting');
    if (cut) setActiveCutting(normalizeCutting(cut));
  }, [searchParams]);

  const handleCategoryChange = (val) => {
    setActiveCategory(val);
    if (val === 'all') {
      searchParams.delete('kategori');
    } else {
      searchParams.set('kategori', val);
    }
    setSearchParams(searchParams);
  };

  const handleCuttingChange = (val) => {
    const normalized = val === 'all' ? 'all' : normalizeCutting(val);
    setActiveCutting(normalized);
    if (normalized === 'all') {
      searchParams.delete('cutting');
    } else {
      searchParams.set('cutting', normalized);
    }
    setSearchParams(searchParams);
  };

  const handleToggleColor = (colorKey) => {
    setSelectedColors((prev) =>
      prev.includes(colorKey) ? prev.filter((c) => c !== colorKey) : [...prev, colorKey]
    );
  };

  const handleResetColors = () => {
    setSelectedColors([]);
  };

  const handleResetAll = () => {
    setSelectedColors([]);
    setActiveCutting('all');
    setActiveCategory('all');
    setSearchParams({});
  };

  // Top Category Tabs (Kasual, Polo, Olahraga + custom categories from Admin)
  const categoryTabs = useMemo(() => {
    const tabs = [...DEFAULT_CATEGORY_TABS];
    const known = new Set(tabs.map((t) => t.value));
    known.add('casual'); // alias for kasual

    const addTabIfNew = (rawCat) => {
      if (!rawCat || typeof rawCat !== 'string') return;
      const trimmed = rawCat.trim();
      const lower = trimmed.toLowerCase();
      if (!lower || known.has(lower) || IGNORED_MATERIAL_LABELS.has(lower)) return;
      known.add(lower);
      const formattedLabel = trimmed
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      tabs.push({
        label: formattedLabel,
        value: lower,
      });
    };

    try {
      const savedCats = localStorage.getItem('kaos_dilio_custom_kaos_categories');
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed)) {
          parsed.forEach(addTabIfNew);
        }
      }
    } catch {
      // ignore
    }

    allProducts.forEach((p) => {
      if (p.product_group === 'harian' || p.product_group === 'eksklusif' || p.is_exclusive) {
        addTabIfNew(p.kaos_category || p.category_label);
      }
    });

    return tabs;
  }, [allProducts]);

  // Sidebar Cutting Options (Default 5 + custom cuttings from Admin)
  const cuttingOptions = useMemo(() => {
    const base = [
      { label: 'Semua Cut', value: 'all' },
      { label: 'Oversized', value: 'oversized' },
      { label: 'Regular', value: 'regular' },
      { label: 'Fitted', value: 'fitted' },
      { label: 'Boxy', value: 'boxy' },
      { label: 'Long Sleeve', value: 'long-sleeve' },
    ];
    const known = new Set(base.map((b) => b.value));
    const ignored = new Set(['kasual', 'casual', 'polo', 'olahraga']);

    const addCutIfNew = (val, lbl) => {
      if (!val) return;
      const norm = normalizeCutting(val);
      if (!norm || known.has(norm) || ignored.has(norm)) return;
      known.add(norm);
      const formatted =
        lbl ||
        norm
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      base.push({ label: formatted, value: norm });
    };

    try {
      const saved = localStorage.getItem('kaos_dilio_custom_cuttings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => addCutIfNew(c.value, c.label));
        }
      }
    } catch {
      // ignore
    }

    allProducts.forEach((p) => {
      if (p.cutting_type) addCutIfNew(p.cutting_type);
    });

    return base;
  }, [allProducts]);

  // Combined catalog source: Daily products (harian) + [LIMITED EDITION] Exclusive products
  const catalogSource = useMemo(() => {
    return allProducts.filter(
      (p) => p.product_group === 'harian' || p.product_group === 'eksklusif' || p.is_exclusive
    );
  }, [allProducts]);

  // Dynamically extract all unique colors from products
  const availableColors = useMemo(() => {
    return extractUniqueColorsFromProducts(catalogSource);
  }, [catalogSource]);

  // Flatten catalog so each color variant = 1 individual card
  const flattenedCatalog = useMemo(() => {
    return flattenProductsByColor(catalogSource);
  }, [catalogSource]);

  // Dynamic count of products per cutting type
  const cuttingCounts = useMemo(() => {
    const counts = { all: flattenedCatalog.length };
    cuttingOptions.slice(1).forEach((t) => {
      counts[t.value] = flattenedCatalog.filter(
        (p) => normalizeCutting(p.cutting_type) === t.value
      ).length;
    });
    return counts;
  }, [flattenedCatalog]);

  const matchesCategory = (p, targetCat) => {
    if (!targetCat || targetCat === 'all') return true;
    const target = targetCat.toLowerCase().trim();
    const rawCat = (p.kaos_category || p.category_label || '').toLowerCase().trim();
    if (target === 'kasual' || target === 'casual') {
      return (
        rawCat === 'kasual' ||
        rawCat === 'casual' ||
        rawCat.includes('kasual') ||
        rawCat.includes('casual') ||
        normalizeCutting(p.cutting_type) === 'kasual'
      );
    }
    return rawCat === target || rawCat.includes(target) || normalizeCutting(p.cutting_type) === target;
  };

  // Dynamic count of products per color in current scope
  const colorCounts = useMemo(() => {
    const counts = {};
    availableColors.forEach((c) => {
      counts[c.hex] = 0;
      if (c.id) counts[c.id] = 0;
    });

    let scopeProducts = flattenedCatalog;
    if (activeCategory !== 'all') {
      scopeProducts = scopeProducts.filter((p) => matchesCategory(p, activeCategory));
    }
    if (activeCutting !== 'all') {
      scopeProducts = scopeProducts.filter(
        (p) => normalizeCutting(p.cutting_type) === activeCutting
      );
    }

    scopeProducts.forEach((p) => {
      const pColors = safeColors(p.colors);
      const hexList = pColors.length > 0 ? pColors : p.color_hex ? [p.color_hex] : [];
      const matchedFamilies = new Set(hexList.map((h) => getClosestColorId(h)));

      availableColors.forEach((c) => {
        if (
          (c.id && matchedFamilies.has(c.id)) ||
          hexList.some((h) => h.toUpperCase() === c.hex.toUpperCase())
        ) {
          counts[c.hex] = (counts[c.hex] || 0) + 1;
          if (c.id) counts[c.id] = (counts[c.id] || 0) + 1;
        }
      });
    });

    return counts;
  }, [availableColors, flattenedCatalog, activeCategory, activeCutting]);

  // Filtered & sorted products based on Kategori + Cutting + Color
  const filteredProducts = useMemo(() => {
    let list = flattenedCatalog;

    // 1. Filter by Top Category Tabs (Kasual, Polo, Olahraga, or custom)
    if (activeCategory !== 'all') {
      list = list.filter((p) => matchesCategory(p, activeCategory));
    }

    // 2. Filter by Sidebar Tshirt Cut
    if (activeCutting !== 'all') {
      list = list.filter((p) => normalizeCutting(p.cutting_type) === activeCutting);
    }

    // 3. Filter by Colors (General color family + exact hex match)
    if (selectedColors.length > 0) {
      const selectedFamilies = new Set(selectedColors.map((sel) => getClosestColorId(sel)));
      const selectedHexes = new Set(selectedColors.map((sel) => sel.toUpperCase()));

      list = list.filter((p) => {
        const pColors = safeColors(p.colors);
        const hexList = pColors.length > 0 ? pColors : p.color_hex ? [p.color_hex] : [];
        return hexList.some(
          (h) => selectedFamilies.has(getClosestColorId(h)) || selectedHexes.has(h.toUpperCase())
        );
      });
    }

    // 4. Sort products
    return [...list].sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [flattenedCatalog, activeCategory, activeCutting, selectedColors, sortOption]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black text-neutral-900 tracking-tight leading-tight">
            Katalog Kaos Polos &amp; Limited Edition
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500">
            Temukan koleksi kaos polos harian, polo, olahraga, dan edisi eksklusif dengan pilihan cutting presisi serta varian warna terlengkap.
          </p>
        </div>

        {/* Top Category Filter Tabs (Kasual, Polo, Olahraga) & Sort Bar (Matching Image 1) */}
        <div className="mb-8">
          <FilterSortBar
            tabs={categoryTabs}
            activeTab={activeCategory}
            onTabChange={handleCategoryChange}
            sortOption={sortOption}
            onSortChange={setSortOption}
            showSort={true}
          />
        </div>

        {/* Mobile Filter Button (Visible on screens < lg) */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-6 p-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter Shopee</span>
            {(selectedColors.length > 0 || activeCutting !== 'all') && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-900 text-[10px] font-black flex items-center justify-center">
                {selectedColors.length + (activeCutting !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>

          <span className="text-xs font-semibold text-neutral-500">
            {filteredProducts.length} Produk Ditemukan
          </span>
        </div>

        {/* Active Filter Chips Bar */}
        {(selectedColors.length > 0 || activeCutting !== 'all') && (
          <div className="mb-6 p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-neutral-600 mr-1 flex items-center gap-1.5">
              <span>Filter Aktif:</span>
            </span>

            {activeCutting !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 text-neutral-900 rounded-lg font-bold shadow-2xs">
                <span>Cut: {activeCutting.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => handleCuttingChange('all')}
                  className="p-0.5 text-neutral-400 hover:text-neutral-900 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedColors.map((colorKey) => {
              const cObj = availableColors.find(
                (c) => c.hex === colorKey || c.id === colorKey
              ) || { hex: colorKey, name: colorKey };

              return (
                <span
                  key={colorKey}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 bg-white border border-neutral-200 text-neutral-900 rounded-lg font-bold shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: cObj.hex }}
                  />
                  <span>{cObj.name}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleColor(colorKey)}
                    className="p-0.5 text-neutral-400 hover:text-neutral-900 rounded cursor-pointer"
                    title={`Hapus filter ${cObj.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}

            <button
              type="button"
              onClick={handleResetAll}
              className="text-red-600 hover:text-red-700 font-bold ml-auto text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua</span>
            </button>
          </div>
        )}

        {/* Main 2-Column Content Layout: Left Shopee Filter + Right Products Grid */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left: Shopee Color & Tshirt Cut Filter Sidebar (Matching Image 1) */}
          <ShopeeColorFilter
            selectedColors={selectedColors}
            onToggleColor={handleToggleColor}
            onResetColors={handleResetColors}
            colorCounts={colorCounts}
            availableColors={availableColors}
            cuttingOptions={cuttingOptions}
            activeCutting={activeCutting}
            onCuttingChange={handleCuttingChange}
            cuttingCounts={cuttingCounts}
            totalCount={filteredProducts.length}
            isOpenMobile={mobileFilterOpen}
            onCloseMobile={() => setMobileFilterOpen(false)}
          />

          {/* Right: Products Grid */}
          <div className="flex-1 w-full min-w-0">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 px-4 text-center bg-neutral-50/60 rounded-3xl border border-neutral-200/80">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-neutral-200/70 flex items-center justify-center text-2xl">
                  🔍
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">
                  Tidak Ada Produk Yang Sesuai
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mb-5">
                  Tidak ditemukan kaos dengan kombinasi kategori, cutting, dan warna yang Anda pilih. Coba pilih kombinasi lain atau reset filter.
                </p>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Semua Filter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Modal Detail */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
