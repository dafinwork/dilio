import { formatRupiah, safeColors } from '../utils/helpers';

export default function ProductCard({ product, onSelect }) {
  const isMinimalist = product.category_label === 'MINIMALIST';
  const colorList = safeColors(product.colors);

  return (
    <div
      onClick={() => onSelect && onSelect(product)}
      className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100/80 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Visual Image / Placeholder Box */}
      <div
        className="relative w-full aspect-[4/5] rounded-2xl flex items-center justify-center p-6 text-center select-none overflow-hidden transition-transform duration-500 group-hover:scale-[1.01]"
        style={{
          backgroundColor: product.image_url ? '#F3F4F6' : product.placeholder_bg || '#E5E7EB',
        }}
      >
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
          {product.is_exclusive && (
            <span className="px-2.5 py-1 bg-black text-white text-[11px] font-bold tracking-wider rounded-sm shadow-xs uppercase">
              Exclusive
            </span>
          )}
          {product.is_new && (
            <span className="px-2.5 py-1 bg-[#5b21b6] text-white text-[11px] font-bold tracking-wider rounded-sm shadow-xs uppercase">
              New
            </span>
          )}
        </div>

        {/* Real Image or Mockup Typography */}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

        {/* Subtle hover overlay hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none rounded-2xl" />
      </div>

      {/* Product Information */}
      <div className="pt-4 pb-2 px-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Material Label */}
          <span
            className={`text-[11px] font-bold tracking-wider uppercase inline-block mb-1 ${
              isMinimalist ? 'text-indigo-600' : 'text-neutral-500'
            }`}
          >
            {product.category_label || product.material || 'COTTON COMBED'}
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

        {/* Price & Color Swatches */}
        <div className="mt-4 pt-2 flex items-center justify-between gap-2 border-t border-neutral-100">
          <span className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
            {formatRupiah(product.price)}
          </span>

          {/* Color Dots */}
          {colorList.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              {colorList.slice(0, 3).map((hex, idx) => (
                <span
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs inline-block"
                  style={{ backgroundColor: hex }}
                  title={`Warian warna ${idx + 1}`}
                />
              ))}

              {Number(product.extra_colors_count) > 0 && (
                <span className="text-[11px] font-semibold text-neutral-400 pl-0.5">
                  +{product.extra_colors_count}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
