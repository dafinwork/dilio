import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRupiah } from '../utils/helpers';

export default function ProductCard({ product, onSelect }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
  const hasDiscount =
    Boolean(product.original_price) && Number(product.original_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelect && onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setImgIdx(0); // return to primary thumbnail when mouse leaves
      }}
      className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100/80 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Visual Image / Placeholder Box */}
      <div
        className="relative w-full aspect-[4/5] rounded-2xl flex items-center justify-center p-6 text-center select-none overflow-hidden transition-transform duration-500 group-hover:scale-[1.01]"
        style={{
          backgroundColor: displayImage ? '#F3F4F6' : product.placeholder_bg || '#E5E7EB',
        }}
      >
        {/* Floating Badges Left */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 items-start">
          {(product.is_exclusive || product.product_group === 'eksklusif') && (
            <span className="px-2 py-0.5 bg-black text-amber-300 border border-amber-300/30 text-[9px] font-black tracking-wider rounded-sm shadow-xs uppercase">
              Exclusive
            </span>
          )}
          {product.is_new && (
            <span className="px-2 py-0.5 bg-[#5b21b6] text-white text-[10px] font-bold tracking-wider rounded-sm shadow-xs uppercase">
              New
            </span>
          )}
        </div>

        {/* Floating Badges Right (Pre-Order matching Image 2, Discount & Multi-image count) */}
        <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-1.5 items-end">
          {product.is_preorder && (
            <span className="px-2.5 py-1 bg-black text-white text-[9px] sm:text-[10px] font-black tracking-wider rounded-sm shadow-xs uppercase">
              PRE-ORDER
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black tracking-wider rounded-sm shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {totalImages > 1 && (
            <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-xs">
              📷 {totalImages}
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
            className="font-extrabold text-2xl sm:text-3xl lg:text-3xl tracking-tight leading-[1.15] whitespace-pre-line drop-shadow-2xs"
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
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none rounded-2xl" />
      </div>

      {/* Product Information */}
      <div className="pt-4 pb-2 px-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag (Matching Image 1: CASUAL, BASIC, STREETWEAR, etc.) */}
          <span
            className={`text-[11px] font-extrabold tracking-wider uppercase inline-block mb-1 ${
              isMinimalist ? 'text-indigo-600' : 'text-neutral-500'
            }`}
          >
            {product.kaos_category
              ? product.kaos_category.toUpperCase()
              : product.category_label || product.material || 'COTTON COMBED'}
          </span>

          {/* Product Title */}
          <h3 className="font-extrabold text-neutral-900 text-base leading-snug group-hover:text-neutral-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="mt-1 text-xs text-neutral-500 leading-relaxed line-clamp-2 min-h-[2rem]">
            {product.description}
          </p>
        </div>

        {/* Price Section */}
        <div className="mt-4 pt-2 flex items-baseline justify-between border-t border-neutral-100">
          {hasDiscount ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-400 line-through">
                  {formatRupiah(product.original_price)}
                </span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded">
                  Hemat {formatRupiah(Number(product.original_price) - Number(product.price))}
                </span>
              </div>
              <span className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                {formatRupiah(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
              {formatRupiah(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
