import { useState } from 'react';
import { X, Plus, Trash2, Tag, Scissors, Crown, Layers, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import {
  CUSTOM_MATERIALS_KEY,
  CUSTOM_KAOS_CAT_KEY,
  CUSTOM_CUTTINGS_KEY,
  CUSTOM_EXCLUSIVE_CAT_KEY,
  REMOVED_KAOS_CAT_KEY,
  REMOVED_CUTTINGS_KEY,
  REMOVED_MATERIALS_KEY,
  REMOVED_EXCLUSIVE_CAT_KEY,
  readRemovedValues,
  writeRemovedValues,
  getAllKaosCategories,
  getAllCuttings,
  getAllMaterials,
  getAllExclusiveCategories,
} from '../../utils/categoryManager';

export default function ManageCategoriesModal({ isOpen, onClose }) {
  const { products = [], updateProduct } = useProducts();
  const [activeTab, setActiveTab] = useState('kaos'); // 'kaos' | 'cutting' | 'exclusive' | 'material'

  // Input states for adding new items
  const [newKaosCat, setNewKaosCat] = useState('');
  const [newCutting, setNewCutting] = useState('');
  const [newExclusiveCat, setNewExclusiveCat] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  // Removed/tombstone lists
  const [removedKaosCats, setRemovedKaosCats] = useState(() => readRemovedValues(REMOVED_KAOS_CAT_KEY));
  const [removedCuttings, setRemovedCuttings] = useState(() => readRemovedValues(REMOVED_CUTTINGS_KEY));
  const [removedMaterials, setRemovedMaterials] = useState(() => readRemovedValues(REMOVED_MATERIALS_KEY));
  const [removedExclusiveCats, setRemovedExclusiveCats] = useState(() =>
    readRemovedValues(REMOVED_EXCLUSIVE_CAT_KEY)
  );

  // Raw lists (all available)
  const allKaosCats = getAllKaosCategories(products);
  const allCuttings = getAllCuttings(products);
  const allMaterials = getAllMaterials(products);
  const allExclusiveCats = getAllExclusiveCategories(products);

  // Clean lists (filtered by tombstone)
  const cleanKaosCats = allKaosCats.filter((c) => !removedKaosCats.includes(String(c).toLowerCase().trim()));
  const cleanCuttings = allCuttings.filter((c) => !removedCuttings.includes(String(c.value).toLowerCase().trim()));
  const cleanMaterials = allMaterials.filter(
    (m) => !removedMaterials.includes(String(m).toLowerCase().trim())
  );
  const cleanExclusiveCats = allExclusiveCats.filter(
    (c) => !removedExclusiveCats.includes(String(c.value).toLowerCase().trim())
  );

  if (!isOpen) return null;

  // Generic delete handler with product migration
  const handleDeleteItem = ({ kind, value, label, fallback, fields, removedState, setRemovedState, tombstoneKey, customKey }) => {
    const lowerVal = String(value).toLowerCase().trim();
    const affectedProducts = (products || []).filter((p) =>
      fields.some((f) => String(p[f] || '').toLowerCase().trim() === lowerVal)
    );
    const count = affectedProducts.length;

    const names = affectedProducts.slice(0, 3).map((p) => `"${p.name}"`).join(', ');
    const moreText = count > 3 ? ` dan ${count - 3} produk lainnya` : '';

    const confirmMsg =
      count > 0
        ? `Kategori "${label || value}" sedang dipakai oleh ${count} produk (${names}${moreText}).\n\nHapus kategori ini dari katalog? ${count} produk tersebut akan otomatis dialihkan ke "${fallback}" agar tab "${label || value}" hilang dari website.`
        : `Hapus "${label || value}" dari daftar pilihan dan tab kategori website?`;

    if (!window.confirm(confirmMsg)) return;

    // 1. Migrate affected products
    if (count > 0 && typeof updateProduct === 'function') {
      affectedProducts.forEach((p) => {
        const patch = {};
        fields.forEach((f) => {
          patch[f] = fallback;
        });
        updateProduct(p.id, patch);
      });
    }

    // 2. Remove from custom list in localStorage if present
    try {
      const customSaved = JSON.parse(localStorage.getItem(customKey) || '[]');
      if (Array.isArray(customSaved)) {
        const updatedCustom = customSaved.filter((item) => {
          const itemVal = typeof item === 'object' && item !== null ? item.value : item;
          return String(itemVal).toLowerCase().trim() !== lowerVal;
        });
        localStorage.setItem(customKey, JSON.stringify(updatedCustom));
      }
    } catch {
      // ignore
    }

    // 3. Tombstone in localStorage
    const nextRemoved = [...new Set([...removedState, lowerVal])];
    setRemovedState(nextRemoved);
    writeRemovedValues(tombstoneKey, nextRemoved);
  };

  // Add handlers
  const handleAddKaosCat = (e) => {
    e.preventDefault();
    const trimmed = newKaosCat.trim().toUpperCase();
    if (!trimmed) return;
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOM_KAOS_CAT_KEY) || '[]');
      if (!saved.map((s) => String(s).toUpperCase()).includes(trimmed)) {
        saved.push(trimmed);
        localStorage.setItem(CUSTOM_KAOS_CAT_KEY, JSON.stringify(saved));
      }
    } catch {}
    const lower = trimmed.toLowerCase();
    if (removedKaosCats.includes(lower)) {
      const next = removedKaosCats.filter((c) => c !== lower);
      setRemovedKaosCats(next);
      writeRemovedValues(REMOVED_KAOS_CAT_KEY, next);
    }
    setNewKaosCat('');
  };

  const handleAddCutting = (e) => {
    e.preventDefault();
    const trimmed = newCutting.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOM_CUTTINGS_KEY) || '[]');
      if (!saved.some((c) => c.value === slug)) {
        saved.push({ value: slug, label: trimmed });
        localStorage.setItem(CUSTOM_CUTTINGS_KEY, JSON.stringify(saved));
      }
    } catch {}
    if (removedCuttings.includes(slug)) {
      const next = removedCuttings.filter((c) => c !== slug);
      setRemovedCuttings(next);
      writeRemovedValues(REMOVED_CUTTINGS_KEY, next);
    }
    setNewCutting('');
  };

  const handleAddExclusiveCat = (e) => {
    e.preventDefault();
    const trimmed = newExclusiveCat.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOM_EXCLUSIVE_CAT_KEY) || '[]');
      if (!saved.some((c) => c.value === slug)) {
        saved.push({ value: slug, label: trimmed });
        localStorage.setItem(CUSTOM_EXCLUSIVE_CAT_KEY, JSON.stringify(saved));
      }
    } catch {}
    if (removedExclusiveCats.includes(slug)) {
      const next = removedExclusiveCats.filter((c) => c !== slug);
      setRemovedExclusiveCats(next);
      writeRemovedValues(REMOVED_EXCLUSIVE_CAT_KEY, next);
    }
    setNewExclusiveCat('');
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    const trimmed = newMaterial.trim();
    if (!trimmed) return;
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOM_MATERIALS_KEY) || '[]');
      if (!saved.includes(trimmed)) {
        saved.push(trimmed);
        localStorage.setItem(CUSTOM_MATERIALS_KEY, JSON.stringify(saved));
      }
    } catch {}
    const lower = trimmed.toLowerCase();
    if (removedMaterials.includes(lower)) {
      const next = removedMaterials.filter((m) => m !== lower);
      setRemovedMaterials(next);
      writeRemovedValues(REMOVED_MATERIALS_KEY, next);
    }
    setNewMaterial('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900">Kelola Kategori &amp; Filter Katalog</h3>
              <p className="text-xs text-neutral-500">
                Atur label kategori, pola cutting, bahan, atau hapus tab kategori yang tidak diinginkan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50/50 px-6 gap-2 pt-2">
          {[
            { id: 'kaos', label: '👕 Kategori Kaos', count: cleanKaosCats.length },
            { id: 'cutting', label: '✂️ Pola Cutting', count: cleanCuttings.length },
            { id: 'exclusive', label: '👑 Kategori Exclusive', count: cleanExclusiveCats.length },
            { id: 'material', label: '🧵 Bahan Kain', count: cleanMaterials.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: Kategori Kaos */}
          {activeTab === 'kaos' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Kategori / Jenis Kaos (Filter Tab Web &amp; Label di Card)
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Kategori di bawah ini muncul sebagai <b>tab filter di halaman Koleksi Kaos</b> (Semua Kategori, Kasual, Polo, dll).
                  Jika kategori dihapus, produk yang memakai kategori tersebut akan <b>otomatis dialihkan ke KASUAL</b> sehingga tab tersebut langsung hilang dari website.
                </p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddKaosCat} className="flex gap-2">
                <input
                  type="text"
                  value={newKaosCat}
                  onChange={(e) => setNewKaosCat(e.target.value)}
                  placeholder="Nama kategori baru (contoh: VINTAGE, OVERSIZE, POLO)..."
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={!newKaosCat.trim()}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kategori</span>
                </button>
              </form>

              {/* Chips list */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-neutral-700 uppercase tracking-wider block">
                  Daftar Kategori Aktif ({cleanKaosCats.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {cleanKaosCats.map((cat) => {
                    const count = products.filter(
                      (p) =>
                        (p.kaos_category || p.category_label || '').toLowerCase().trim() ===
                        cat.toLowerCase().trim()
                    ).length;
                    return (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 shadow-2xs transition-colors"
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-500">
                          {count} produk
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteItem({
                              kind: 'kaosCat',
                              value: cat,
                              label: cat,
                              fallback: 'KASUAL',
                              fields: ['kaos_category', 'category_label'],
                              removedState: removedKaosCats,
                              setRemovedState: setRemovedKaosCats,
                              tombstoneKey: REMOVED_KAOS_CAT_KEY,
                              customKey: CUSTOM_KAOS_CAT_KEY,
                            })
                          }
                          className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={`Hapus kategori ${cat}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pola Cutting */}
          {activeTab === 'cutting' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-700">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Scissors className="w-3.5 h-3.5 text-neutral-600" />
                  Pola Cutting Kaos (Filter Sidebar)
                </p>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Pilihan model potongan kaos yang tampil pada sidebar filter (Oversized, Regular, Fitted, Boxy, Long Sleeve).
                  Jika dihapus, produk yang memakai cutting ini akan dialihkan ke <b>Oversized Fit</b>.
                </p>
              </div>

              <form onSubmit={handleAddCutting} className="flex gap-2">
                <input
                  type="text"
                  value={newCutting}
                  onChange={(e) => setNewCutting(e.target.value)}
                  placeholder="Nama cutting baru (contoh: Muscle Fit, Crop Tee)..."
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={!newCutting.trim()}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Cutting</span>
                </button>
              </form>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-neutral-700 uppercase tracking-wider block">
                  Daftar Pola Cutting Aktif ({cleanCuttings.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {cleanCuttings.map((c) => {
                    const count = products.filter(
                      (p) => String(p.cutting_type || '').toLowerCase().trim() === c.value.toLowerCase().trim()
                    ).length;
                    return (
                      <span
                        key={c.value}
                        className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 shadow-2xs transition-colors"
                      >
                        <span>{c.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-500">
                          {count} produk
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteItem({
                              kind: 'cuttings',
                              value: c.value,
                              label: c.label,
                              fallback: 'oversized',
                              fields: ['cutting_type'],
                              removedState: removedCuttings,
                              setRemovedState: setRemovedCuttings,
                              tombstoneKey: REMOVED_CUTTINGS_KEY,
                              customKey: CUSTOM_CUTTINGS_KEY,
                            })
                          }
                          className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={`Hapus cutting ${c.label}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Exclusive Category */}
          {activeTab === 'exclusive' && (
            <div className="space-y-4">
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  Kategori Exclusive (Tab Brand / Collab di Halaman Eksklusif)
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Kategori khusus produk <b>Limited Edition (Exclusive)</b> yang tampil sebagai tab filter brand/collab di halaman Desain Eksklusif.
                </p>
              </div>

              <form onSubmit={handleAddExclusiveCat} className="flex gap-2">
                <input
                  type="text"
                  value={newExclusiveCat}
                  onChange={(e) => setNewExclusiveCat(e.target.value)}
                  placeholder="Kategori eksklusif baru (contoh: Dilio x Marvel, Limited Artist)..."
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={!newExclusiveCat.trim()}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Exclusive</span>
                </button>
              </form>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-neutral-700 uppercase tracking-wider block">
                  Daftar Kategori Exclusive Aktif ({cleanExclusiveCats.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {cleanExclusiveCats.map((c) => {
                    const count = products.filter(
                      (p) =>
                        String(p.exclusive_category || '').toLowerCase().trim() ===
                        c.value.toLowerCase().trim()
                    ).length;
                    return (
                      <span
                        key={c.value}
                        className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 shadow-2xs transition-colors"
                      >
                        <span>{c.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-500">
                          {count} produk
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteItem({
                              kind: 'exclusiveCat',
                              value: c.value,
                              label: c.label,
                              fallback: 'dilio',
                              fields: ['exclusive_category'],
                              removedState: removedExclusiveCats,
                              setRemovedState: setRemovedExclusiveCats,
                              tombstoneKey: REMOVED_EXCLUSIVE_CAT_KEY,
                              customKey: CUSTOM_EXCLUSIVE_CAT_KEY,
                            })
                          }
                          className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={`Hapus kategori exclusive ${c.label}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Bahan Kain */}
          {activeTab === 'material' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-700">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-neutral-600" />
                  Bahan Kain (Material Spek)
                </p>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Pilihan bahan kain yang tampil pada dropdown modal dan spesifikasi produk.
                </p>
              </div>

              <form onSubmit={handleAddMaterial} className="flex gap-2">
                <input
                  type="text"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Nama bahan baru (contoh: Heavy Cotton 16s, Pique Cotton)..."
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={!newMaterial.trim()}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Bahan</span>
                </button>
              </form>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-neutral-700 uppercase tracking-wider block">
                  Daftar Bahan Kain Aktif ({cleanMaterials.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {cleanMaterials.map((m) => {
                    const count = products.filter(
                      (p) => String(p.material || '').toLowerCase().trim() === m.toLowerCase().trim()
                    ).length;
                    return (
                      <span
                        key={m}
                        className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 shadow-2xs transition-colors"
                      >
                        <span>{m}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-500">
                          {count} produk
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteItem({
                              kind: 'materials',
                              value: m,
                              label: m,
                              fallback: 'Cotton Combed 24s',
                              fields: ['material'],
                              removedState: removedMaterials,
                              setRemovedState: setRemovedMaterials,
                              tombstoneKey: REMOVED_MATERIALS_KEY,
                              customKey: CUSTOM_MATERIALS_KEY,
                            })
                          }
                          className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={`Hapus bahan ${m}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Perubahan langsung tersimpan dan tersinkronisasi ke katalog website.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
