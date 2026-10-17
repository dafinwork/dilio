import { useState } from 'react';
import { Filter, X, Check, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { CUTTING_OPTIONS, formatRupiah } from '../utils/helpers';

export default function ProductSidebarFilter({
  availableColors = [],
  availableCuttings = [],
  selectedCuttings = [],
  onToggleCutting,
  selectedColors = [],
  onToggleColor,
  isExclusiveOnly = false,
  onToggleExclusive,
  selectedSablons = [],
  onToggleSablon,
  showSablonFilter = false,
  priceRange = { min: '', max: '' },
  onPriceRangeChange,
  onApplyPriceRange,
  onResetFilters,
  totalResultsCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) {
  const [cuttingExpanded, setCuttingExpanded] = useState(true);
  const [colorExpanded, setColorExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);
  const [sablonExpanded, setSablonExpanded] = useState(true);

  // Local price inputs before apply
  const [localMin, setLocalMin] = useState(priceRange.min || '');
  const [localMax, setLocalMax] = useState(priceRange.max || '');

  const hasActiveFilters =
    selectedCuttings.length > 0 ||
    selectedColors.length > 0 ||
    isExclusiveOnly ||
    selectedSablons.length > 0 ||
    Boolean(priceRange.min) ||
    Boolean(priceRange.max);

  const handleApplyPrice = (e) => {
    e.preventDefault();
    onApplyPriceRange({ min: localMin, max: localMax });
  };

  const handleReset = () => {
    setLocalMin('');
    setLocalMax('');
    onResetFilters();
  };

  const content = (
    <div className="space-y-6 text-sm">
      {/* Header filter & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-900" />
          <span className="font-extrabold text-neutral-900 uppercase tracking-wider text-xs">
            Filter Pencarian
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Status Eksklusif Checkbox */}
      <div className="pb-5 border-b border-neutral-100">
        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={isExclusiveOnly}
            onChange={(e) => onToggleExclusive(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer accent-neutral-900"
          />
          <span className="font-bold text-neutral-800 text-xs sm:text-sm group-hover:text-neutral-900">
            Hanya Produk Eksklusif
          </span>
          <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 bg-neutral-900 text-white rounded">
            VIP
          </span>
        </label>
      </div>

      {/* 2. Cutting Multi-Checkbox */}
      <div className="pb-5 border-b border-neutral-100">
        <button
          onClick={() => setCuttingExpanded(!cuttingExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-neutral-900 text-xs sm:text-sm mb-3 select-none"
        >
          <span>Tipe Cutting</span>
          {cuttingExpanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {cuttingExpanded && (
          <div className="space-y-2.5 pl-0.5">
            {CUTTING_OPTIONS.filter((opt) => opt.id !== 'all').map((opt) => {
              const isChecked = selectedCuttings.includes(opt.id);
              const count = availableCuttings[opt.id] || 0;
              return (
                <label
                  key={opt.id}
                  className="flex items-center justify-between cursor-pointer select-none group text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleCutting(opt.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer accent-neutral-900"
                    />
                    <span
                      className={`${
                        isChecked ? 'font-bold text-neutral-900' : 'text-neutral-700 font-normal'
                      } group-hover:text-neutral-900 transition-colors`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium">({count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Warna Multi-Select Swatches (Mirror dari Admin, Tanpa Hex) */}
      <div className="pb-5 border-b border-neutral-100">
        <button
          onClick={() => setColorExpanded(!colorExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-neutral-900 text-xs sm:text-sm mb-3 select-none"
        >
          <span>Pilihan Warna</span>
          {colorExpanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {colorExpanded && (
          <div>
            {availableColors.length === 0 ? (
              <p className="text-xs text-neutral-400">Memuat warna...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableColors.map((color) => {
                  const isSelected = selectedColors.includes(color.hex);
                  // Check if color is very light (e.g. white, cream)
                  const isLight =
                    color.hex.toLowerCase() === '#ffffff' ||
                    color.hex.toLowerCase() === '#f3f4f6' ||
                    color.hex.toLowerCase() === '#e5e7eb';

                  return (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => onToggleColor(color.hex)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs font-bold'
                          : 'border-neutral-200/90 bg-white hover:border-neutral-400 text-neutral-800'
                      }`}
                      title={color.name}
                    >
                      <span
                        className="relative w-4 h-4 rounded-full shrink-0 flex items-center justify-center border border-black/15 shadow-2xs"
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <Check
                            className={`w-2.5 h-2.5 ${isLight ? 'text-black' : 'text-white'}`}
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <span className="text-xs truncate">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Sablon Filter (Hanya untuk Bikin Custom) */}
      {showSablonFilter && (
        <div className="pb-5 border-b border-neutral-100">
          <button
            onClick={() => setSablonExpanded(!sablonExpanded)}
            className="w-full flex items-center justify-between text-left font-bold text-neutral-900 text-xs sm:text-sm mb-3 select-none"
          >
            <span>Jenis Sablon</span>
            {sablonExpanded ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {sablonExpanded && (
            <div className="space-y-2.5 pl-0.5">
              {[
                { id: 'dtf', label: 'Sablon DTF' },
                { id: 'plastisol', label: 'Sablon Plastisol' },
              ].map((s) => {
                const isChecked = selectedSablons.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-2.5 cursor-pointer select-none group text-xs sm:text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSablon(s.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer accent-neutral-900"
                    />
                    <span
                      className={`${
                        isChecked ? 'font-bold text-neutral-900' : 'text-neutral-700 font-normal'
                      } group-hover:text-neutral-900 transition-colors`}
                    >
                      {s.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Rentang Harga (Min - Max) */}
      <div className="pb-5 border-b border-neutral-100">
        <button
          onClick={() => setPriceExpanded(!priceExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-neutral-900 text-xs sm:text-sm mb-3 select-none"
        >
          <span>Rentang Harga (Rp)</span>
          {priceExpanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {priceExpanded && (
          <form onSubmit={handleApplyPrice} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                  Min (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                  Maks (Rp)
                </label>
                <input
                  type="number"
                  placeholder="200000"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
            >
              Terapkan Harga
            </button>
          </form>
        )}
      </div>

      {/* Summary indicator */}
      <div className="pt-2">
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-center">
          <span className="text-[11px] font-medium text-neutral-500 block">
            Hasil Ditemukan
          </span>
          <span className="text-base font-extrabold text-neutral-900">
            {totalResultsCount} Produk
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky left) */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
        <div className="sticky top-28 bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer (Modal bottom sheet / overlay) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-900" />
                <span className="font-extrabold text-neutral-900 text-sm">
                  Filter Produk
                </span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {content}
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-2">
              <button
                onClick={() => {
                  handleReset();
                }}
                className="flex-1 py-2.5 border border-neutral-300 bg-white text-neutral-700 text-xs font-bold rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={onCloseMobile}
                className="flex-1 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Tampilkan ({totalResultsCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
