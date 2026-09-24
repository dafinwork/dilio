import { useEffect } from 'react';
import { X, MessageCircle, Check, Tag } from 'lucide-react';
import { formatRupiah, getWhatsAppUrl, safeColors } from '../utils/helpers';

export default function ProductModal({ product, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-600 hover:text-neutral-900 shadow-sm flex items-center justify-center transition-colors"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Visual Showcase */}
          <div
            className="sm:w-1/2 aspect-square flex items-center justify-center p-8 relative text-center"
            style={{ backgroundColor: product.placeholder_bg || '#E5E7EB' }}
          >
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.is_exclusive && (
                <span className="px-2.5 py-1 bg-black text-white text-[11px] font-bold tracking-wider rounded-sm uppercase">
                  Exclusive
                </span>
              )}
              {product.is_new && (
                <span className="px-2.5 py-1 bg-[#5b21b6] text-white text-[11px] font-bold tracking-wider rounded-sm uppercase">
                  New
                </span>
              )}
            </div>

            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="font-extrabold text-3xl tracking-tight leading-tight whitespace-pre-line"
                style={{ color: product.placeholder_text_color || '#1E293B' }}
              >
                {product.placeholder_title || product.name}
              </div>
            )}
          </div>

          {/* Details Content */}
          <div className="p-6 sm:w-1/2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  <Tag className="w-3 h-3" />
                  {product.category_label || 'KATALOG'}
                </span>
                {product.product_group && (
                  <span className="text-[11px] font-semibold text-neutral-400 capitalize">
                    {product.product_group}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-neutral-900 leading-snug">
                {product.name}
              </h2>

              <p className="text-2xl font-extrabold text-neutral-900">
                {formatRupiah(product.price)}
              </p>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>

              {/* Specs List */}
              <div className="pt-2 text-xs space-y-1.5 border-t border-neutral-100 text-neutral-600">
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

              {/* Available Colors */}
              {safeColors(product.colors).length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-neutral-400 block mb-1.5">Pilihan Warna:</span>
                  <div className="flex items-center gap-2">
                    {safeColors(product.colors).map((hex, idx) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded-full border border-neutral-300 shadow-2xs inline-block"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    {Number(product.extra_colors_count) > 0 && (
                      <span className="text-xs text-neutral-500 font-medium">
                        +{product.extra_colors_count} varian lainnya
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <a
                href={getWhatsAppUrl(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Konsultasi / Order via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
