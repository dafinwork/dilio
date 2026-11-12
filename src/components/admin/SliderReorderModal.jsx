import { useState, useEffect, useMemo } from 'react';
import { X, GripVertical, Crown, Check, ArrowLeft, ArrowRight, Sparkles, Layers, Shirt } from 'lucide-react';
import { getAppCategoryTabs, filterMatchesCategory } from '../../utils/categoryManager';

export const CATALOG_ORDER_KEY = 'kaos_dilio_catalog_order';
export const SLIDER_ORDER_KEY = 'kaos_dilio_slider_order';

export function readCatalogOrderMap() {
  try {
    const parsed =
      JSON.parse(localStorage.getItem(CATALOG_ORDER_KEY)) ||
      JSON.parse(localStorage.getItem(SLIDER_ORDER_KEY));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export default function SliderReorderModal({ isOpen, onClose, products = [], onOrderChanged }) {
  const [filterGroup, setFilterGroup] = useState('all');
  const [items, setItems] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Synchronized categories with Homepage and Admin Table
  const categoryTabs = useMemo(() => getAppCategoryTabs(products), [products]);

  // Initialize ordered list from products and stored order map
  useEffect(() => {
    if (!isOpen) return;

    const targetProducts = products.filter((p) => filterMatchesCategory(p, filterGroup));

    const orderMap = readCatalogOrderMap();
    const sorted = [...targetProducts].sort((a, b) => {
      const ordA = typeof orderMap[a.id] === 'number' ? orderMap[a.id] : 9999;
      const ordB = typeof orderMap[b.id] === 'number' ? orderMap[b.id] : 9999;
      if (ordA !== ordB) return ordA - ordB;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    setItems(sorted);
  }, [isOpen, products, filterGroup]);

  if (!isOpen) return null;

  const persistOrder = (newList) => {
    const existingMap = readCatalogOrderMap();
    const newMap = { ...existingMap };

    newList.forEach((p, idx) => {
      newMap[p.id] = idx;
    });

    try {
      localStorage.setItem(CATALOG_ORDER_KEY, JSON.stringify(newMap));
      localStorage.setItem(SLIDER_ORDER_KEY, JSON.stringify(newMap));
      window.dispatchEvent(new Event('kaos_dilio_order_updated'));
    } catch {
      // ignore
    }
    if (onOrderChanged) onOrderChanged(newMap);

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {}
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...items];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setItems(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
    persistOrder(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch drag handlers for mobile devices
  const handleTouchStart = (index) => {
    setDraggedIndex(index);
  };

  const handleTouchMove = (e) => {
    if (draggedIndex === null) return;
    const touch = e.touches[0];
    if (!touch) return;
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const cardEl = targetEl?.closest('[data-reorder-index]');
    if (cardEl) {
      const overIdx = Number(cardEl.getAttribute('data-reorder-index'));
      if (!isNaN(overIdx) && overIdx !== dragOverIndex) {
        setDragOverIndex(overIdx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const updated = [...items];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(dragOverIndex, 0, moved);
      setItems(updated);
      persistOrder(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Quick Move Arrows
  const handleShift = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
    persistOrder(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xs font-black shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-950" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-neutral-900 leading-tight">
                Atur Urutan &amp; Posisi Produk Katalog
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1">
                Tahan &amp; geser (drag &amp; drop) atau klik tombol panah untuk mengatur urutan produk di katalog.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Category Scope Tabs (Sinkron dengan Homepage & Admin Panel) */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-100/90 border-b border-neutral-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto visible-horizontal-scrollbar py-1 w-full">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
                Lingkup:
              </span>
              {categoryTabs.map((tab) => {
                const count = tab.value === 'all'
                  ? products.length
                  : products.filter((p) => filterMatchesCategory(p, tab.value)).length;
                const isActive =
                  filterGroup === tab.value ||
                  (tab.value === 'exclusive' && filterGroup === 'eksklusif') ||
                  (tab.value === 'eksklusif' && filterGroup === 'exclusive');

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setFilterGroup(tab.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                    }`}
                  >
                    {tab.value === 'all' ? `Semua Produk (${count})` : `${tab.label} (${count})`}
                  </button>
                );
              })}
            </div>

            {savedNotice && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-xs shrink-0 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Urutan Tersimpan</span>
              </span>
            )}
          </div>
        </div>

        {/* Instruction Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              Produk dengan nomor urut <b>#1</b> akan tampil di posisi teratas/paling awal katalog.
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-800 shrink-0">
            {items.length} Kaos
          </span>
        </div>

        {/* Draggable Cards Grid */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1">
          {items.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              Belum ada produk pada kategori ini.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
              {items.map((item, index) => {
                const mainImg =
                  item.mockup_angles?.front ||
                  (Array.isArray(item.images) && item.images[0]) ||
                  item.image_url;
                const isDragging = draggedIndex === index;
                const isOver = dragOverIndex === index;

                return (
                  <div
                    key={item.id}
                    data-reorder-index={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={() => handleTouchStart(index)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`relative group bg-white rounded-xl border transition-all duration-200 select-none cursor-grab active:cursor-grabbing overflow-hidden ${
                      isDragging
                        ? 'opacity-40 scale-95 border-dashed border-amber-500'
                        : isOver
                        ? 'border-2 border-amber-500 ring-4 ring-amber-100 scale-102 z-10 shadow-lg'
                        : 'border-neutral-200/90 hover:border-neutral-400 hover:shadow-md'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-neutral-950/85 text-white text-[10px] sm:text-[11px] font-black shadow-xs backdrop-blur-xs">
                      {index === 0 ? <Crown className="w-3 h-3 text-amber-400" /> : null}
                      <span>#{index + 1}</span>
                    </div>

                    {/* Grip Icon */}
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 w-6 h-6 rounded-md bg-white/90 text-neutral-600 flex items-center justify-center shadow-xs">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    {/* Image Preview */}
                    <div className="aspect-[4/5] bg-neutral-100 flex items-center justify-center p-2 relative overflow-hidden">
                      {mainImg ? (
                        <img
                          src={mainImg}
                          alt={item.name}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-lg flex items-center justify-center p-2 text-center text-[10px] font-bold"
                          style={{
                            backgroundColor: item.placeholder_bg || '#E5E7EB',
                            color: item.placeholder_text_color || '#374151',
                          }}
                        >
                          {item.name}
                        </div>
                      )}
                    </div>

                    {/* Info & Shift controls */}
                    <div className="p-2 sm:p-2.5 bg-white border-t border-neutral-100 space-y-1">
                      <p
                        className="text-[11px] sm:text-xs font-extrabold text-neutral-900 truncate leading-snug"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500 font-mono">
                        Rp {Number(item.price || 0).toLocaleString('id-ID')}
                      </p>

                      {/* Quick Move Arrows */}
                      <div className="flex items-center justify-between pt-1 text-neutral-400">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShift(index, index - 1);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 disabled:opacity-20 disabled:hover:bg-neutral-100 cursor-pointer transition-colors"
                          title="Geser ke kiri / depan"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">
                          geser
                        </span>
                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShift(index, index + 1);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 disabled:opacity-20 disabled:hover:bg-neutral-100 cursor-pointer transition-colors"
                          title="Geser ke kanan / belakang"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] text-neutral-500">
            Perubahan posisi langsung tersimpan dan diterapkan di katalog utama.
          </span>
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
