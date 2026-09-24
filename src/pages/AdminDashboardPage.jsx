import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Download,
  RotateCcw,
  ExternalLink,
  LogOut,
  Lock,
  Layers,
  Sparkles,
  Crown,
  Shirt,
  CheckCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { formatRupiah } from '../utils/helpers';
import ProductFormModal from '../components/admin/ProductFormModal';

export default function AdminDashboardPage() {
  const {
    products,
    cloudStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
    exportProductsJSON,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
  } = useProducts();

  // Login form state
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Password Change Modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState({ error: '', success: '' });

  // Dashboard filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: products.length,
      harian: products.filter((p) => p.product_group === 'harian').length,
      custom: products.filter((p) => p.product_group === 'custom').length,
      eksklusif: products.filter((p) => p.product_group === 'eksklusif').length,
    };
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory =
        categoryFilter === 'all' || item.product_group === categoryFilter;

      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.material && item.material.toLowerCase().includes(query)) ||
        (item.category_label && item.category_label.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [products, categoryFilter, searchQuery]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = await loginAdmin(pinInput);
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  // Handle Change Password
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeStatus({ error: '', success: '' });

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeStatus({ error: 'Konfirmasi password baru tidak cocok!', success: '' });
      return;
    }

    if (newPasswordInput.length < 6) {
      setPasswordChangeStatus({ error: 'Password baru minimal 6 karakter!', success: '' });
      return;
    }

    const res = await changeAdminPassword(oldPasswordInput, newPasswordInput);
    if (res.success) {
      setPasswordChangeStatus({ error: '', success: res.message });
      setTimeout(() => {
        setPasswordModalOpen(false);
        setOldPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setPasswordChangeStatus({ error: '', success: '' });
        showToast('Password admin berhasil diubah!');
      }, 1500);
    } else {
      setPasswordChangeStatus({ error: res.message, success: '' });
    }
  };

  // Handle Add / Edit save
  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      showToast(`Produk "${productData.name}" berhasil diperbarui!`);
    } else {
      addProduct(productData);
      showToast(`Produk baru "${productData.name}" berhasil ditambahkan!`);
    }
    setModalOpen(false);
    setEditingProduct(null);
  };

  // Handle Delete
  const handleDeleteConfirm = (id) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    showToast('Produk berhasil dihapus dari katalog!');
  };

  // Handle Reset to Default
  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data produk ke default katalog awal?')) {
      resetToDefault();
      showToast('Katalog berhasil di-reset ke data default awal!');
    }
  };

  // 1. RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-900">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-black text-center text-neutral-900 tracking-tight">
            Kaos Dilio CMS
          </h2>
          <p className="text-xs text-neutral-500 text-center mt-1">
            Dashboard Pengelola Katalog Produk (Fase 2)
          </p>

          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                PIN / Password Admin
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Masukkan PIN"
                autoFocus
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-center text-lg font-bold tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <div className="mt-2 text-center">
                <span className="text-[11px] text-neutral-400 font-medium inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                  Akses terbatas untuk administrator katalog
                </span>
              </div>
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-red-600 text-center bg-red-50 p-2.5 rounded-lg border border-red-100">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
            <Link
              to="/"
              className="text-xs font-bold text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 transition-colors"
            >
              ← Kembali ke Website Katalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. RENDER ADMIN DASHBOARD IF AUTHENTICATED
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <div className="flex items-center gap-3">
              <span className="text-lg sm:text-xl font-black text-neutral-900">
                Kaos Dilio <span className="text-neutral-400 font-normal">| CMS</span>
              </span>
              {cloudStatus === 'connected' ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Supabase Cloud Active
                </span>
              ) : cloudStatus === 'connecting' ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Menghubungkan Cloud...
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Local Cache Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setPasswordModalOpen(true);
                  setPasswordChangeStatus({ error: '', success: '' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                title="Ganti Password Admin"
              >
                <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Ganti Password</span>
              </button>

              <Link
                to="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                title="Buka Website Katalog"
              >
                <span>Lihat Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={logoutAdmin}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors"
                title="Keluar dari Admin"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Produk</span>
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-neutral-900">{stats.total}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Kaos Harian</span>
              <Shirt className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-neutral-900">{stats.harian}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Kaos Custom</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-neutral-900">{stats.custom}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Desain Eksklusif</span>
              <Crown className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-neutral-900">{stats.eksklusif}</p>
          </div>
        </div>

        {/* Action Bar (Search, Category Tabs, Add Button) */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk (nama, bahan, label)..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>

              <button
                onClick={exportProductsJSON}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                title="Unduh backup data JSON"
              >
                <Download className="w-4 h-4 text-neutral-500" />
                <span className="hidden sm:inline">Export JSON</span>
              </button>

              <button
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Kembalikan data ke awal"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset Default</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-neutral-100 scrollbar-none">
            {[
              { label: 'Semua Kategori', value: 'all' },
              { label: '👕 Kaos Harian', value: 'harian' },
              { label: '✨ Kaos Custom', value: 'custom' },
              { label: '👑 Desain Eksklusif', value: 'eksklusif' },
            ].map((tab) => {
              const isActive = categoryFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setCategoryFilter(tab.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Produk</th>
                  <th className="py-3.5 px-4">Grup / Kategori</th>
                  <th className="py-3.5 px-4">Bahan / Spek</th>
                  <th className="py-3.5 px-4">Harga</th>
                  <th className="py-3.5 px-4">Warna</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Product Preview & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-14 rounded-lg flex items-center justify-center p-1 text-center shrink-0 border border-neutral-200/60 font-black text-[9px] leading-tight"
                            style={{
                              backgroundColor: item.placeholder_bg || '#E5E7EB',
                              color: item.placeholder_text_color || '#1E293B',
                            }}
                          >
                            {item.placeholder_title ? item.placeholder_title.slice(0, 14) : item.name.slice(0, 10)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-neutral-900">{item.name}</span>
                              {item.is_new && (
                                <span className="px-1.5 py-0.2 bg-[#5b21b6] text-white text-[9px] font-bold rounded-xs">
                                  NEW
                                </span>
                              )}
                              {item.is_exclusive && (
                                <span className="px-1.5 py-0.2 bg-black text-white text-[9px] font-bold rounded-xs">
                                  EXCLUSIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono block mt-0.5">
                              ID: {item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Group & Sub-type */}
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-semibold text-neutral-800 block">
                          {item.product_group}
                        </span>
                        <span className="text-[11px] text-neutral-500 uppercase">
                          {item.cutting_type || item.sablon_type || item.exclusive_category || '-'}
                        </span>
                      </td>

                      {/* Material */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-neutral-700 block">
                          {item.material || '-'}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {item.category_label || '-'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-extrabold text-neutral-900">
                        {formatRupiah(item.price)}
                      </td>

                      {/* Color Dots */}
                      <td className="py-3.5 px-4">
                        {item.colors && item.colors.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {item.colors.slice(0, 3).map((hex, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs inline-block"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                            {item.extra_colors_count > 0 && (
                              <span className="text-[10px] font-semibold text-neutral-400 pl-0.5">
                                +{item.extra_colors_count}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(item);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            title="Edit Produk"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-neutral-400 text-sm">
                      Tidak ada produk ditemukan sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        product={editingProduct}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h4 className="text-base font-black text-neutral-900">Hapus Produk Ini?</h4>
            <p className="text-xs text-neutral-500">
              Produk akan dihapus dari katalog dan tidak akan tampil lagi di website.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-neutral-900">Ganti Password Admin</h4>
                <p className="text-[11px] text-neutral-500">Password disimpan aman dengan hash SHA-256</p>
              </div>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Password Lama
                </label>
                <input
                  type="password"
                  value={oldPasswordInput}
                  onChange={(e) => setOldPasswordInput(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Password Baru (min. 6 karakter)
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Password baru"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {passwordChangeStatus.error && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                  {passwordChangeStatus.error}
                </p>
              )}

              {passwordChangeStatus.success && (
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  {passwordChangeStatus.success}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
