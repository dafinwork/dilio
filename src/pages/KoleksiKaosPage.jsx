import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, ChevronDown, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import ProductSidebarFilter from '../components/ProductSidebarFilter';
import { useProducts } from '../context/ProductContext';
import {
  flattenProductsByColor,
  normalizeCutting,
  safeColors,
  CUTTING_OPTIONS,
  formatRupiah,
} from '../utils/helpers';

export default function KoleksiKaosPage() {
  const { products: allProducts } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  // Multi-Filter states
  const [selectedCuttings, setSelectedCuttings] = useState(() => {
    const cutting = searchParams.get('cutting');
    return cutting && cutting !== 'all' ? [normalizeCutting(cutting)] : [];
  });
  const [selectedColors, setSelectedColors] = useState(() => {
    const color = searchParams.get('color');
    return color ? [color] : [];
  });
  const [isExclusiveOnly, setIsExclusiveOnly] = useState(() => {
    return searchParams.get('exclusive') === 'true';
  });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortOption, setSortOption] = useState('latest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    const cutting = searchParams.get('cutting');
    if (cutting && cutting !== 'all') {
      const normalized = normalizeCutting(cutting);
      setSelectedCuttings((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    }
    if (searchParams.get('exclusive') === 'true') {
      setIsExclusiveOnly(true);
    }
  }, [searchParams]);

  // Flatten products so 1 color variant = 1 card (PRD Section 4)
  // Merged: all products (harian + eksklusif) as specified in PRD Section 3.3
  const flattenedCatalog = useMemo(() => {
    const catalogSource = allProducts.filter(
      (p) => p.product_group === 'harian' || p.product_group === 'eksklusif' || p.is_exclusive
    );
    return flattenProductsByColor(catalogSource);
  }, [allProducts]);

  // Extract available dynamic colors from catalog (mirrored from admin data)
  const availableColors = useMemo(() => {
    const map = new Map();
    flattenedCatalog.forEach((p) => {
      const color = p.primary_color || (p.colors && p.colors[0]);
      if (color && color.hex) {
        const hex = color.hex.trim();
        if (!map.has(hex)) {
          map.set(hex, { hex, name: color.name || 'Warna' });
        }
      }
    });
    return Array.from(map.values());
  }, [flattenedCatalog]);

  // Calculate cutting counts for sidebar
  const cuttingCounts = useMemo(() => {
    const counts = {};
    flattenedCatalog.forEach((p) => {
      const cutting = normalizeCutting(p.cutting_type);
      counts[cutting] = (counts[cutting] || 0) + 1;
    });
    return counts;
  }, [flattenedCatalog]);

  // Filter handlers
  const handleToggleCutting = (cuttingId) => {
    setSelectedCuttings((prev) =>
      prev.includes(cuttingId) ? prev.filter((id) => id !== cuttingId) : [...prev, cuttingId]
    );
  };

  const handleToggleColor = (hex) => {
    setSelectedColors((prev) =>
      prev.includes(hex) ? prev.filter((h) => h !== hex) : [...prev, hex]
    );
  };

  const handleResetFilters = () => {
    setSelectedCuttings([]);
    setSelectedColors([]);
    setIsExclusiveOnly(false);
    setPriceRange({ min: '', max: '' });
    searchParams.delete('cutting');
    searchParams.delete('color');
    searchParams.delete('exclusive');
    setSearchParams(searchParams);
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = flattenedCatalog.filter((product) => {
      // 1. Exclusive filter
      if (isExclusiveOnly && !product.is_exclusive) {
        return false;
      }

      // 2. Cutting multi-filter
      if (selectedCuttings.length > 0) {
        const norm = normalizeCutting(product.cutting_type);
        if (!selectedCuttings.includes(norm)) {
          return false;
        }
      }

      // 3. Color multi-filter
      if (selectedColors.length > 0) {
        const pColors = safeColors(product.colors).map((c) => c.hex.toLowerCase());
        const hasMatch = selectedColors.some((c) => pColors.includes(c.toLowerCase()));
        if (!hasMatch) return false;
      }

      // 4. Price range filter
      if (priceRange.min && product.price < Number(priceRange.min)) {
        return false;
      }
      if (priceRange.max && product.price > Number(priceRange.max)) {
        return false;
      }

      return true;
    });

    // Sort products
    return [...list].sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [flattenedCatalog, selectedCuttings, selectedColors, isExclusiveOnly, priceRange, sortOption]);

  const sortOptions = [
    { label: 'Terbaru', value: 'latest' },
    { label: 'Harga: Rendah ke Tinggi', value: 'price_asc' },
    { label: 'Harga: Tinggi ke Rendah', value: 'price_desc' },
    { label: 'Nama: A - Z', value: 'name_asc' },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortOption)?.label || 'Terbaru';

  return (
    <div className="min-h-screen py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title (Strictly preserved style) */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black text-neutral-900 tracking-tight leading-tight">
            Kaos Polos Premium Untuk Berbagai Gaya dan Aktivitas Harianmu
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
            Gunakan filter di bawah untuk menemukan kaos dengan cutting, warna, dan harga sesuai selera outfit kamu.
          </p>
        </div>

        {/* 2-Column Layout: Sidebar Filter (Left) + Catalog Grid (Right) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar Filter (Shopee Style) */}
          <ProductSidebarFilter
            availableColors={availableColors}
            availableCuttings={cuttingCounts}
            selectedCuttings={selectedCuttings}
            onToggleCutting={handleToggleCutting}
            selectedColors={selectedColors}
            onToggleColor={handleToggleColor}
            isExclusiveOnly={isExclusiveOnly}
            onToggleExclusive={setIsExclusiveOnly}
            priceRange={priceRange}
            onApplyPriceRange={setPriceRange}
            onResetFilters={handleResetFilters}
            totalResultsCount={filteredProducts.length}
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Right Main Content */}
          <div className="flex-1 w-full min-w-0">
            {/* Top Toolbar: Active Filter Tags, Count, Mobile Filter Trigger, Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-neutral-100">
              {/* Left: Mobile trigger & results count */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter</span>
                  {(selectedCuttings.length > 0 ||
                    selectedColors.length > 0 ||
                    isExclusiveOnly ||
                    priceRange.min ||
                    priceRange.max) && (
                    <span className="w-4 h-4 rounded-full bg-white text-neutral-900 text-[10px] flex items-center justify-center font-black">
                      {selectedCuttings.length + selectedColors.length + (isExclusiveOnly ? 1 : 0)}
                    </span>
                  )}
                </button>

                <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                  Menampilkan{' '}
                  <span className="font-extrabold text-neutral-900">
                    {filteredProducts.length}
                  </span>{' '}
                  kaos
                </p>
              </div>

              {/* Right: Sort Dropdown */}
              <div className="relative self-end sm:self-auto">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-200 rounded-xl text-xs sm:text-sm font-medium text-neutral-700 hover:border-neutral-400 bg-white shadow-2xs transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Urutkan: {currentSortLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
                </button>

                {sortDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setSortDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg z-30 py-1.5 overflow-hidden">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortOption(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors ${
                            sortOption === opt.value
                              ? 'bg-neutral-900 text-white font-bold'
                              : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active Filter Pills Bar */}
            {(selectedCuttings.length > 0 ||
              selectedColors.length > 0 ||
              isExclusiveOnly ||
              priceRange.min ||
              priceRange.max) && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/60">
                <span className="text-xs font-bold text-neutral-500">Filter Aktif:</span>

                {isExclusiveOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 text-white text-xs font-bold rounded-lg shadow-2xs">
                    Eksklusif Saja
                    <X
                      className="w-3 h-3 cursor-pointer hover:opacity-75"
                      onClick={() => setIsExclusiveOnly(false)}
                    />
                  </span>
                )}

                {selectedCuttings.map((cid) => {
                  const opt = CUTTING_OPTIONS.find((o) => o.id === cid);
                  return (
                    <span
                      key={cid}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-lg shadow-2xs"
                    >
                      {opt?.label || cid}
                      <X
                        className="w-3 h-3 cursor-pointer text-neutral-400 hover:text-neutral-900"
                        onClick={() => handleToggleCutting(cid)}
                      />
                    </span>
                  );
                })}

                {selectedColors.map((hex) => {
                  const colorObj = availableColors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
                  return (
                    <span
                      key={hex}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-lg shadow-2xs"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{colorObj?.name || hex}</span>
                      <X
                        className="w-3 h-3 cursor-pointer text-neutral-400 hover:text-neutral-900"
                        onClick={() => handleToggleColor(hex)}
                      />
                    </span>
                  );
                })}

                {(priceRange.min || priceRange.max) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-lg shadow-2xs">
                    Harga: {priceRange.min ? formatRupiah(priceRange.min) : 'Rp 0'} -{' '}
                    {priceRange.max ? formatRupiah(priceRange.max) : 'Max'}
                    <X
                      className="w-3 h-3 cursor-pointer text-neutral-400 hover:text-neutral-900"
                      onClick={() => setPriceRange({ min: '', max: '' })}
                    />
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto transition-colors"
                >
                  Hapus Semua
                </button>
              </div>
            )}

            {/* Product Cards Grid: 1 varian warna = 1 kartu */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-neutral-50/50 rounded-2xl border border-neutral-200/80 px-4">
                <p className="text-base font-bold text-neutral-800">
                  Tidak ada kaos yang cocok dengan kombinasi filter yang dipilih.
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Coba kurangi filter atau reset untuk melihat semua koleksi.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-5 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-neutral-800 transition-colors"
                >
                  Reset Semua Filter
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
