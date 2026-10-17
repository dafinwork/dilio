import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useProducts } from '../context/ProductContext';
import { flattenProductsByColor } from '../utils/helpers';

export default function HomePage() {
  const { products: allProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [limitedTab, setLimitedTab] = useState('all');

  // Flattened products so 1 color variant = 1 card
  const flattenedAll = useMemo(() => {
    return flattenProductsByColor(allProducts);
  }, [allProducts]);

  // Section Promo / Eksklusif Homepage (PRD Section 3.2 & 6.1)
  // Displays products checked by admin (show_on_homepage === true or show_in_homepage === true)
  // Fallback to exclusive products if no custom checkboxes are ticked yet
  const promoProducts = useMemo(() => {
    const adminTicked = flattenedAll.filter(
      (p) => Boolean(p.show_on_homepage) || Boolean(p.show_in_homepage)
    );

    if (adminTicked.length > 0) {
      return adminTicked;
    }

    // Default fallback: products marked is_exclusive
    return flattenedAll.filter((p) => Boolean(p.is_exclusive));
  }, [flattenedAll]);

  // Dynamic promo tabs based on categories available in promoProducts
  const promoTabs = useMemo(() => {
    const tabs = [{ label: 'Semua', value: 'all' }];
    const cats = new Set();
    promoProducts.forEach((p) => {
      if (p.exclusive_category) cats.add(p.exclusive_category);
    });

    cats.forEach((cat) => {
      const label =
        cat === 'dilio'
          ? 'Dilio'
          : cat === 'thinking-out'
          ? 'Thinking Out'
          : cat === 'dilio-x-one-piece'
          ? 'Dilio x One Piece'
          : cat.toUpperCase();
      tabs.push({ label, value: cat });
    });

    return tabs;
  }, [promoProducts]);

  const filteredPromoProducts = useMemo(() => {
    if (limitedTab === 'all') {
      return promoProducts.slice(0, 8);
    }
    return promoProducts
      .filter((p) => p.exclusive_category === limitedTab)
      .slice(0, 8);
  }, [promoProducts, limitedTab]);

  // 4 Daily Showcase products
  const dailyShowcase = useMemo(() => {
    const daily = flattenedAll.filter((p) => p.product_group === 'harian');
    return daily.slice(0, 4);
  }, [flattenedAll]);

  // 4 Custom Showcase products
  const customShowcase = useMemo(() => {
    const custom = flattenedAll.filter((p) => p.product_group === 'custom');
    return custom.slice(0, 4);
  }, [flattenedAll]);

  return (
    <div className="min-h-screen">
      {/* SECTION PROMO / EKSKLUSIF (PRD Section 3.2: Hero & badges removed, immediately opens into promo) */}
      <section className="bg-[#1E3A5F] py-12 sm:py-16 lg:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              [LIMITED EDITION] Koleksi Kaos Desain Eksklusif
            </h2>
            <span className="text-xs text-sky-200 font-semibold tracking-wide hidden sm:inline-block">
              Pilihan Eksklusif &amp; Promo Admin
            </span>
          </div>

          {/* White Card Container (Preserved 1:1 original style) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl text-neutral-900">
            {/* Top Bar: Filter Tabs & Lihat Semua Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              {/* Filter Tabs */}
              {promoTabs.length > 1 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                  {promoTabs.map((tab) => {
                    const isActive = limitedTab === tab.value;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setLimitedTab(tab.value)}
                        className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                          isActive
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Produk Unggulan Homepage
                </div>
              )}

              {/* Lihat Semua Link */}
              <Link
                to="/koleksi-kaos?exclusive=true"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-900 hover:text-indigo-600 transition-colors underline decoration-2 underline-offset-4"
              >
                <span>Lihat Semua Produk Eksklusif</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Promo Cards Grid */}
            {filteredPromoProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredPromoProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-neutral-500">
                <p className="text-sm font-bold text-neutral-700">
                  Belum ada produk yang dipilih untuk tampil di homepage.
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Admin dapat mencentang &apos;Tampilkan di Homepage&apos; pada panel admin.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: CARI KAOS HARIAN (Preserved 1:1 original style) */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Cari Kaos Harian
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                Pilih cuttingan yang paling cocok dengan gaya dan kebutuhan outfit harianmu.
              </p>
            </div>

            <Link
              to="/koleksi-kaos"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-900 hover:text-indigo-600 transition-colors underline decoration-2 underline-offset-4 shrink-0"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dailyShowcase.map((product) => (
              <ProductCard
                key={`harian-${product.id}`}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: BIKIN KAOS CUSTOM (Preserved 1:1 original style) */}
      <section className="py-14 sm:py-20 bg-neutral-50/70 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Bikin Kaos Custom
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                Pilih jenis sablon yang cocok untuk kebutuhan clothing brand, event hingga merchandise.
              </p>
            </div>

            <Link
              to="/bikin-kaos-custom"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-900 hover:text-indigo-600 transition-colors underline decoration-2 underline-offset-4 shrink-0"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Custom Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {customShowcase.map((product) => (
              <ProductCard
                key={`custom-${product.id}`}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Modal Detail */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
