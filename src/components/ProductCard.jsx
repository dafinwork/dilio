import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react';
import { formatRupiah, computeDiscountInfo, recordProductClick } from '../utils/helpers';
import { getDisplayCategoryLabel } from '../utils/categoryManager';

export default function ProductCard({ product, onSelect }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (product?.id) {
      recordProductClick(product.id);
    }
    if (onSelect) onSelect(product);
  };

  const handleOpenVideo = (e) => {
    e.stopPropagation();
    if (product?.id) {
      recordProductClick(product.id);
    }
    if (onSelect) onSelect({ ...product, initialViewMode: 'video' });
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (!product) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#/?p=${encodeURIComponent(product.id)}`;
    const shareData = {
      title: product.name,
      text: `Lihat produk ${product.name} di Kaos Dilio: ${formatRupiah(product.price)}`,
      url: shareUrl,
    };

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard if cancelled or failed
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Salin link produk ini:', shareUrl);
    }
  };

  // Resolve images list safely before any hook or return
  const images =
    product && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product?.image_url
      ? [product.image_url]
      : [];
  const totalImages = images.length;
  const safeIdx = imgIdx < totalImages ? imgIdx : 0;
  const displayImage = images[safeIdx] || '';

  // Auto-slide when hovered on card (every 1.6s)
  useEffect(() => {
    if (!product || !isHovered || totalImages <= 1) return;
    const interval = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % totalImages);
    }, 1600);
    return () => clearInterval(interval);
  }, [product, isHovered, totalImages]);

  if (!product) return null;

  const isMinimalist = product.category_label === 'MINIMALIST';
  const { hasDiscount, displayOriginalPrice, discountPercent, savings } =
    computeDiscountInfo(product.price, product.original_price);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setImgIdx(0); // return to primary thumbnail when mouse leaves
      }}
      className="group relative cursor-pointer flex flex-col bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-100/80 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Visual Image / Placeholder Box */}
      <div
        className="relative w-full aspect-[4/5] rounded-xl sm:rounded-2xl flex items-center justify-center p-3 sm:p-6 text-center select-none overflow-hidden transition-transform duration-500 group-hover:scale-[1.01]"
        style={{
          backgroundColor: displayImage ? '#F3F4F6' : product.placeholder_bg || '#E5E7EB',
        }}
      >
        {/* Floating Badges Left */}
        <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-10 flex flex-col gap-1 sm:gap-1.5 items-start">
          {(product.is_exclusive || product.product_group === 'eksklusif') && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-black text-amber-300 border border-amber-300/30 text-[8px] sm:text-[9px] font-black tracking-wider rounded-sm shadow-xs uppercase">
              Exclusive
            </span>
          )}
          {product.is_new && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-[#5b21b6] text-white text-[8px] sm:text-[10px] font-bold tracking-wider rounded-sm shadow-xs uppercase">
              New
            </span>
          )}
          {product.video_url && (
            <button
              type="button"
              onClick={handleOpenVideo}
              className="px-1.5 sm:px-2 py-0.5 bg-red-600 text-white text-[8px] sm:text-[9px] font-black tracking-wider rounded-sm shadow-xs uppercase flex items-center gap-1 cursor-pointer hover:bg-red-700 transition-colors"
              title="Putar video produk"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>▶ Video</span>
            </button>
          )}
        </div>

        {/* Hover Video Indicator */}
        {product.video_url && (
          <div className="absolute inset-0 z-15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="px-3 py-1.5 bg-neutral-900/85 backdrop-blur-xs rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg border border-white/20">
              <span className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[9px] font-bold leading-none">
                ▶
              </span>
              <span>Lihat Video</span>
            </div>
          </div>
        )}

        {/* Floating Badges Right (Pre-Order matching Image 2, Discount & Multi-image count) */}
        <div className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 z-10 flex flex-col gap-1 sm:gap-1.5 items-end">
          {product.is_preorder && (
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-black text-white text-[8px] sm:text-[10px] font-black tracking-wider rounded-sm shadow-xs uppercase">
              PRE-ORDER
            </span>
          )}
          {hasDiscount && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-red-600 text-white text-[8px] sm:text-[10px] font-black tracking-wider rounded-sm shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Real Image or Mockup Typography */}
        {displayImage ? (
          <img
            key={displayImage}
            src={displayImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 animate-in fade-in"
          />
        ) : (
          <div
            className="font-extrabold text-lg sm:text-3xl tracking-tight leading-[1.15] whitespace-pre-line drop-shadow-2xs"
            style={{
              color: product.placeholder_text_color || '#1E293B',
            }}
          >
            {product.placeholder_title || product.name}
          </div>
        )}

        {/* Slider controls directly on card when product has >1 photo */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImgIdx((prev) => (prev - 1 + totalImages) % totalImages);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Foto sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImgIdx((prev) => (prev + 1) % totalImages);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Foto berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIdx(i);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    i === safeIdx ? 'bg-white w-3.5' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Subtle hover overlay hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none rounded-xl sm:rounded-2xl" />
      </div>

      {/* Product Information */}
      <div className="pt-2.5 sm:pt-4 pb-2 px-1.5 sm:px-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag (Matching Image 1: CASUAL, BASIC, STREETWEAR, etc.) */}
          <span
            className={`text-[9px] sm:text-[11px] font-extrabold tracking-wider uppercase inline-block mb-0.5 sm:mb-1 ${
              isMinimalist ? 'text-indigo-600' : 'text-neutral-500'
            }`}
          >
            {getDisplayCategoryLabel(product)}
          </span>

          {/* Product Title */}
          <h3 className="font-bold text-neutral-900 text-xs sm:text-base leading-snug group-hover:text-neutral-700 transition-colors line-clamp-2 min-h-[1.8rem] sm:min-h-0 sm:line-clamp-1">
            {product.name}
          </h3>

          {/* Short Description (Hidden on mobile 2-col to keep card compact like Brodo) */}
          <p className="hidden sm:block mt-1 text-xs text-neutral-500 leading-relaxed line-clamp-2 min-h-[2rem]">
            {product.description}
          </p>
        </div>

        {/* Price & Actions Section (Stok & Share) */}
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 flex items-end justify-between gap-1 sm:gap-2 border-t border-neutral-100">
          {/* Price */}
          <div className="flex flex-col min-w-0">
            {hasDiscount ? (
              <>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] text-neutral-400 line-through">
                    {formatRupiah(displayOriginalPrice)}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-[8px] sm:text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-base font-black text-neutral-900 tracking-tight truncate">
                  {formatRupiah(product.price)}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-base font-black text-neutral-900 tracking-tight truncate">
                {formatRupiah(product.price)}
              </span>
            )}
          </div>

          {/* Sisa Stok & Tombol Share */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <span
              className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 whitespace-nowrap"
              title="Jumlah stok tersedia"
            >
              <span className="hidden sm:inline">Stok: </span>
              <span className="text-neutral-900 font-extrabold">{product.stock ?? 100}</span>
            </span>

            <button
              type="button"
              onClick={handleShare}
              className={`p-1 sm:p-1.5 rounded-full border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 scale-105'
                  : 'bg-white hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 border-neutral-200'
              }`}
              title={copied ? 'Tautan disalin!' : 'Bagikan produk ini'}
              aria-label="Bagikan produk"
            >
              {copied ? (
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
              ) : (
                <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Copied Toast on Card */}
      {copied && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-neutral-950 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg pointer-events-none animate-in fade-in zoom-in-95">
          Tautan Disalin!
        </div>
      )}
    </div>
  );
}
