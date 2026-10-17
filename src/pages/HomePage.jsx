import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useProducts } from '../context/ProductContext';

export default function HomePage() {
  const { products: allProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [limitedTab, setLimitedTab] = useState('all');

  // Filter exclusive products for Limited Edition section
  const exclusiveProducts = allProducts.filter((p) => p.product_group === 'eksklusif');
  const filteredLimited =
    limitedTab === 'all'
      ? exclusiveProducts.slice(0, 4)
      : exclusiveProducts
          .filter((p) => p.exclusive_category === limitedTab)
          .slice(0, 4);

  // 4 Daily & Custom Showcase products matching mockup screenshot 1:1
  const showcaseProducts = [
    allProducts.find((p) => p.id === 'harian-oversized-1'),
    allProducts.find((p) => p.id === 'harian-regular-1'),
    allProducts.find((p) => p.id === 'harian-boxy-1'),
    allProducts.find((p) => p.id === 'harian-longsleeve-1'),
  ].filter(Boolean);

  const limitedTabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Dilio', value: 'dilio' },
    { label: 'Thinking Out', value: 'thinking-out' },
    { label: 'Dilio x One Piece', value: 'dilio-x-one-piece' },
  ];

  return (
    <div className="min-h-screen">
      {/* SECTION 1: HERO BANNER (Real HTML/CSS over clean text-free background) */}
      <section className="relative w-full overflow-hidden bg-neutral-900 py-24 sm:py-32 lg:py-36 flex items-center justify-center text-center">
        {/* Background Image: Clean colorful hanging t-shirts (zero burned-in text) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${import.meta.env.BASE_URL}hero-bg-clean.png')`,
          }}
        />

        {/* Hero Content in real semantic HTML/CSS */}
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

      {/* SECTION 3: LIMITED EDITION (NAVY BACKGROUND CONTAINER) */}
      <section className="bg-[#1E3A5F] py-14 sm:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-6">
            [LIMITED EDITION] Koleksi Kaos Desain Eksklusif
          </h2>

          {/* White Card Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl text-neutral-900">
            {/* Top Bar: Filter Tabs & Lihat Semua Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {limitedTabs.map((tab) => {
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

              {/* Lihat Semua Link */}
              <Link
                to="/desain-eksklusif"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-900 hover:text-indigo-600 transition-colors underline decoration-2 underline-offset-4"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredLimited.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CARI KAOS HARIAN */}
      <section className="py-16 sm:py-24 bg-white">
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
            {showcaseProducts.map((product) => (
              <ProductCard
                key={`harian-${product.id}`}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: BIKIN KAOS CUSTOM */}
      <section className="py-16 sm:py-24 bg-neutral-50/70 border-t border-neutral-100">
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
            {showcaseProducts.map((product) => (
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
