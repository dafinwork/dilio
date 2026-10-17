import { useState, useEffect } from 'react';
import { X, Check, Loader2, Palette } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getColorName, safeColors, COLOR_DICTIONARY } from '../../utils/helpers';

const PRESET_BG_COLORS = [
  { name: 'Soft Lilac Grey', hex: '#E5E7EB', text: '#374151' },
  { name: 'Warm Cream White', hex: '#F3F4F6', text: '#374151' },
  { name: 'Slate Blue', hex: '#D5DFEA', text: '#334155' },
  { name: 'Ice Denim', hex: '#CDD9E5', text: '#334155' },
  { name: 'Deep Midnight Navy', hex: '#0B132B', text: '#F8FAFC' },
  { name: 'Vintage Washed Slate', hex: '#7F95A8', text: '#1E293B' },
  { name: 'Cyber Ice Grey', hex: '#DCE4EC', text: '#1E293B' },
];

// Presets for quick single-color fabric selection
const PRESET_FABRIC_COLORS = [
  { hex: '#000000', name: 'Hitam' },
  { hex: '#FFFFFF', name: 'Putih' },
  { hex: '#15803D', name: 'Hijau Botol' },
  { hex: '#16A34A', name: 'Hijau Daun' },
  { hex: '#2563EB', name: 'Biru Royal' },
  { hex: '#1E40AF', name: 'Biru Benhur' },
  { hex: '#1E293B', name: 'Navy / Dark Slate' },
  { hex: '#DC2626', name: 'Merah Cabe' },
  { hex: '#B91C1C', name: 'Merah Maroon' },
  { hex: '#FACC15', name: 'Kuning Kenari' },
  { hex: '#F59E0B', name: 'Kuning Mustard' },
  { hex: '#94A3B8', name: 'Abu Muda / Misty' },
  { hex: '#64748B', name: 'Abu Tua / Charcoal' },
  { hex: '#D8B4FE', name: 'Lilac Purple' },
  { hex: '#A16207', name: 'Cokelat Karamel' },
];

