import { useState, useMemo, useRef, useEffect } from 'react';
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
  Camera,
  Copy,
  Clock,
  Tag,
  Image as ImageIcon,
  Package,
  MousePointerClick,
  BarChart3,
  Video,
  Play,
  X,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import {
  formatRupiah,
  safeColors,
  computeDiscountInfo,
  formatNumberDots,
  getProductClicksMap,
  resetProductClicks,
} from '../utils/helpers';
import {
  getAppCategoryTabs,
  filterMatchesCategory,
  getDisplayCategoryLabel,
} from '../utils/categoryManager';
import ProductFormModal from '../components/admin/ProductFormModal';
import SliderReorderModal from '../components/admin/SliderReorderModal';
import BannerSettingsModal from '../components/admin/BannerSettingsModal';

// Urutan produk di slider [LIMITED EDITION] Homepage (disimpan lokal, diatur dari tabel admin)
const SLIDER_ORDER_KEY = 'kaos_dilio_slider_order';

function readSliderOrderMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SLIDER_ORDER_KEY));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeSliderOrderMap(map) {
  try {
    localStorage.setItem(SLIDER_ORDER_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

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
  const [sliderReorderModalOpen, setSliderReorderModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Slider order: refs only so button clicks trigger re-render via tick below
  const sliderOrderMapRef = useRef(readSliderOrderMap());
  const [sliderOrderTick, setSliderOrderTick] = useState(0);

  const isExclusiveItem = (item) =>
    item.product_group === 'eksklusif' || item.is_exclusive === true;

  // Notification toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Product Clicks tracking & Ranking Modal state
  const [clicksMap, setClicksMap] = useState(() => getProductClicksMap());
  const [isClicksRankingOpen, setIsClicksRankingOpen] = useState(false);

  useEffect(() => {
    const handleClicksChange = () => setClicksMap(getProductClicksMap());
    window.addEventListener('kaos_dilio_click_updated', handleClicksChange);
    return () => window.removeEventListener('kaos_dilio_click_updated', handleClicksChange);
  }, []);

  // Stats calculation (Foto 3: TOTAL PRODUK, TOTAL STOK, KAOS CUSTOM)
  const stats = useMemo(() => {
    const totalStock = products.reduce(
      (acc, p) => acc + (typeof p.stock === 'number' ? p.stock : 100),
      0
    );
    return {
      total: products.length,
      totalStock,
      harian: products.filter((p) => p.product_group === 'harian').length,
      custom: products.filter((p) => p.product_group === 'custom').length,
      eksklusif: products.filter((p) => p.product_group === 'eksklusif').length,
    };
  }, [products]);

  // Ranking data for product clicks
  const rankingData = useMemo(() => {
    const list = products.map((p) => ({
      product: p,
      clicks: Number(clicksMap[p.id]) || 0,
    }));
    list.sort((a, b) => b.clicks - a.clicks);
    const totalClicks = list.reduce((acc, item) => acc + item.clicks, 0);
    const topItem = list[0] && list[0].clicks > 0 ? list[0] : null;
    return { list, totalClicks, topItem };
  }, [products, clicksMap]);

  // Categories list synchronized with Homepage & Cloud Config
  const [configTick, setConfigTick] = useState(0);
  useEffect(() => {
    const handleConfigChange = () => setConfigTick((t) => t + 1);
    window.addEventListener('kaos_dilio_config_updated', handleConfigChange);
    return () => window.removeEventListener('kaos_dilio_config_updated', handleConfigChange);
  }, []);

  const categoryTabs = useMemo(() => getAppCategoryTabs(products), [products, configTick]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory = filterMatchesCategory(item, categoryFilter);

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
  const handleSaveProduct = async (productData) => {
    if (editingProduct && editingProduct.id) {
      const res = await updateProduct(editingProduct.id, productData);
      if (res && res.success === false) {
        showToast(`Peringatan: ${res.error}`);
      } else {
        showToast(`Produk "${productData.name}" berhasil disimpan!`);
      }
    } else {
      const res = await addProduct(productData);
      if (res && res.success === false) {
        showToast(`Peringatan: Gagal simpan ke Cloud: ${res.error}`);
      } else {
        showToast(`Produk baru "${productData.name}" berhasil ditambahkan!`);
      }
    }
    setModalOpen(false);
    setEditingProduct(null);
  };

  // Handle Duplicate Product (Copy) - Immediately creates the duplicate & opens form to tweak
  const handleDuplicateProduct = async (item) => {
    const { id: _oldId, is_copy: _ic, ...rest } = item;
    const duplicateData = {
      ...rest,
      id: `prod-${Date.now()}`,
      name: `${item.name} (Copy)`,
      created_at: new Date().toISOString(),
    };
    const res = await addProduct(duplicateData);
    const createdProduct = (res && res.data) || duplicateData;
    setEditingProduct({ ...createdProduct, is_copy: true });
    setModalOpen(true);
    showToast(`Produk "${createdProduct.name}" berhasil diduplikat! Sesuaikan lalu klik Simpan.`);
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
          <div className="flex items-center justify-between h-13 sm:h-14">
            <div className="flex items-center gap-2.5">
              <span className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                Kaos Dilio <span className="text-neutral-400 font-normal">| CMS</span>
              </span>
              {cloudStatus === 'connected' ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Supabase Cloud Active
                </span>
              ) : cloudStatus === 'connecting' ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Menghubungkan Cloud...
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Local Cache Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/studio"
                target="_blank"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                title="Buka Studio Mockup Foto Produk (AI Photorealistic)"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Studio Mockup</span>
              </Link>

              <button
                onClick={() => {
                  setPasswordModalOpen(true);
                  setPasswordChangeStatus({ error: '', success: '' });
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                title="Ganti Password Admin"
              >
                <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Password</span>
              </button>

              <Link
                to="/"
                target="_blank"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                title="Buka Website Katalog"
              >
                <span>Lihat Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={logoutAdmin}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors"
                title="Keluar dari Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 sm:space-y-5">
        {/* Stats Row - Foto 3: TOTAL PRODUK, TOTAL STOK, KAOS CUSTOM + Tracker Klik */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Produk</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-neutral-900">{stats.total}</p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Stok</span>
              <Package className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl sm:text-2xl font-black text-neutral-900">
                {formatNumberDots(stats.totalStock)}
              </p>
              <span className="text-xs font-bold text-neutral-500">Pcs</span>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Kaos Custom</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-neutral-900">{stats.custom}</p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Produk Terpopuler</span>
                <MousePointerClick className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <p
                className="text-xs sm:text-sm font-black text-neutral-900 truncate"
                title={rankingData.topItem ? rankingData.topItem.product.name : 'Belum ada klik'}
              >
                {rankingData.topItem ? rankingData.topItem.product.name : 'Belum Ada Klik'}
              </p>
              <span className="text-[10px] text-neutral-500 font-semibold block mt-0.5">
                {rankingData.topItem
                  ? `${rankingData.topItem.clicks} klik (${rankingData.totalClicks} total)`
                  : 'Klik produk di katalog'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsClicksRankingOpen(true)}
              className="mt-1.5 text-[10px] font-bold text-purple-700 hover:text-purple-900 hover:underline inline-flex items-center gap-1 cursor-pointer self-start"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Lihat Ranking Klik</span>
            </button>
          </div>
        </div>

        {/* Action Bar (Search, Category Tabs, Add Button) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk (nama, bahan, label)..."
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setBannerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Pengaturan Slide Banner Foto di Bagian Atas Homepage"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Pengaturan Banner</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct({
                    product_group: 'eksklusif',
                    is_exclusive: true,
                    category_label: 'LIMITED EDITION',
                  });
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Tambah katalog baru khusus banner [LIMITED EDITION] di Homepage"
              >
                <Crown className="w-3.5 h-3.5 text-neutral-950" />
                <span>+ Tambah Exclusive</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Produk</span>
              </button>

              <button
                onClick={() => setSliderReorderModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Geser dan susun urutan posisi produk di seluruh katalog"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Urutan Katalog</span>
              </button>

              <button
                onClick={exportProductsJSON}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-2 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                title="Unduh backup data JSON"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={handleResetData}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-2 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Kembalikan data ke awal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills (Seragam dengan Homepage + Scrollbar Horizontal Terlihat) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-neutral-100 visible-horizontal-scrollbar pb-2.5">
            {categoryTabs.map((tab) => {
              const isActive =
                categoryFilter === tab.value ||
                (tab.value === 'exclusive' && categoryFilter === 'eksklusif') ||
                (tab.value === 'eksklusif' && categoryFilter === 'exclusive');
              return (
                <button
                  key={tab.value}
                  onClick={() => setCategoryFilter(tab.value)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
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

        {/* Mobile Product Cards View (< md) */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden"
          data-slider-order-tick-mobile={String(sliderOrderTick)}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => {
              const mainImg = (Array.isArray(item.images) && item.images[0]) || item.image_url;
              const totalImgs = Array.isArray(item.images) ? item.images.length : (item.image_url ? 1 : 0);
              const disc = computeDiscountInfo(item.price, item.original_price);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-neutral-200/80 p-3 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div className="flex gap-2.5">
                    {/* Thumbnail */}
                    {mainImg ? (
                      <div className="relative shrink-0">
                        <img
                          src={mainImg}
                          alt={item.name}
                          className="w-16 h-20 rounded-lg object-cover border border-neutral-200/80 shadow-2xs"
                        />
                        {totalImgs > 1 && (
                          <span className="absolute bottom-0 right-0 bg-neutral-900/80 text-white text-[8px] font-bold px-1 rounded-xs">
                            {totalImgs}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div
                        className="w-16 h-20 rounded-lg flex items-center justify-center p-1 text-center shrink-0 border border-neutral-200/60 font-black text-[9px] leading-tight overflow-hidden"
                        style={{
                          backgroundColor: item.placeholder_bg || '#E5E7EB',
                          color: item.placeholder_text_color || '#1E293B',
                        }}
                      >
                        {item.placeholder_title ? item.placeholder_title.slice(0, 12) : item.name.slice(0, 8)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="font-bold text-neutral-900 text-xs line-clamp-1">
                          {item.name}
                        </span>
                        {item.is_new && (
                          <span className="px-1 py-0.2 bg-[#5b21b6] text-white text-[8px] font-bold rounded-xs">
                            NEW
                          </span>
                        )}
                        {(item.is_exclusive || item.product_group === 'eksklusif') && (
                          <span className="px-1 py-0.2 bg-black text-amber-300 border border-amber-300/30 text-[8px] font-black tracking-wider rounded-xs">
                            EXCL
                          </span>
                        )}
                        {item.is_preorder && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-amber-500 text-neutral-950 text-[8px] font-black rounded-xs">
                            <Clock className="w-2.5 h-2.5" />
                            <span>PO</span>
                          </span>
                        )}
                        {item.video_url && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-purple-100 text-purple-800 text-[8px] font-black rounded-xs">
                            <Play className="w-2 h-2 fill-purple-800" />
                            <span>VIDEO</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-500 space-y-0.5">
                        <p className="truncate">
                          <span className="font-medium text-neutral-700 capitalize">
                            {item.product_group === 'eksklusif' ? 'Limited Edition' : item.product_group}
                          </span>
                          {(item.cutting_type || item.exclusive_category) && (
                            <span> • {item.cutting_type || item.exclusive_category}</span>
                          )}
                        </p>
                        <p className="truncate text-neutral-400 text-[10px]">
                          {item.material || '-'} • {getDisplayCategoryLabel(item)} • <span className="font-bold text-neutral-600">Stok: {item.stock ?? 100} pcs</span>
                        </p>
                      </div>

                      {/* Price & Colors */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-100">
                        <div>
                          {disc.hasDiscount ? (
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-neutral-900 text-xs">
                                {formatRupiah(item.price)}
                              </span>
                              <span className="text-[9px] text-neutral-400 line-through">
                                {formatRupiah(disc.displayOriginalPrice)}
                              </span>
                              {disc.discountPercent > 0 && (
                                <span className="text-[8px] font-bold text-red-600 bg-red-50 px-0.5 rounded">
                                  -{disc.discountPercent}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="font-bold text-neutral-900 text-xs">
                              {formatRupiah(item.price)}
                            </span>
                          )}
                        </div>

                        {safeColors(item.colors).length > 0 && (
                          <div className="flex items-center gap-1">
                            {safeColors(item.colors).slice(0, 3).map((hex, idx) => (
                              <span
                                key={idx}
                                className="w-2.5 h-2.5 rounded-full border border-neutral-300 shadow-2xs inline-block"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                            {Number(item.extra_colors_count) > 0 && (
                              <span className="text-[9px] font-semibold text-neutral-400">
                                +{item.extra_colors_count}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        setEditingProduct(item);
                        setModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Produk</span>
                    </button>

                    <button
                      onClick={() => handleDuplicateProduct(item)}
                      className="py-1.5 px-2.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                      title="Duplikat / Salin Produk"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-xl border border-neutral-200/80 p-8 text-center text-neutral-400 text-xs">
              Tidak ada produk ditemukan sesuai filter.
            </div>
          )}
        </div>

        {/* Product Table (Desktop & Tablet >= md) */}
        <div
          className="hidden md:block bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden"
          data-slider-order-tick={String(sliderOrderTick)}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Produk</th>
                  <th className="py-2.5 px-3">Grup / Kategori</th>
                  <th className="py-2.5 px-3">Bahan / Spek</th>
                  <th className="py-2.5 px-3">Harga</th>
                  <th className="py-2.5 px-3">Warna</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Product Preview & Name */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5">
                          {(() => {
                            const mainImg = (Array.isArray(item.images) && item.images[0]) || item.image_url;
                            const totalImgs = Array.isArray(item.images) ? item.images.length : (item.image_url ? 1 : 0);
                            return mainImg ? (
                              <div className="relative shrink-0">
                                <img
                                  src={mainImg}
                                  alt={item.name}
                                  className="w-9 h-11 rounded-md object-cover border border-neutral-200/80 shadow-2xs"
                                />
                                {totalImgs > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-neutral-900/80 text-white text-[8px] font-bold px-1 rounded-xs">
                                    {totalImgs}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div
                                className="w-9 h-11 rounded-md flex items-center justify-center p-1 text-center shrink-0 border border-neutral-200/60 font-black text-[8px] leading-tight overflow-hidden"
                                style={{
                                  backgroundColor: item.placeholder_bg || '#E5E7EB',
                                  color: item.placeholder_text_color || '#1E293B',
                                }}
                              >
                                {item.placeholder_title ? item.placeholder_title.slice(0, 10) : item.name.slice(0, 8)}
                              </div>
                            );
                          })()}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-neutral-900 truncate max-w-[200px] sm:max-w-xs">{item.name}</span>
                              {item.is_new && (
                                <span className="px-1 py-0.2 bg-[#5b21b6] text-white text-[8px] font-bold rounded-xs">
                                  NEW
                                </span>
                              )}
                              {(item.is_exclusive || item.product_group === 'eksklusif') && (
                                <span className="px-1 py-0.2 bg-black text-amber-300 border border-amber-300/30 text-[8px] font-black tracking-wider rounded-xs">
                                  EXCL
                                </span>
                              )}
                              {item.is_preorder && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-amber-500 text-neutral-950 text-[8px] font-black rounded-xs">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>PO</span>
                                </span>
                              )}
                              {item.video_url && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-purple-100 text-purple-800 text-[8px] font-black rounded-xs">
                                  <Play className="w-2 h-2 fill-purple-800" />
                                  <span>VIDEO</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                              {item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Group & Sub-type */}
                      <td className="py-2 px-3">
                        <span className="capitalize font-semibold text-neutral-800 block text-xs">
                          {item.product_group === 'eksklusif' ? 'Limited Edition' : item.product_group}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase">
                          {item.cutting_type || item.sablon_type || item.exclusive_category || '-'}
                        </span>
                      </td>

                      {/* Material & Stock */}
                      <td className="py-2 px-3">
                        <span className="font-medium text-neutral-700 block text-xs">
                          {item.material || '-'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5">
                          <span>{getDisplayCategoryLabel(item)}</span>
                          <span>•</span>
                          <span className="font-bold text-neutral-600">Stok: {item.stock ?? 100} pcs</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-2 px-3">
                        {(() => {
                          const disc = computeDiscountInfo(item.price, item.original_price);
                          if (disc.hasDiscount) {
                            return (
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-neutral-400 line-through">
                                    {formatRupiah(disc.displayOriginalPrice)}
                                  </span>
                                  {disc.discountPercent > 0 && (
                                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-0.5 rounded">
                                      -{disc.discountPercent}%
                                    </span>
                                  )}
                                </div>
                                <span className="font-bold text-neutral-900 block text-xs">
                                  {formatRupiah(item.price)}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <span className="font-bold text-neutral-900 text-xs">
                              {formatRupiah(item.price)}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Color Dots */}
                      <td className="py-2 px-3">
                        {safeColors(item.colors).length > 0 ? (
                          <div className="flex items-center gap-1">
                            {safeColors(item.colors).slice(0, 3).map((hex, idx) => (
                              <span
                                key={idx}
                                className="w-3 h-3 rounded-full border border-neutral-300 shadow-2xs inline-block"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                            {Number(item.extra_colors_count) > 0 && (
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
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleDuplicateProduct(item)}
                            className="p-1 rounded text-neutral-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Duplikat / Salin Produk Ini"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingProduct(item);
                              setModalOpen(true);
                            }}
                            className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      {modalOpen && (
        <ProductFormModal
          isOpen={modalOpen}
          product={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* Slider Reorder Drag & Drop Modal */}
      {sliderReorderModalOpen && (
        <SliderReorderModal
          isOpen={sliderReorderModalOpen}
          onClose={() => setSliderReorderModalOpen(false)}
          products={products}
          onOrderChanged={() => {
            setSliderOrderTick((t) => t + 1);
            showToast('Urutan posisi produk katalog berhasil diperbarui!');
          }}
        />
      )}

      {/* Banner Settings Modal */}
      {bannerModalOpen && (
        <BannerSettingsModal
          isOpen={bannerModalOpen}
          onClose={() => setBannerModalOpen(false)}
        />
      )}

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

      {/* Modal Ranking Klik Produk */}
      {isClicksRankingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-neutral-900">
                    Statistik Produk Paling Sering Di-Klik
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Total {rankingData.totalClicks} kali produk dilihat oleh pembeli
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClicksRankingOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List of Products */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 text-xs">
              {rankingData.list.length > 0 ? (
                rankingData.list.map((item, idx) => {
                  const pct =
                    rankingData.totalClicks > 0
                      ? Math.round((item.clicks / rankingData.totalClicks) * 100)
                      : 0;
                  const thumb =
                    (Array.isArray(item.product.images) && item.product.images[0]) ||
                    item.product.image_url;

                  return (
                    <div
                      key={item.product.id}
                      className="p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-50 transition-colors flex items-center gap-3"
                    >
                      {/* Rank Number */}
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400 text-neutral-950 shadow-xs'
                            : idx === 1
                            ? 'bg-neutral-300 text-neutral-800'
                            : idx === 2
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-white text-neutral-500 border border-neutral-200'
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      {/* Thumbnail */}
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.product.name}
                          className="w-10 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-12 rounded-lg bg-neutral-200 flex items-center justify-center text-[9px] font-bold text-neutral-500 shrink-0">
                          Foto
                        </div>
                      )}

                      {/* Product Info & Bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-neutral-900 truncate">
                            {item.product.name}
                          </span>
                          <span className="font-black text-neutral-900 shrink-0 text-xs">
                            {item.clicks}{' '}
                            <span className="text-[10px] text-neutral-400 font-semibold">klik</span>
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                          <span className="capitalize">{item.product.product_group || 'Katalog'}</span>
                          <span>{pct}% dari total klik</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-neutral-400">
                  Belum ada produk yang diklik.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset semua statistik klik produk kembali ke 0?')) {
                    resetProductClicks();
                    showToast('Statistik klik berhasil direset!');
                  }
                }}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Data Klik</span>
              </button>
              <button
                type="button"
                onClick={() => setIsClicksRankingOpen(false)}
                className="px-4 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Tutup
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
