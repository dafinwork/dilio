import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSortBar from '../components/FilterSortBar';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useProducts } from '../context/ProductContext';

export default function KoleksiKaosPage() {
  const { products: allProducts } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCutting = searchParams.get('cutting') || 'all';

  const [activeTab, setActiveTab] = useState(initialCutting);
  const [sortOption, setSortOption] = useState('latest');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sync tab with URL search parameter if changed
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

  const tabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Oversized Fit', value: 'oversized' },
    { label: 'Reguler Fit', value: 'reguler' },
    { label: 'Boxy Cut', value: 'boxy' },
    { label: 'Long Sleeve', value: 'long-sleeve' },
  ];

  // Daily t-shirt products
  const dailyProducts = useMemo(() => {
    let list = allProducts.filter((p) => p.product_group === 'harian');

    if (activeTab !== 'all') {
      list = list.filter((p) => p.cutting_type === activeTab);
    }

    // Sort products
    return [...list].sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
      // default: latest
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [activeTab, sortOption]);

  return (
    <div className="min-h-screen py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black text-neutral-900 tracking-tight leading-tight">
            Kaos Polos Premium Untuk Berbagai Gaya dan Aktivitas Harianmu
          </h1>
        </div>

        {/* Filter Tabs & Sort Dropdown */}
        <FilterSortBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          sortOption={sortOption}
          onSortChange={setSortOption}
          showSort={true}
        />

        {/* 4-column Grid */}
        {dailyProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {dailyProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-neutral-500">
            <p className="text-base font-semibold">Tidak ada produk untuk kategori ini.</p>
            <button
              onClick={() => handleTabChange('all')}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold"
            >
              Lihat Semua Koleksi
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
