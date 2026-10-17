import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import FilterSortBar from '../components/FilterSortBar';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import ShopeeColorFilter from '../components/ShopeeColorFilter';
import { useProducts } from '../context/ProductContext';
import { BASE_COLORS, safeColors, getClosestColorId } from '../utils/helpers';

export default function KoleksiKaosPage() {
  const { products: allProducts } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCutting = searchParams.get('cutting') || 'all';

  const [activeTab, setActiveTab] = useState(initialCutting);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortOption, setSortOption] = useState('latest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync cutting tab with URL search parameter if changed
  useEffect(() => {
    const cutting = searchParams.get('cutting');
    if (cutting) {
      setActiveTab(cutting);
    }
  }, [searchParams]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    if (val === 'all') {
      searchParams.delete('cutting');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cutting: val });
    }
  };

  const handleToggleColor = (colorId) => {
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((c) => c !== colorId) : [...prev, colorId]
    );
  };

  const handleResetColors = () => {
    setSelectedColors([]);
  };

  const handleResetAll = () => {
    setSelectedColors([]);
    handleTabChange('all');
  };

  const tabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Oversized Fit', value: 'oversized' },
    { label: 'Reguler Fit', value: 'reguler' },
    { label: 'Boxy Cut', value: 'boxy' },
    { label: 'Long Sleeve', value: 'long-sleeve' },
  ];

  // Base list of daily products (product_group === 'harian')
  const baseDailyProducts = useMemo(() => {
    return allProducts.filter((p) => p.product_group === 'harian');
  }, [allProducts]);

  // Dynamic count of products per cutting type
  const cuttingCounts = useMemo(() => {
    const counts = { all: baseDailyProducts.length };
    tabs.slice(1).forEach((t) => {
      counts[t.value] = baseDailyProducts.filter((p) => p.cutting_type === t.value).length;
    });
    return counts;
  }, [baseDailyProducts]);

  // Dynamic count of products per color family within current cutting filter
  const colorCounts = useMemo(() => {
    const counts = {};
    BASE_COLORS.forEach((c) => (counts[c.id] = 0));

    const scopeProducts =
      activeTab === 'all'
        ? baseDailyProducts
        : baseDailyProducts.filter((p) => p.cutting_type === activeTab);

    scopeProducts.forEach((p) => {
      const colors = safeColors(p.colors);
      const colorIds = new Set(colors.map((c) => getClosestColorId(c)));
      colorIds.forEach((id) => {
        if (counts[id] !== undefined) {
          counts[id] += 1;
        }
      });
    });

    return counts;
  }, [baseDailyProducts, activeTab]);

  // Filtered & sorted products based on cutting tab and selected colors
  const filteredProducts = useMemo(() => {
    let list = baseDailyProducts;

    // 1. Filter by Cutting Type
    if (activeTab !== 'all') {
      list = list.filter((p) => p.cutting_type === activeTab);
    }

    // 2. Filter by Shopee Colors (multi-select)
    if (selectedColors.length > 0) {
      list = list.filter((p) => {
        const colors = safeColors(p.colors);
        if (colors.length === 0) return false;
        return colors.some((c) => selectedColors.includes(getClosestColorId(c)));
      });
    }

    // 3. Sort products
    return [...list].sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
      // default: latest
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [baseDailyProducts, activeTab, selectedColors, sortOption]);

  return (
    <div className="min-h-screen py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black text-neutral-900 tracking-tight leading-tight">
            Kaos Polos Premium Untuk Berbagai Gaya dan Aktivitas Harianmu
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500">
            Temukan koleksi kaos polos berkualitas dengan cuttingan presisi dan beragam pilihan warna favorit.
          </p>
        </div>

        {/* Top Cutting Filter Tabs & Sort Bar */}
        <div className="mb-8">
          <FilterSortBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
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
            <span>Filter Warna Shopee</span>
            {selectedColors.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-900 text-[10px] font-black flex items-center justify-center">
                {selectedColors.length}
              </span>
            )}
          </button>

          <span className="text-xs font-semibold text-neutral-500">
            {filteredProducts.length} Produk Ditemukan
          </span>
        </div>

        {/* Active Filter Chips Bar (When colors or cutting are selected) */}
        {selectedColors.length > 0 && (
          <div className="mb-6 p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-neutral-600 mr-1 flex items-center gap-1.5">
              <span>Filter Warna:</span>
            </span>

            {selectedColors.map((colorId) => {
              const cObj = BASE_COLORS.find((c) => c.id === colorId);
              if (!cObj) return null;
              return (
                <span
                  key={colorId}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 bg-white border border-neutral-200 text-neutral-900 rounded-lg font-bold shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: cObj.hex }}
                  />
                  <span>{cObj.name}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleColor(colorId)}
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
              onClick={handleResetColors}
              className="text-red-600 hover:text-red-700 font-bold ml-auto text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Warna</span>
            </button>
          </div>
        )}

        {/* Main 2-Column Content Layout: Left Shopee Filter + Right Products Grid */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left: Shopee Color & Cutting Filter Sidebar */}
          <ShopeeColorFilter
            selectedColors={selectedColors}
            onToggleColor={handleToggleColor}
            onResetColors={handleResetColors}
            colorCounts={colorCounts}
            activeCutting={activeTab}
            onCuttingChange={handleTabChange}
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
                    onSelect={setSelectedProduct}
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
                  Tidak ditemukan kaos dengan kombinasi cutting dan warna yang Anda pilih. Coba pilih warna lain atau reset filter.
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
