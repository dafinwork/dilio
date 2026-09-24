import { useState, useMemo } from 'react';
import FilterSortBar from '../components/FilterSortBar';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useProducts } from '../context/ProductContext';

export default function DesainEksklusifPage() {
  const { products: allProducts } = useProducts();
  const [activeTab, setActiveTab] = useState('all');
  const [sortOption, setSortOption] = useState('latest');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const tabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Dilio', value: 'dilio' },
    { label: 'Thinking Out', value: 'thinking-out' },
    { label: 'Dilio x One Piece', value: 'dilio-x-one-piece' },
  ];

  // Exclusive products
  const exclusiveProducts = useMemo(() => {
    let list = allProducts.filter((p) => p.product_group === 'eksklusif');

    if (activeTab !== 'all') {
      list = list.filter((p) => p.exclusive_category === activeTab);
    }

    return [...list].sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [activeTab, sortOption]);

  return (
    <div className="min-h-screen py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black text-neutral-900 tracking-tight leading-tight">
            Koleksi Eksklusif dan Terbatas
          </h1>
        </div>

        {/* Filter Tabs & Sort Dropdown */}
        <FilterSortBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOption={sortOption}
          onSortChange={setSortOption}
          showSort={true}
        />

        {/* 4-column Grid (8 products) */}
        {exclusiveProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {exclusiveProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-neutral-500">
            <p className="text-base font-semibold">Tidak ada produk untuk kategori eksklusif ini.</p>
            <button
              onClick={() => setActiveTab('all')}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold"
            >
              Lihat Semua Desain Eksklusif
            </button>
          </div>
        )}
      </div>

      {/* Quick Modal Detail */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
