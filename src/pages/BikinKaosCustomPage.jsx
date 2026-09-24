import { useState, useMemo } from 'react';
import FilterSortBar from '../components/FilterSortBar';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import ServiceCards from '../components/ServiceCards';
import { useProducts } from '../context/ProductContext';

export default function BikinKaosCustomPage() {
  const { products: allProducts } = useProducts();
  const [activeTab, setActiveTab] = useState('all');
  const [sortOption, setSortOption] = useState('latest');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const tabs = [
    { label: 'Semua', value: 'all' },
    { label: 'DTF', value: 'dtf' },
    { label: 'Plastisol', value: 'plastisol' },
  ];

  // Custom products
  const customProducts = useMemo(() => {
    let list = allProducts.filter((p) => p.product_group === 'custom');

    if (activeTab !== 'all') {
      list = list.filter((p) => p.sablon_type === activeTab);
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
            Bikin Kaos Desain Sendiri Dengan Pilihan Sablon Berkualitas
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

        {/* 4-column Grid */}
        {customProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {customProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-neutral-500">
            <p className="text-base font-semibold">Tidak ada produk untuk tipe sablon ini.</p>
            <button
              onClick={() => setActiveTab('all')}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold"
            >
              Lihat Semua Sablon
            </button>
          </div>
        )}

        {/* Service Partner Cards Section */}
        <ServiceCards />
      </div>

      {/* Quick Modal Detail */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
