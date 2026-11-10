import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  BANNER_STORAGE_KEY,
  DEFAULT_BANNER_SLIDES,
  getStoredBannerSlides,
} from '../home/SliderBanner';

export default function BannerSettingsModal({ isOpen, onClose }) {
  const [slides, setSlides] = useState([]);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form fields
  const [formImage, setFormImage] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSlides(getStoredBannerSlides());
      setIsFormOpen(false);
      setEditingSlide(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveSlides = (newSlides) => {
    setSlides(newSlides);
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(newSlides));
      window.dispatchEvent(new Event('kaos_dilio_banner_updated'));
    } catch {
      // ignore
    }
  };

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormImage('');
    setFormTitle('');
    setFormSubtitle('');
    setFormLink('');
    setFormIsActive(true);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (slide) => {
    setEditingSlide(slide);
    setFormImage(slide.image || '');
    setFormTitle(slide.title || '');
    setFormSubtitle(slide.subtitle || '');
    setFormLink(slide.link || '');
    setFormIsActive(slide.isActive !== false);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Mohon pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Ukuran file maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormImage(event.target.result);
      setFormError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formImage.trim()) {
      setFormError('Foto banner wajib diisi atau diunggah.');
      return;
    }

    if (editingSlide) {
      // Update existing
      const updated = slides.map((s) =>
        s.id === editingSlide.id
          ? {
              ...s,
              image: formImage.trim(),
              title: formTitle.trim(),
              subtitle: formSubtitle.trim(),
              link: formLink.trim(),
              isActive: formIsActive,
            }
          : s
      );
      saveSlides(updated);
    } else {
      // Add new
      const newSlide = {
        id: `banner-${Date.now()}`,
        image: formImage.trim(),
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        link: formLink.trim(),
        isActive: formIsActive,
      };
      saveSlides([...slides, newSlide]);
    }

    setIsFormOpen(false);
    setEditingSlide(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus slide banner ini?')) {
      const filtered = slides.filter((s) => s.id !== id);
      saveSlides(filtered);
    }
  };

  const handleToggleActive = (id) => {
    const updated = slides.map((s) =>
      s.id === id ? { ...s, isActive: s.isActive === false ? true : false } : s
    );
    saveSlides(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...slides];
    const [moved] = updated.splice(index, 1);
    updated.splice(index - 1, 0, moved);
    saveSlides(updated);
  };

  const handleMoveDown = (index) => {
    if (index === slides.length - 1) return;
    const updated = [...slides];
    const [moved] = updated.splice(index, 1);
    updated.splice(index + 1, 0, moved);
    saveSlides(updated);
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan ke banner default bawaan?')) {
      saveSlides(DEFAULT_BANNER_SLIDES);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-500" />
              <span>Pengaturan Banner Slider Homepage</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Ganti, tambah, atau susun urutan slide foto banner yang tampil di halaman utama.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Banner Baru</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Reset ke banner bawaan sistem"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>

          {/* Form Modal Sub-view (Add/Edit) */}
          {isFormOpen && (
            <form
              onSubmit={handleSaveForm}
              className="p-5 bg-neutral-50 border border-neutral-200/80 rounded-2xl space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  {editingSlide ? 'Edit Slide Banner' : 'Tambah Slide Banner Baru'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  Batal
                </button>
              </div>

              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              {/* Image Preview & Upload */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Foto Banner <span className="text-red-500">*</span>
                </label>

                {formImage ? (
                  <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-200 mb-3 group">
                    <img
                      src={formImage}
                      alt="Preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Upload dari Perangkat
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-xl cursor-pointer bg-white transition-colors text-xs font-semibold text-neutral-700">
                      <Upload className="w-4 h-4 text-neutral-500" />
                      <span>Pilih File Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Atau Masukkan URL Gambar
                    </label>
                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Judul Banner (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: New States Apparel"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Teks Promo / Subtitle (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="Contoh: Diskon Hingga 40%"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Link & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Tautan Link Klik (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="Contoh: /?kategori=kasual"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
                    />
                    <span className="text-xs font-bold text-neutral-800">
                      Tampilkan di Homepage (Aktif)
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-neutral-300 bg-white hover:bg-neutral-100 rounded-xl text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingSlide ? 'Simpan Perubahan' : 'Tambahkan Banner'}
                </button>
              </div>
            </form>
          )}

          {/* Banner Slides List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Daftar Slide Banner ({slides.length} Slide)
            </h4>

            {slides.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-500">
                Belum ada banner. Klik tombol <strong>Tambah Banner Baru</strong> di atas.
              </div>
            ) : (
              slides.map((slide, index) => {
                const isActive = slide.isActive !== false;
                return (
                  <div
                    key={slide.id || index}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-white border-neutral-200 shadow-2xs'
                        : 'bg-neutral-50/70 border-neutral-200/50 opacity-60'
                    }`}
                  >
                    {/* Position Number */}
                    <span className="w-6 text-center text-xs font-black text-neutral-400 shrink-0">
                      #{index + 1}
                    </span>

                    {/* Image Thumbnail */}
                    <div className="w-24 sm:w-32 aspect-[21/9] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 shrink-0">
                      <img
                        src={slide.image}
                        alt={slide.title || 'Banner'}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-neutral-900 text-xs sm:text-sm truncate">
                          {slide.title || 'Slide Banner'}
                        </h5>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </div>
                      {slide.subtitle && (
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Pindahkan ke atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === slides.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Pindahkan ke bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Active */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(slide.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isActive
                            ? 'border-neutral-200 text-emerald-600 hover:bg-emerald-50'
                            : 'border-neutral-200 text-neutral-400 hover:bg-neutral-100'
                        }`}
                        title={isActive ? 'Nonaktifkan banner' : 'Aktifkan banner'}
                      >
                        {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(slide)}
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer transition-colors"
                        title="Edit banner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(slide.id)}
                        className="p-1.5 rounded-lg border border-neutral-200 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                        title="Hapus banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Perubahan otomatis tersimpan dan langsung terlihat di Homepage.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
