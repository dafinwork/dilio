import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const PRESET_BG_COLORS = [
  { name: 'Soft Lilac Grey', hex: '#E5E7EB', text: '#374151' },
  { name: 'Warm Cream White', hex: '#F3F4F6', text: '#374151' },
  { name: 'Slate Blue', hex: '#D5DFEA', text: '#334155' },
  { name: 'Ice Denim', hex: '#CDD9E5', text: '#334155' },
  { name: 'Deep Midnight Navy', hex: '#0B132B', text: '#F8FAFC' },
  { name: 'Vintage Washed Slate', hex: '#7F95A8', text: '#1E293B' },
  { name: 'Cyber Ice Grey', hex: '#DCE4EC', text: '#1E293B' },
];

const PRESET_DOT_COLORS = [
  '#000000',
  '#FFFFFF',
  '#15803D',
  '#2563EB',
  '#DC2626',
  '#FACC15',
  '#1E293B',
  '#94A3B8',
  '#1E40AF',
  '#64748B',
];

export default function ProductFormModal({ product, isOpen, onClose, onSave }) {
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState({
    name: '',
    product_group: 'harian',
    cutting_type: 'oversized',
    sablon_type: 'dtf',
    exclusive_category: 'dilio',
    category_label: 'COTTON COMBED 24S',
    material: 'Cotton Combed 24s',
    price: 65000,
    description: '',
    image_url: '',
    visual_mode: 'mockup',
    is_new: false,
    is_exclusive: false,
    placeholder_title: '',
    placeholder_bg: '#E5E7EB',
    placeholder_text_color: '#374151',
    colors: ['#000000', '#FFFFFF', '#15803D'],
    extra_colors_count: 12,
  });

  const [customColor, setCustomColor] = useState('#000000');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        product_group: product.product_group || 'harian',
        cutting_type: product.cutting_type || 'oversized',
        sablon_type: product.sablon_type || 'dtf',
        exclusive_category: product.exclusive_category || 'dilio',
        category_label: product.category_label || '',
        material: product.material || '',
        price: product.price || 0,
        description: product.description || '',
        image_url: product.image_url || '',
        visual_mode: product.image_url ? 'image' : 'mockup',
        is_new: Boolean(product.is_new),
        is_exclusive: Boolean(product.is_exclusive),
        placeholder_title: product.placeholder_title || product.name || '',
        placeholder_bg: product.placeholder_bg || '#E5E7EB',
        placeholder_text_color: product.placeholder_text_color || '#374151',
        colors: product.colors || [],
        extra_colors_count: product.extra_colors_count || 0,
      });
    } else {
      setFormData({
        name: '',
        product_group: 'harian',
        cutting_type: 'oversized',
        sablon_type: 'dtf',
        exclusive_category: 'dilio',
        category_label: 'COTTON COMBED 24S',
        material: 'Cotton Combed 24s',
        price: 65000,
        description: 'Potongan longgar dengan drop shoulder, cocok untuk gaya streetwear.',
        image_url: '',
        visual_mode: 'mockup',
        is_new: false,
        is_exclusive: false,
        placeholder_title: 'Oversized\nFit',
        placeholder_bg: '#E5E7EB',
        placeholder_text_color: '#374151',
        colors: ['#000000', '#FFFFFF', '#15803D'],
        extra_colors_count: 12,
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          setFormData((prev) => ({
            ...prev,
            image_url: publicUrlData.publicUrl,
            visual_mode: 'image',
          }));
          setIsUploading(false);
          return;
        }
      }

      // Fallback to base64 if storage bucket not initialized
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image_url: reader.result,
          visual_mode: 'image',
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image_url: reader.result,
          visual_mode: 'image',
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Auto adjust labels based on selections
      if (name === 'product_group') {
        if (value === 'harian') {
          updated.category_label = 'COTTON COMBED 24S';
          updated.is_exclusive = false;
        } else if (value === 'custom') {
          updated.category_label = 'GRAPHIC TEES';
          updated.is_exclusive = false;
        } else if (value === 'eksklusif') {
          updated.category_label = 'STREETWEAR';
          updated.is_exclusive = true;
        }
      }
      return updated;
    });
  };

  const addColorDot = (hex) => {
    if (!formData.colors.includes(hex)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, hex],
      }));
    }
  };

  const removeColorDot = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama produk wajib diisi.');
      return;
    }

    const payload = {
      ...formData,
      cutting_type: formData.product_group === 'harian' ? formData.cutting_type : null,
      sablon_type: formData.product_group === 'custom' ? formData.sablon_type : null,
      exclusive_category: formData.product_group === 'eksklusif' ? formData.exclusive_category : null,
      placeholder_title: formData.placeholder_title || formData.name,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h3 className="text-xl font-black text-neutral-900">
              {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kelola data katalog produk Kaos Dilio (Otomatis sync ke website).
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* 1. Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Nama Produk *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Oversized Fit"
                required
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Grup Produk (Halaman) *
              </label>
              <select
                name="product_group"
                value={formData.product_group}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="harian">Kaos Harian (Koleksi Kaos)</option>
                <option value="custom">Bikin Kaos Custom (Sablon)</option>
                <option value="eksklusif">Desain Eksklusif (Limited)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Harga (Rp) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="65000"
                required
                min="0"
                step="1000"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* 2. Category Sub-filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            {formData.product_group === 'harian' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Tipe Cutting (Filter Harian)
                </label>
                <select
                  name="cutting_type"
                  value={formData.cutting_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="oversized">Oversized Fit</option>
                  <option value="reguler">Reguler Fit</option>
                  <option value="boxy">Boxy Cut</option>
                  <option value="long-sleeve">Long Sleeve</option>
                </select>
              </div>
            )}

            {formData.product_group === 'custom' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Jenis Sablon (Filter Custom)
                </label>
                <select
                  name="sablon_type"
                  value={formData.sablon_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="dtf">DTF (Direct to Film)</option>
                  <option value="plastisol">Plastisol</option>
                </select>
              </div>
            )}

            {formData.product_group === 'eksklusif' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Kategori Brand Eksklusif
                </label>
                <select
                  name="exclusive_category"
                  value={formData.exclusive_category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="dilio">Dilio (Brand Sendiri)</option>
                  <option value="thinking-out">Thinking Out (Partner Brand)</option>
                  <option value="dilio-x-one-piece">Dilio x One Piece (Collab)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Label Kategori di Card
              </label>
              <input
                type="text"
                name="category_label"
                value={formData.category_label}
                onChange={handleChange}
                placeholder="Contoh: COTTON COMBED 24S / STREETWEAR"
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* 3. Material & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Bahan Kain
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="Cotton Combed 24s"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Badges Toggle */}
            <div className="flex items-center gap-6 pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-neutral-700">
                <input
                  type="checkbox"
                  name="is_new"
                  checked={formData.is_new}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Badge "New" (Ungu)</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-neutral-700">
                <input
                  type="checkbox"
                  name="is_exclusive"
                  checked={formData.is_exclusive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-black focus:ring-black"
                />
                <span>Badge "Exclusive" (Hitam)</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Deskripsi Singkat (1-2 Baris)
              </label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Potongan longgar dengan drop shoulder, cocok untuk gaya streetwear."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* 4. Visual Card Appearance (Mockup Pastel vs Real Photo) */}
          <div className="border-t border-neutral-100 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Tampilan Visual Produk (Card Preview)
              </h4>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, visual_mode: 'mockup' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    formData.visual_mode === 'mockup'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  🎨 Mockup Pastel
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, visual_mode: 'image' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    formData.visual_mode === 'image'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  📷 Foto Asli Produk
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Live Preview Card */}
              <div
                className="w-36 h-44 rounded-2xl flex flex-col items-center justify-center p-3 text-center shadow-xs border border-neutral-200/50 shrink-0 relative overflow-hidden"
                style={{
                  backgroundColor: formData.visual_mode === 'image' && formData.image_url ? '#F3F4F6' : formData.placeholder_bg,
                }}
              >
                {formData.is_exclusive && (
                  <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-black text-white text-[9px] font-bold rounded-xs shadow-xs">
                    EXCLUSIVE
                  </span>
                )}
                {formData.is_new && (
                  <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-[#5b21b6] text-white text-[9px] font-bold rounded-xs shadow-xs">
                    NEW
                  </span>
                )}

                {formData.visual_mode === 'image' && formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-base font-extrabold whitespace-pre-line leading-tight"
                    style={{ color: formData.placeholder_text_color }}
                  >
                    {formData.placeholder_title || 'Teks Produk'}
                  </span>
                )}
              </div>

              {/* Controls depending on mode */}
              <div className="flex-1 space-y-3 w-full">
                {formData.visual_mode === 'image' ? (
                  <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-neutral-700">
                          Upload Foto Produk (Maks 5MB)
                        </label>
                        {isUploading && (
                          <span className="text-[11px] font-bold text-neutral-900 inline-flex items-center gap-1 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Mengunggah ke Cloud...
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleImageUpload}
                        className="w-full text-xs text-neutral-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Atau Tempel URL Gambar Online
                      </label>
                      <input
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            image_url: e.target.value,
                            visual_mode: 'image',
                          }))
                        }
                        placeholder="https://images.unsplash.com/... atau link foto"
                        className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    {formData.image_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            image_url: '',
                            visual_mode: 'mockup',
                          }))
                        }
                        className="text-xs text-red-600 hover:underline font-semibold block"
                      >
                        Hapus Foto &amp; Kembali ke Mockup Pastel
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Teks Mockup (Gunakan enter/baris baru)
                      </label>
                      <input
                        type="text"
                        name="placeholder_title"
                        value={formData.placeholder_title}
                        onChange={handleChange}
                        placeholder="Contoh: Oversized\nFit"
                        className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Pilih Warna Background Card (Preset Mockup)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_BG_COLORS.map((preset) => (
                          <button
                            type="button"
                            key={preset.hex}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                placeholder_bg: preset.hex,
                                placeholder_text_color: preset.text,
                              }))
                            }
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                              formData.placeholder_bg === preset.hex
                                ? 'ring-2 ring-neutral-900 border-transparent scale-110'
                                : 'border-neutral-300 hover:scale-105'
                            }`}
                            style={{ backgroundColor: preset.hex }}
                            title={preset.name}
                          >
                            {formData.placeholder_bg === preset.hex && (
                              <Check
                                className="w-3.5 h-3.5"
                                style={{ color: preset.text }}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 5. Color Dots Swatches */}
          <div className="border-t border-neutral-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Varian Warna (Lingkaran di Bawah Card)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium">+Angka Tambahan:</span>
                <input
                  type="number"
                  name="extra_colors_count"
                  value={formData.extra_colors_count}
                  onChange={handleChange}
                  min="0"
                  className="w-16 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-center font-bold"
                  placeholder="12"
                />
              </div>
            </div>

            {/* Selected dots */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 min-h-[46px]">
              {formData.colors.map((hex, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 bg-white rounded-full border border-neutral-200 shadow-2xs text-xs"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-neutral-300 inline-block shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="font-mono text-[10px] text-neutral-600">{hex}</span>
                  <button
                    type="button"
                    onClick={() => removeColorDot(idx)}
                    className="text-neutral-400 hover:text-red-500 ml-0.5"
                    title="Hapus warna"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formData.colors.length === 0 && (
                <span className="text-xs text-neutral-400 italic">
                  Belum ada warna dipilih. Klik tombol preset di bawah.
                </span>
              )}
            </div>

            {/* Preset quick add */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-neutral-400 mr-1">Tambah cepat:</span>
              {PRESET_DOT_COLORS.map((hex) => (
                <button
                  type="button"
                  key={hex}
                  onClick={() => addColorDot(hex)}
                  className="w-6 h-6 rounded-full border border-neutral-300 hover:scale-110 transition-transform shadow-2xs"
                  style={{ backgroundColor: hex }}
                  title={`Tambah ${hex}`}
                />
              ))}
              <div className="flex items-center gap-1 ml-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border border-neutral-200"
                />
                <button
                  type="button"
                  onClick={() => addColorDot(customColor)}
                  className="px-2 py-0.5 bg-neutral-200 hover:bg-neutral-300 text-[11px] font-bold rounded"
                >
                  + Custom
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs shadow-md hover:bg-neutral-800 transition-colors"
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
