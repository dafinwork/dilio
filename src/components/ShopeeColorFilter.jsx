import { useState } from 'react';
import { Filter, Check, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { BASE_COLORS } from '../utils/helpers';

export default function ShopeeColorFilter({
  selectedColors = [],
  onToggleColor,
  onResetColors,
  colorCounts = {},
  activeCutting = 'all',
  onCuttingChange,
  cuttingCounts = {},
  totalCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) {
  const [colorExpanded, setColorExpanded] = useState(true);
  const [cuttingExpanded, setCuttingExpanded] = useState(true);

  const cuttingOptions = [
    { label: 'Semua Model', value: 'all' },
    { label: 'Oversized Fit', value: 'oversized' },
    { label: 'Reguler Fit', value: 'reguler' },
    { label: 'Boxy Cut', value: 'boxy' },
    { label: 'Long Sleeve', value: 'long-sleeve' },
  ];

  const hasActiveFilters = selectedColors.length > 0 || activeCutting !== 'all';

  const filterContent = (
    <div className="space-y-6">
      {/* Filter Header (Shopee Style) */}
      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-200">
        <div className="flex items-center gap-2 text-neutral-900">
          <Filter className="w-4 h-4 text-neutral-900" />
          <span className="font-extrabold tracking-wider text-xs sm:text-sm uppercase">
            Filter Pencarian
          </span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              onResetColors();
              if (onCuttingChange) onCuttingChange('all');
            }}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Hapus Semua</span>
          </button>
        )}
      </div>

      {/* 1. Model / Tipe Cutting Filter */}
      <div className="pb-5 border-b border-neutral-100">
        <button
          type="button"
          onClick={() => setCuttingExpanded(!cuttingExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-neutral-900 text-xs sm:text-sm mb-3 select-none"
        >
          <span className="uppercase tracking-wider text-[11px] text-neutral-500 font-bold">
            Kategori Cutting
          </span>
          {cuttingExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>

        {cuttingExpanded && (
          <div className="space-y-2">
            {cuttingOptions.map((opt) => {
              const isSelected = activeCutting === opt.value;
              const count = cuttingCounts[opt.value];
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onCuttingChange && onCuttingChange(opt.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-bold shadow-2xs'
                      : 'text-neutral-700 hover:bg-neutral-100/80 font-medium'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {typeof count === 'number' && (
                    <span
                      className={`text-[10px] ml-1.5 px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'text-neutral-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Shopee-Style Color Filter Section */}
      <div className="pb-5 border-b border-neutral-100">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setColorExpanded(!colorExpanded)}
            className="flex-1 flex items-center justify-between text-left select-none"
          >
            <span className="uppercase tracking-wider text-[11px] text-neutral-500 font-bold">
              Pilihan Warna
            </span>
            {colorExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>
          {selectedColors.length > 0 && (
            <button
              type="button"
              onClick={onResetColors}
              className="text-[10px] font-bold text-neutral-500 hover:text-red-600 underline ml-2 shrink-0"
            >
              Reset ({selectedColors.length})
            </button>
          )}
        </div>

        {colorExpanded && (
          <div className="space-y-1.5">
            {BASE_COLORS.map((color) => {
              const isSelected = selectedColors.includes(color.id);
              const count = colorCounts[color.id] || 0;

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onToggleColor(color.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-2xs'
                      : 'bg-white border-neutral-200/70 hover:border-neutral-300 hover:bg-neutral-50/80 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Checkbox indicator */}
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-white border-white text-neutral-900'
                          : 'border-neutral-300 bg-white group-hover:border-neutral-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* Color Swatch Circle */}
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-black/15 shadow-2xs"
                      style={{ backgroundColor: color.hex }}
                    />

                    {/* Color Name */}
                    <span
                      className={`text-xs truncate ${
                        isSelected ? 'font-bold text-white' : 'font-medium text-neutral-800'
                      }`}
                    >
                      {color.name}
                    </span>
                  </div>

                  {/* Product Count Badge */}
                  <span
                    className={`text-[11px] tabular-nums shrink-0 ml-1.5 ${
                      isSelected ? 'text-white/80 font-bold' : 'text-neutral-400'
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {selectedColors.length > 0 && (
        <div className="pt-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
            Warna Terpilih
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedColors.map((colorId) => {
              const colorObj = BASE_COLORS.find((c) => c.id === colorId);
              if (!colorObj) return null;
              return (
                <span
                  key={colorId}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: colorObj.hex }}
                  />
                  <span>{colorObj.name}</span>
                  <button
                    type="button"
                    onClick={() => onToggleColor(colorId)}
                    className="p-0.5 text-neutral-400 hover:text-neutral-900 rounded cursor-pointer"
                    title={`Hapus filter ${colorObj.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Count Card */}
      <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-center">
        <span className="text-[11px] font-medium text-neutral-500 block">
          Hasil Produk
        </span>
        <span className="text-base font-black text-neutral-900">
          {totalCount} Kaos
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (Left Side) */}
      <aside className="hidden lg:block w-60 xl:w-64 shrink-0">
        <div className="sticky top-24 bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer (Slide-in modal from left) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-900" />
                <span className="font-extrabold text-neutral-900 text-sm">
                  Filter Koleksi Kaos
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {filterContent}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onResetColors();
                  if (onCuttingChange) onCuttingChange('all');
                }}
                className="flex-1 py-2.5 border border-neutral-300 bg-white text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                className="flex-1 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-neutral-800 transition-colors"
              >
                Tampilkan ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
