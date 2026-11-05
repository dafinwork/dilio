import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import PricingTierSection from '../components/home/PricingTierSection';
import CustomerReviewsSection from '../components/home/CustomerReviewsSection';
import { useProducts } from '../context/ProductContext';

const DEFAULT_EXCLUSIVE_TABS = [
  { label: 'Semua', value: 'all' },
  { label: 'Dilio', value: 'dilio' },
  { label: 'Thinking Out', value: 'thinking-out' },
  { label: 'Dilio x One Piece', value: 'dilio-x-one-piece' },
];

export default function HomePage() {
  const { products: allProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [limitedTab, setLimitedTab] = useState('all');
  const sliderRef = useRef(null);
  const dragStateRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  // Custom slider order set from CMS (localStorage key) — legacy priorityIds as fallback
  const sliderOrderMap = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('kaos_dilio_slider_order'));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
    return {};
  }, []);

  const priorityIds = [
    'prod-1790257639822',
    'exclusive-collab-onepiece-gear5',
    'exclusive-dilio-cyber-1',
    'exclusive-dilio-cyber-2',
  ];

  const exclusiveProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.product_group === 'eksklusif' || p.is_exclusive)
      .sort((a, b) => {
        // 1. Urutan manual dari CMS (tombol depan/belakang di dashboard admin)
        const ordA = typeof sliderOrderMap[a.id] === 'number' ? sliderOrderMap[a.id] : null;
        const ordB = typeof sliderOrderMap[b.id] === 'number' ? sliderOrderMap[b.id] : null;
        if (ordA !== null && ordB !== null) return ordA - ordB;
        if (ordA !== null) return -1;
        if (ordB !== null) return 1;

        // 2. Fallback legacy: prioritas bawaan lalu produk terbaru
        const idxA = priorityIds.indexOf(a.id);
        const idxB = priorityIds.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [allProducts, sliderOrderMap]);

  // Dynamically derive exclusive categories (supports categories added in admin)
  const limitedTabs = useMemo(() => {
    const tabs = [...DEFAULT_EXCLUSIVE_TABS];
    const knownValues = new Set(tabs.map((t) => t.value));

    // Respect admin's "removed" categories (tombstone list from CMS delete feature)
    let removedCats = [];
    try {
      const removed = JSON.parse(localStorage.getItem('kaos_dilio_removed_exclusive_cats'));
      if (Array.isArray(removed)) removedCats = removed.map((c) => String(c).toLowerCase());
    } catch {
      // ignore
    }

    // Also check saved custom categories from localStorage
    try {
      const saved = localStorage.getItem('kaos_dilio_custom_exclusive_cats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((cat) => {
            if (
              cat &&
              cat.value &&
              !knownValues.has(cat.value) &&
              !removedCats.includes(String(cat.value).toLowerCase())
            ) {
              knownValues.add(cat.value);
              tabs.push({ label: cat.label || cat.value, value: cat.value });
            }
          });
        }
      }
    } catch {
      // ignore
    }

    // Check actual products in case any has a unique exclusive_category
    exclusiveProducts.forEach((p) => {
      if (
        p.exclusive_category &&
        !knownValues.has(p.exclusive_category) &&
        !removedCats.includes(String(p.exclusive_category).toLowerCase())
      ) {
        knownValues.add(p.exclusive_category);
        const autoLabel = p.exclusive_category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        tabs.push({ label: autoLabel, value: p.exclusive_category });
      }
    });

    return tabs;
  }, [exclusiveProducts]);

  // Filter products by selected tab (shows all matching items in slider)
  const filteredLimited = useMemo(() => {
    if (limitedTab === 'all') return exclusiveProducts;
    return exclusiveProducts.filter((p) => p.exclusive_category === limitedTab);
  }, [exclusiveProducts, limitedTab]);

  // Slider navigation controls
  const handleScrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleSliderMouseDown = (e) => {
    const el = sliderRef.current;
    if (!el) return;
    dragStateRef.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handleSliderMouseLeaveOrUp = () => {
    dragStateRef.current.isDown = false;
  };

  const handleSliderMouseMove = (e) => {
    const state = dragStateRef.current;
    const el = sliderRef.current;
    if (!state.isDown || !el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - state.startX) * 1.4;
    if (Math.abs(walk) > 6) {
      state.moved = true;
      e.preventDefault();
      el.scrollLeft = state.scrollLeft - walk;
    }
  };

  return (
    <div className="min-h-screen">
      {/* SECTION 1: HERO BANNER */}
      <section className="relative w-full overflow-hidden bg-neutral-900 py-24 sm:py-32 lg:py-36 flex items-center justify-center text-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${import.meta.env.BASE_URL}hero-bg-clean.png')`,
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.15] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Kaos Polos Masa Kini
          </h1>
          <h2 className="mt-3 text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            Berbagai Cutting &amp; Custom Sablon
          </h2>
          <p className="mt-4 text-xs sm:text-sm lg:text-base text-white/95 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
            Kaos polos premium berbagai warna, cuttingan dan jenis sablon untuk outfit harian, clothing brand, event hingga merchandise.
          </p>
        </div>
      </section>

      {/* SECTION 2: TRUST BADGES */}
      <section className="bg-white border-b border-neutral-100 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Badge 1 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-amber-50 flex items-center justify-center overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}badge-trophy.png`}
                  alt="Pesanan Minimum"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = '<div class="text-amber-500 font-bold text-2xl">🏆</div>';
                  }}
                />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-neutral-900">
                  Tidak ada pesanan minimum!
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Kustomisasi bahkan untuk satu barang saja.
                </p>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-sky-50 flex items-center justify-center overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}badge-speed.png`}
                  alt="Desain Cepat"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = '<div class="text-sky-500 font-bold text-2xl">⚡</div>';
                  }}
                />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-neutral-900">
                  Desain hari ini, cetak hari ini.
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Siap hanya dalam satu hari.
                </p>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}badge-store.png`}
                  alt="Toko Nasional"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = '<div class="text-emerald-500 font-bold text-2xl">🏪</div>';
                  }}
                />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-neutral-900">
                  Lebih dari 90+ toko di seluruh Indonesia
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  yang mudah dijangkau.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LIMITED EDITION (SLIDER CAROUSEL) */}
      <section className="bg-[#1E3A5F] py-14 sm:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              [LIMITED EDITION] Koleksi Kaos Desain Eksklusif
            </h2>

            {/* Slider Navigation Arrows (Visible on all screens) */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handleScrollLeft}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-neutral-900 flex items-center justify-center transition-all cursor-pointer shadow-md"
                aria-label="Geser ke kiri"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleScrollRight}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-neutral-900 flex items-center justify-center transition-all cursor-pointer shadow-md"
                aria-label="Geser ke kanan"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* White Card Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl text-neutral-900">
            {/* Top Bar: Filter Tabs & Slider Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {limitedTabs.map((tab) => {
                  const isActive = limitedTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setLimitedTab(tab.value)}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
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

              {/* Action Group: Lihat Semua Link + Mobile Slider Arrows */}
              <div className="flex items-center justify-between sm:justify-end gap-4">
                {/* Mobile slider buttons */}
                <div className="flex sm:hidden items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleScrollLeft}
                    className="w-8 h-8 rounded-full border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 cursor-pointer"
                    aria-label="Geser ke kiri"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleScrollRight}
                    className="w-8 h-8 rounded-full border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 cursor-pointer"
                    aria-label="Geser ke kanan"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to="/koleksi-kaos"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-900 hover:text-neutral-600 transition-colors underline decoration-2 underline-offset-4"
                >
                  <span>Lihat Semua Katalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Smooth Slider Carousel */}
            {filteredLimited.length > 0 ? (
              <div className="relative">
                <div
                  ref={sliderRef}
                  onMouseDown={handleSliderMouseDown}
                  onMouseLeave={handleSliderMouseLeaveOrUp}
                  onMouseUp={handleSliderMouseLeaveOrUp}
                  onMouseMove={handleSliderMouseMove}
                  className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 scrollbar-none cursor-grab active:cursor-grabbing select-none"
                >
                  {filteredLimited.map((product) => (
                    <div
                      key={product.id}
                      className="w-[260px] sm:w-[280px] md:w-[295px] shrink-0 snap-start"
                    >
                      <ProductCard
                        product={product}
                        onSelect={(prod) => {
                          if (!dragStateRef.current.moved) {
                            setSelectedProduct(prod);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Subtitle Hint */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span>💡 Geser / swipe untuk melihat seluruh varian eksklusif</span>
                  </span>
                  <span className="font-bold text-neutral-600">
                    {filteredLimited.length} Desain Limited
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-neutral-400 text-xs">
                Tidak ada produk di kategori ini.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: ESTIMASI HARGA BELI BANYAK LEBIH HEMAT */}
      <PricingTierSection />

      {/* SECTION 5: BACA REVIEW TENTANG KAMI */}
      <CustomerReviewsSection />

      {/* Quick Modal Detail */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