export default function ProductFormModal({ product, isOpen, onClose, onSave }) {
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState({
    name: '',
    product_group: 'harian',
    cutting_type: 'oversize',
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
    show_on_homepage: false,
    placeholder_title: '',
    placeholder_bg: '#E5E7EB',
    placeholder_text_color: '#374151',
  });

  // PRD 6.2: Single color variant per card (Color picker + Hex code)
  const [selectedHex, setSelectedHex] = useState('#000000');
  const [selectedColorName, setSelectedColorName] = useState('Hitam');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (product) {
      const initialColors = safeColors(product.colors);
      const firstColor = initialColors[0] || { hex: '#000000', name: 'Hitam' };

      setFormData({
        name: product.name || '',
        product_group: product.product_group || 'harian',
        cutting_type: product.cutting_type || 'oversize',
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
        show_on_homepage: Boolean(
          product.show_on_homepage ??
          product.show_in_homepage ??
          (initialColors[0]?.show_on_homepage) ??
          (product.is_exclusive && product.product_group === 'eksklusif')
        ),
        placeholder_title: product.placeholder_title || product.name || '',
        placeholder_bg: product.placeholder_bg || '#E5E7EB',
        placeholder_text_color: product.placeholder_text_color || '#374151',
      });

      setSelectedHex(firstColor.hex);
      setSelectedColorName(firstColor.name || getColorName(firstColor.hex));
    } else {
      setFormData({
        name: '',
        product_group: 'harian',
        cutting_type: 'oversize',
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
        show_on_homepage: false,
        placeholder_title: 'Oversized\nFit',
        placeholder_bg: '#E5E7EB',
        placeholder_text_color: '#374151',
      });

      setSelectedHex('#000000');
      setSelectedColorName('Hitam');
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
    } catch (err) {
      console.error('Upload catch error:', err);
      setIsUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectColorPreset = (preset) => {
    setSelectedHex(preset.hex);
    setSelectedColorName(preset.name);
  };

  const handleHexInputChange = (newHex) => {
    setSelectedHex(newHex);
    // Auto-fill color name if found in dictionary
    const detected = getColorName(newHex);
    if (detected && detected !== newHex) {
      setSelectedColorName(detected);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama produk wajib diisi.');
      return;
    }

    const { visual_mode, ...cleanFormData } = formData;

    // PRD Section 4 & 6.2: 1 varian warna = 1 kartu
    const finalColorObject = {
      hex: selectedHex,
      name: selectedColorName || getColorName(selectedHex),
      show_on_homepage: formData.show_on_homepage,
    };

    const payload = {
      ...cleanFormData,
      colors: [finalColorObject],
      extra_colors_count: 0,
      cutting_type: formData.cutting_type || 'regular',
      sablon_type: formData.product_group === 'custom' ? formData.sablon_type : null,
      exclusive_category: formData.product_group === 'eksklusif' ? formData.exclusive_category : null,
      placeholder_title: formData.placeholder_title || formData.name,
      show_on_homepage: formData.show_on_homepage,
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
              Kelola data katalog produk Kaos Dilio (1 Varian Warna = 1 Kartu Katalog).
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
                placeholder="Contoh: Oversized Fit - Hitam"
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
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* 2. Tipe Cutting (PRD 5.1 & 6.3) & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-100 pt-5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Tipe Cutting Kaos *
              </label>
              <select
                name="cutting_type"
                value={formData.cutting_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
              >
                <option value="regular">Regular Fit</option>
                <option value="oversize">Oversized Fit</option>
                <option value="boxy">Boxy Cut</option>
                <option value="long-sleeve">Long Sleeve</option>
                <option value="fitted">Fitted</option>
              </select>
            </div>

            {formData.product_group === 'custom' ? (
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Jenis Sablon
                </label>
                <select
                  name="sablon_type"
                  value={formData.sablon_type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="dtf">DTF (Direct to Film)</option>
                  <option value="plastisol">Plastisol</option>
                </select>
              </div>
            ) : (
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
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            )}
          </div>

          {/* 3. TAMPILKAN DI HOMEPAGE (PRD 6.1) & BADGES */}
          <div className="border-t border-neutral-100 pt-5 space-y-3">
            <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Promosi &amp; Visibilitas
            </label>

            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="show_on_homepage"
                  checked={formData.show_on_homepage}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-sky-400 text-sky-600 focus:ring-sky-500 accent-sky-600 cursor-pointer mt-0.5"
                />
                <div>
                  <span className="font-extrabold text-neutral-900 text-sm flex items-center gap-1.5">
                    ⭐ Tampilkan di Homepage (Section Promo / Eksklusif)
                  </span>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    Centang agar kaos ini langsung tampil di section promo warna navy pada halaman utama homepage.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-neutral-700">
                <input
                  type="checkbox"
                  name="is_exclusive"
                  checked={formData.is_exclusive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-black focus:ring-black accent-black"
                />
                <span>Label &quot;Eksklusif&quot; pada Card (PRD 3.3)</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-neutral-700">
                <input
                  type="checkbox"
                  name="is_new"
                  checked={formData.is_new}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                />
                <span>Badge &quot;New&quot; (Ungu)</span>
              </label>
            </div>
          </div>

          {/* 4. WARNA & KODE HEX (PRD 6.2 - Color Picker + Input Kode Hex) */}
          <div className="border-t border-neutral-100 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Warna Varian Produk &amp; Kode Hex
                </label>
                <p className="text-xs text-neutral-500 mt-0.5">
                  1 kartu mewakili 1 varian warna. Kode hex dipakai internal untuk referensi ke supplier kain.
                </p>
              </div>
            </div>

            {/* Color preview bar & inputs */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Large visual swatch */}
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className="w-12 h-12 rounded-2xl border border-neutral-300 shadow-sm flex items-center justify-center shrink-0"
                    style={{ backgroundColor: selectedHex }}
                  />
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase block">
                      Warna Terpilih
                    </span>
                    <span className="text-sm font-extrabold text-neutral-900">
                      {selectedColorName || 'Custom'}
                    </span>
                  </div>
                </div>

                {/* Hex code input & color input */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      Input Kode Hex (Contoh: #15803D)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedHex.startsWith('#') ? selectedHex : `#${selectedHex}`}
                        onChange={(e) => handleHexInputChange(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5 shrink-0"
                        title="Buka Color Picker"
                      />
                      <input
                        type="text"
                        value={selectedHex}
                        onChange={(e) => handleHexInputChange(e.target.value)}
                        placeholder="#000000"
                        maxLength={7}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono text-xs font-bold focus:ring-2 focus:ring-neutral-900 focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      Nama Warna (Tampil ke Pembeli)
                    </label>
                    <input
                      type="text"
                      value={selectedColorName}
                      onChange={(e) => setSelectedColorName(e.target.value)}
                      placeholder="Contoh: Hijau Botol"
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Swatch Presets */}
              <div>
                <span className="text-[11px] font-bold text-neutral-500 block mb-2">
                  Atau Pilih Cepat dari Swatch Kain Populer:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_FABRIC_COLORS.map((preset) => {
                    const isSelected = selectedHex.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={preset.hex}
                        onClick={() => handleSelectColorPreset(preset)}
                        className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white font-bold shadow-2xs'
                            : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-700'
                        }`}
                        title={`${preset.name} (${preset.hex})`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span className="text-[11px]">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Visual Card Appearance (Mockup Pastel vs Real Photo) */}
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
                  backgroundColor:
                    formData.visual_mode === 'image' && formData.image_url
                      ? '#F3F4F6'
                      : formData.placeholder_bg,
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

          {/* 6. Deskripsi */}
          <div className="border-t border-neutral-100 pt-5">
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
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs shadow-md hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isUploading ? 'Mengunggah Foto...' : isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
