import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, MessageCircle, Ruler, Clock, ChevronLeft, ChevronRight, Tag, Brush } from 'lucide-react';
import { formatRupiah, getWhatsAppUrl, safeColors, getColorName, normalizeCutting, computeDiscountInfo } from '../utils/helpers';
import SizeChartModal from './SizeChartModal';

export default function ProductModal({ product, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !sizeChartOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, sizeChartOpen]);

  // Resolve images list safely before early returns
  const images =
    product && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product?.image_url
      ? [product.image_url]
      : [];

  // Auto-slide every 3.5 seconds if product has multiple photos (pauses on hover)
  useEffect(() => {
    if (!product || images.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [product, images.length, isPaused]);

  // Early return ONLY after all hooks have been declared unconditionally
  if (!product) return null;

  const currentImage = images[activeImageIndex] || '';

  const { hasDiscount, displayOriginalPrice, discountPercent, savings } =
    computeDiscountInfo(product.price, product.original_price);

  const nextImage = () => {
    if (images.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Map katalog product -> model studio custom (dipakai tombol "Desain Custom")
  const getStudioDesignUrl = (prod) => {
    if (!prod) return '/bikin-kaos-custom';
    const cut = normalizeCutting(prod.cutting_type);
    const cat = (prod.kaos_category || prod.category_label || '').toLowerCase();
    const modelId =
      cat.includes('hoodie') || cat.includes('jaket') || cat.includes('jacket')
        ? 'dilio-heavy-hoodie'
        : cat.includes('polo')
        ? 'dilio-polo-24s'
        : cat.includes('olahraga') || cat.includes('sport') || cut === 'olahraga'
        ? 'dilio-pro-sport'
        : cut === 'boxy'
        ? 'dilio-boxy'
        : cut === 'fitted'
        ? 'dilio-fitted'
        : cut === 'long-sleeve'
        ? 'dilio-long-sleeve'
        : cut === 'regular'
        ? 'dilio-regular'
        : 'dilio-oversize';

    // Warna dikirim sebagai hex katalog pertama; studio akan mengarahkan ke warna terdekat
    const colorList = safeColors(prod.colors);
    const params = new URLSearchParams({ model: modelId });
    if (colorList[0]) params.set('warna', colorList[0]);
    if (prod.name) params.set('produk', prod.name);
    if (prod.id) params.set('produk_id', String(prod.id));
    const photo = currentImage || prod.image_url || (prod.images && prod.images[0]);
    if (photo) params.set('foto', photo);
    if (prod.mockup_angles?.back) params.set('foto_back', prod.mockup_angles.back);
    if (prod.mockup_angles?.left) params.set('foto_left', prod.mockup_angles.left);
    if (prod.mockup_angles?.right) params.set('foto_right', prod.mockup_angles.right);
    return `/bikin-kaos-custom?${params.toString()}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Dialog */}
        <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 animate-in zoom-in-95 duration-200">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-600 hover:text-neutral-900 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row">
            {/* Visual Showcase (Multi-Image Gallery or Mockup) */}
            <div
              className="sm:w-1/2 flex flex-col bg-white"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="relative w-full aspect-square sm:aspect-[4/5] sm:h-full min-h-[340px] sm:min-h-[420px] flex items-center justify-center text-center overflow-hidden"
                style={{ backgroundColor: currentImage ? '#FFFFFF' : product.placeholder_bg || '#E5E7EB' }}
              >
                {/* Floating Badges Left */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                  {(product.is_exclusive || product.product_group === 'eksklusif') && (
                    <span className="px-2.5 py-1 bg-black text-amber-300 border border-amber-300/30 text-[10px] font-black tracking-wider rounded-sm uppercase">
                      Exclusive
                    </span>
                  )}
                  {product.is_new && (
                    <span className="px-2.5 py-1 bg-[#5b21b6] text-white text-[10px] font-bold tracking-wider rounded-sm uppercase">
                      New
                    </span>
                  )}
                  {product.is_preorder && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white text-[10px] font-black tracking-wider rounded-sm uppercase">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pre-Order</span>
                    </span>
                  )}
                </div>

                {/* Floating Badges Right */}
                {hasDiscount && (
                  <div className="absolute top-4 right-14 sm:right-4 z-10">
                    <span className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-black tracking-wider rounded-sm shadow-sm flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>-{discountPercent}%</span>
                    </span>
                  </div>
                )}

                {/* Main Visual Display - matches ProductCard 1:1 (object-cover edge-to-edge without padding) */}
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${product.name} foto ${activeImageIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div
                    className="font-extrabold text-3xl tracking-tight leading-tight whitespace-pre-line p-6"
                    style={{ color: product.placeholder_text_color || '#1E293B' }}
                  >
                    {product.placeholder_title || product.name}
                  </div>
                )}

                {/* Left / Right Arrow Buttons if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Foto sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Foto berikutnya"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Multi-Image Thumbnail Row */}
              {images.length > 1 && (
                <div className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-neutral-900 scale-105 shadow-xs'
                          : 'border-neutral-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Content */}
            <div className="p-6 sm:w-1/2 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Category Label */}
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {product.category_label || product.material || 'KATALOG KAOS'}
                </span>

                <h2 className="text-xl font-black text-neutral-900 leading-snug">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div>
                  {hasDiscount ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-400 line-through">
                          {formatRupiah(displayOriginalPrice)}
                        </span>
                        {discountPercent > 0 && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Diskon {discountPercent}% (Hemat {formatRupiah(savings)})
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-black text-neutral-900 mt-0.5">
                        {formatRupiah(product.price)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl font-extrabold text-neutral-900">
                      {formatRupiah(product.price)}
                    </p>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Specs List (Matching Image 2) */}
                <div className="pt-2 text-xs space-y-1.5 border-t border-neutral-100 text-neutral-600">
                  {product.is_preorder && (
                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
                      <span className="text-neutral-500 font-semibold">Pre-order :</span>
                      <span className="font-bold text-neutral-900">
                        {product.preorder_duration || '1-2 Hari'}
                      </span>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-neutral-400">Bahan Kain:</span>
                      <span className="font-semibold text-neutral-800">{product.material}</span>
                    </div>
                  )}
                  {product.cutting_type && (
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-neutral-400">Pola Potongan:</span>
                      <span className="font-semibold text-neutral-800 capitalize">
                        {product.cutting_type}
                      </span>
                    </div>
                  )}
                  {product.sablon_type && (
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-neutral-400">Teknik Sablon:</span>
                      <span className="font-semibold text-neutral-800 uppercase">
                        {product.sablon_type}
                      </span>
                    </div>
                  )}
                </div>

                {/* Warna Produk */}
                {(product.color_hex || safeColors(product.colors).length > 0) && (
                  <div className="pt-2">
                    <span className="text-xs text-neutral-400 block mb-1.5">Warna:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const allHexes = safeColors(product.colors);
                        const listToShow =
                          allHexes.length > 0
                            ? allHexes
                            : [product.color_hex || product.selected_color || '#000000'];
                        return listToShow.map((hex, i) => {
                          const cName = getColorName(hex);
                          return (
                            <div
                              key={`${hex}-${i}`}
                              className="inline-flex items-center gap-2 px-2.5 py-1 bg-neutral-50 rounded-xl border border-neutral-200"
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-neutral-300 shadow-2xs inline-block"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-xs font-semibold text-neutral-800">
                                {cName}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Size Chart Trigger Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setSizeChartOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 cursor-pointer transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Lihat Panduan Size Chart Kaos</span>
                  </button>
                </div>
              </div>

              {/* CTA WhatsApp & Desain Custom Buttons */}
              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <a
                  href={getWhatsAppUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>
                    {product.is_preorder ? 'Pre-Order via WhatsApp' : 'Konsultasi / Order via WhatsApp'}
                  </span>
                </a>

                <Link
                  to={getStudioDesignUrl(product)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-neutral-950 rounded-xl text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Brush className="w-4 h-4" />
                  <span>Desain Custom Kaos Ini</span>
                </Link>
                <p className="text-center text-[10px] text-neutral-400">
                  Langsung terbuka di studio mockup: model sesuai kaos yang kamu pilih
                  {product.cutting_type ? ` (Cutting: ${product.cutting_type})` : ''}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        defaultType={product.cutting_type || 'regular'}
        customChart={product.size_chart || null}
        productName={product.name}
      />
    </>
  );
}
