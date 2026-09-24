import { useState } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

export default function FilterSortBar({
  tabs = [],
  activeTab,
  onTabChange,
  sortOption,
  onSortChange,
  showSort = true,
  rightAction = null,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const sortOptions = [
    { label: 'Terbaru', value: 'latest' },
    { label: 'Harga: Rendah ke Tinggi', value: 'price_asc' },
    { label: 'Harga: Tinggi ke Rendah', value: 'price_desc' },
    { label: 'Nama: A - Z', value: 'name_asc' },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortOption)?.label || 'Terbaru';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right side: Sort Dropdown or Custom Action */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
        {rightAction}

        {showSort && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-200 rounded-xl text-xs sm:text-sm font-medium text-neutral-700 hover:border-neutral-400 bg-white shadow-2xs transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              <span>Urutkan: {currentSortLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-neutral-100 py-1.5 z-40 animate-in fade-in duration-150">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onSortChange(opt.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                        sortOption === opt.value
                          ? 'bg-neutral-100 text-neutral-900 font-bold'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
