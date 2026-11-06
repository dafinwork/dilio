import { useState, useEffect } from 'react';
import { X, Check, Loader2, Plus, Trash2, Star, Clock, Sparkles, Ruler } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { safeColors, formatNumberDots, parseNumberDots, computeDiscountInfo } from '../../utils/helpers';
import { getStoredSizeCharts } from '../SizeChartModal';
import ColorWheelModal from './ColorWheelModal';

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

const DEFAULT_MATERIALS = [
  'Heavyweight 16s',
  'Cotton Combed 24s',
  'Cotton Combed 20s',
  'Cotton Combed 30s',
  'Washed Cotton 20s',
  'Pique Cotton (Polo)',
  'Dry-Fit / Polyester (Olahraga)',
  'Cotton Fleece (Jaket/Hoodie)',
];

const DEFAULT_KAOS_CATEGORIES = [
  'KASUAL',
  'POLO',
  'OLAHRAGA',
  'BASIC',
  'STREETWEAR',
  'HOODIE',
  'LIMITED EDITION',
];

const DEFAULT_CUTTINGS = [
  { value: 'oversized', label: 'Oversized Fit' },
  { value: 'regular', label: 'Regular Fit' },
  { value: 'fitted', label: 'Fitted' },
  { value: 'boxy', label: 'Boxy Cut' },
  { value: 'long-sleeve', label: 'Long Sleeve (Lengan Panjang)' },
];

const DEFAULT_EXCLUSIVE_CATEGORIES = [
  { value: 'dilio', label: 'Dilio (Brand Sendiri)' },
  { value: 'thinking-out', label: 'Thinking Out (Partner Brand)' },
  { value: 'dilio-x-one-piece', label: 'Dilio x One Piece (Collab)' },
];

const CUSTOM_MATERIALS_KEY = 'kaos_dilio_custom_materials';
const CUSTOM_KAOS_CAT_KEY = 'kaos_dilio_custom_kaos_categories';
const CUSTOM_CUTTINGS_KEY = 'kaos_dilio_custom_cuttings';
const CUSTOM_EXCLUSIVE_CAT_KEY = 'kaos_dilio_custom_exclusive_cats';

// Tombstone lists: nama/value item default/custom yg "dihapus" admin
// (dipakai juga oleh halaman katalog agar tab filter ikut hilang)
const REMOVED_KAOS_CAT_KEY = 'kaos_dilio_removed_kaos_categories';
const REMOVED_CUTTINGS_KEY = 'kaos_dilio_removed_cuttings';
const REMOVED_MATERIALS_KEY = 'kaos_dilio_removed_materials';
const REMOVED_EXCLUSIVE_CAT_KEY = 'kaos_dilio_removed_exclusive_cats';
const PRODUCT_CACHE_KEY = 'kaos_dilio_catalog_products';

function readRemovedValues(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRemovedValues(key, values) {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // ignore
  }
}

// Hitung berapa produk masih memakai nilai kategori/cutting/bahan tertentu
function countProductsUsing(fieldCandidates, value) {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRODUCT_CACHE_KEY) || '[]');
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter((p) =>
      fieldCandidates.some((f) => String(p[f] || '').toLowerCase() === String(value).toLowerCase())
    ).length;
  } catch {
    return 0;
  }
}

export default function ProductFormModal({ product, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    product_group: 'harian',
    cutting_type: 'oversized',
    sablon_type: 'dtf',
    exclusive_category: 'dilio',
    category_label: 'KASUAL',
    kaos_category: 'KASUAL',
    material: 'Cotton Combed 24s',
    priceText: '65.000',
    originalPriceText: '',
    description: '',
    image_url: '',
    images: [],
    visual_mode: 'image',
    is_new: false,
    is_exclusive: false,
    is_customizable: false,
    is_preorder: false,
    preorder_duration: '',
    placeholder_title: '',
    placeholder_bg: '#E5E7EB',
    placeholder_text_color: '#374151',
    colors: ['#000000'],
    extra_colors_count: 0,
    size_chart: [],
    mockup_angles: { front: '', back: '', left: '', right: '' },
  });

  // Pola Cutting list with persistence
  const [cuttingsList, setCuttingsList] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_CUTTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingVals = new Set(DEFAULT_CUTTINGS.map((c) => c.value));
          const customOnes = parsed.filter((c) => c && c.value && !existingVals.has(c.value));
          return [...DEFAULT_CUTTINGS, ...customOnes];
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_CUTTINGS;
  });

  const [newCuttingInput, setNewCuttingInput] = useState('');
  const [showAddCutting, setShowAddCutting] = useState(false);

  // Kategori Jenis Kaos list with persistence
  const [kaosCategoriesList, setKaosCategoriesList] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_KAOS_CAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...DEFAULT_KAOS_CATEGORIES, ...parsed.map((c) => String(c).toUpperCase())]));
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_KAOS_CATEGORIES;
  });

  const [newKaosCategoryInput, setNewKaosCategoryInput] = useState('');
  const [showAddKaosCategory, setShowAddKaosCategory] = useState(false);

  // Material list with persistence
  const [materialsList, setMaterialsList] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_MATERIALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = Array.from(new Set([...DEFAULT_MATERIALS, ...parsed]));
          return merged;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_MATERIALS;
  });

  const [newMaterialInput, setNewMaterialInput] = useState('');
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  // Exclusive category list with persistence
  const [exclusiveCategories, setExclusiveCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_EXCLUSIVE_CAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...DEFAULT_EXCLUSIVE_CATEGORIES, ...parsed];
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_EXCLUSIVE_CATEGORIES;
  });

  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Tombstone "dihapus" untuk tiap list (agar default/custom bisa dihapus permanen)
  const [removedKaosCats, setRemovedKaosCats] = useState(() => readRemovedValues(REMOVED_KAOS_CAT_KEY));
  const [removedCuttings, setRemovedCuttings] = useState(() => readRemovedValues(REMOVED_CUTTINGS_KEY));
  const [removedMaterials, setRemovedMaterials] = useState(() => readRemovedValues(REMOVED_MATERIALS_KEY));
  const [removedExclusiveCats, setRemovedExclusiveCats] = useState(() => readRemovedValues(REMOVED_EXCLUSIVE_CAT_KEY));

  // Panel "Kelola & Hapus" per list
  const [showManageCutting, setShowManageCutting] = useState(false);
  const [showManageKaosCat, setShowManageKaosCat] = useState(false);
  const [showManageMaterial, setShowManageMaterial] = useState(false);
  const [showManageExclusiveCat, setShowManageExclusiveCat] = useState(false);

  // List bersih: default + custom, dikurangi yang sudah dihapus admin
  const cleanCuttingsList = cuttingsList.filter((c) => !removedCuttings.includes(c.value));
  const cleanKaosCategoriesList = kaosCategoriesList.filter(
    (c) => !removedKaosCats.includes(String(c).toLowerCase())
  );
  const cleanMaterialsList = materialsList.filter((m) => !removedMaterials.includes(m));
  const cleanExclusiveCategories = exclusiveCategories.filter(
    (c) => !removedExclusiveCats.includes(c.value)
  );

  // Hapus item dari list (tombstone permanen + cek pemakaian produk)
  const handleDeleteListItem = ({ kind, value }) => {
    const labelMap = {
      cuttings: {
        key: REMOVED_CUTTINGS_KEY,
        fields: ['cutting_type'],
        current: formData.cutting_type,
        setCurrent: (next) => setFormData((prev) => ({ ...prev, cutting_type: next })),
        cleanList: cleanCuttingsList,
      },
      kaosCat: {
        key: REMOVED_KAOS_CAT_KEY,
        fields: ['kaos_category', 'category_label'],
        current: (formData.category_label || '').toUpperCase(),
        setCurrent: (next) =>
          setFormData((prev) => ({ ...prev, category_label: next, kaos_category: next })),
        cleanList: cleanKaosCategoriesList,
      },
      materials: {
        key: REMOVED_MATERIALS_KEY,
        fields: ['material'],
        current: formData.material,
        setCurrent: (next) => setFormData((prev) => ({ ...prev, material: next })),
        cleanList: cleanMaterialsList,
      },
      exclusiveCat: {
        key: REMOVED_EXCLUSIVE_CAT_KEY,
        fields: ['exclusive_category'],
        current: formData.exclusive_category,
        setCurrent: (next) => setFormData((prev) => ({ ...prev, exclusive_category: next })),
        cleanList: cleanExclusiveCategories,
      },
    };

    const conf = labelMap[kind];
    if (!conf || !value) return;

    const usedCount = countProductsUsing(conf.fields, value);
    const warnText =
      usedCount > 0
        ? `Nilai "${value}" masih dipakai oleh ${usedCount} produk di katalog.\n\nTetap hapus dari daftar pilihan? (Produk yang sudah memakai tidak akan berubah, hanya pilihannya yang hilang dari dropdown/filter.)`
        : `Hapus "${value}" dari daftar pilihan?`;
    if (!window.confirm(warnText)) return;

    const nextRemoved =
      kind === 'kaosCat' ? [...removedKaosCats, String(value).toLowerCase()]
      : kind === 'exclusiveCat' ? [...removedExclusiveCats, value]
      : kind === 'cuttings' ? [...removedCuttings, value]
      : [...removedMaterials, value];

    const setterMap = {
      cuttings: setRemovedCuttings,
      kaosCat: setRemovedKaosCats,
      materials: setRemovedMaterials,
      exclusiveCat: setRemovedExclusiveCats,
    };
    setterMap[kind](nextRemoved);
    writeRemovedValues(conf.key, nextRemoved);

    // Kalau nilai form saat ini adalah yang dihapus, pindahkan ke pilihan lain
    if (String(conf.current || '').toLowerCase() === String(value).toLowerCase()) {
      const remaining = conf.cleanList.find((item) => {
        const itemVal = kind === 'kaosCat' ? String(item).toLowerCase() : item.value;
        return String(itemVal).toLowerCase() !== String(value).toLowerCase();
      });
      const fallback =
        kind === 'kaosCat'
          ? remaining || 'KASUAL'
          : kind === 'cuttings'
          ? remaining?.value || 'oversized'
          : kind === 'exclusiveCat'
          ? remaining?.value || ''
          : remaining || 'Cotton Combed 24s';
      conf.setCurrent(fallback);
    }
  };

  // Online image url input helper
  const [onlineImageUrl, setOnlineImageUrl] = useState('');

  const [customColor, setCustomColor] = useState('#000000');
  const [colorWheelOpen, setColorWheelOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Populate data when modal opens
  useEffect(() => {
    const storedCharts = getStoredSizeCharts();
    const getChartRows = (cutKey) => {
      const chart = storedCharts[cutKey] || storedCharts.regular;
      return chart.rows.map((r) => ({ ...r }));
    };

    if (product && (product.id || product.is_copy)) {
      const initialImages = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image_url
        ? [product.image_url]
        : [];
      const cutType = product.cutting_type || 'oversized';
      const catLabel = (product.kaos_category || product.category_label || 'KASUAL').toUpperCase();
      const initialSizeChart =
        Array.isArray(product.size_chart) && product.size_chart.length > 0
          ? product.size_chart.map((r) => ({ ...r }))
          : getChartRows(cutType);

      setFormData({
        name: product.name || '',
        product_group: product.product_group || 'harian',
        cutting_type: cutType,
        sablon_type: product.sablon_type || 'dtf',
        exclusive_category: product.exclusive_category ?? '',
        category_label: catLabel,
        kaos_category: catLabel,
        material: product.material || 'Cotton Combed 24s',
        priceText: formatNumberDots(product.price || 0),
        originalPriceText: formatNumberDots(product.original_price || ''),
        description: product.description || '',
        image_url: initialImages[0] || product.image_url || '',
        images: initialImages,
        visual_mode: initialImages.length > 0 ? 'image' : 'mockup',
        is_new: Boolean(product.is_new),
        is_exclusive: Boolean(product.is_exclusive || product.product_group === 'eksklusif'),
        is_customizable:
          typeof product.is_customizable === 'boolean'
            ? product.is_customizable
            : !Boolean(product.is_exclusive || product.product_group === 'eksklusif'),
        is_preorder: Boolean(product.is_preorder),
        preorder_duration: product.preorder_duration || '',
        placeholder_title: product.placeholder_title || product.name || '',
        placeholder_bg: product.placeholder_bg || '#E5E7EB',
        placeholder_text_color: product.placeholder_text_color || '#374151',
        colors: safeColors(product.colors),
        extra_colors_count: product.extra_colors_count || 0,
        size_chart: initialSizeChart,
        mockup_angles: product.mockup_angles || { front: '', back: '', left: '', right: '' },
      });

      if (cutType && !cuttingsList.some((c) => c.value === cutType)) {
        setCuttingsList((prev) => [...prev, { value: cutType, label: cutType.toUpperCase() }]);
      }
      if (catLabel) {
        setKaosCategoriesList((prev) => (prev.includes(catLabel) ? prev : [catLabel, ...prev]));
      }
      if (product.material) {
        setMaterialsList((prev) => (prev.includes(product.material) ? prev : [product.material, ...prev]));
      }
    } else if (product && product.product_group === 'eksklusif') {
      setFormData({
        name: '',
        product_group: 'eksklusif',
        cutting_type: 'oversized',
        sablon_type: 'plastisol',
        exclusive_category: 'dilio',
        category_label: 'STREETWEAR',
        kaos_category: 'STREETWEAR',
        material: 'Cotton Combed 24s',
        priceText: '185.000',
        originalPriceText: '220.000',
        description: 'Koleksi eksklusif limited edition dengan desain spesial dan bahan premium.',
        image_url: '',
        images: [],
        visual_mode: 'image',
        is_new: true,
        is_exclusive: true,
        is_customizable: false,
        is_preorder: false,
        preorder_duration: '',
        placeholder_title: 'LIMITED\nEDITION',
        placeholder_bg: '#1E293B',
        placeholder_text_color: '#FACC15',
        colors: ['#000000'],
        extra_colors_count: 0,
        size_chart: getChartRows('oversized'),
        mockup_angles: { front: '', back: '', left: '', right: '' },
      });
    } else {
      setFormData({
        name: '',
        product_group: 'harian',
        cutting_type: 'oversized',
        sablon_type: 'dtf',
        exclusive_category: 'dilio',
        category_label: 'KASUAL',
        kaos_category: 'KASUAL',
        material: 'Cotton Combed 24s',
        priceText: '65.000',
        originalPriceText: '',
        description: 'Potongan longgar dengan drop shoulder, cocok untuk gaya streetwear.',
        image_url: '',
        images: [],
        visual_mode: 'image',
        is_new: false,
        is_exclusive: false,
        is_customizable: false,
        is_preorder: false,
        preorder_duration: '',
        placeholder_title: 'Oversized\nFit',
        placeholder_bg: '#E5E7EB',
        placeholder_text_color: '#374151',
        colors: ['#000000'],
        extra_colors_count: 0,
        size_chart: getChartRows('oversized'),
        mockup_angles: { front: '', back: '', left: '', right: '' },
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Handle Multi Image File Upload
  const handleMultipleImagesUpload = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setIsUploading(true);
    const newImageUrls = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} melebihi ukuran maksimal 5MB.`);
        continue;
      }

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
            newImageUrls.push(publicUrlData.publicUrl);
            continue;
          }
        }

        // Fallback to Base64
        const base64Url = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        newImageUrls.push(base64Url);
      } catch {
        const base64Url = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        newImageUrls.push(base64Url);
      }
    }

    if (newImageUrls.length > 0) {
      setFormData((prev) => {
        const updatedImages = [...prev.images, ...newImageUrls];
        return {
          ...prev,
          images: updatedImages,
          image_url: updatedImages[0] || '',
          visual_mode: 'image',
        };
      });
    }

    setIsUploading(false);
  };

  // Angle Image Upload (Belakang, Kiri, Kanan untuk Studio Custom)
  const handleAngleImageUpload = async (angleKey, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(`File ${file.name} melebihi ukuran maksimal 5MB.`);
      return;
    }

    setIsUploading(true);
    let finalUrl = '';
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `angle-${angleKey}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          finalUrl = publicUrlData.publicUrl;
        }
      }

      if (!finalUrl) {
        finalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }
    } catch {
      finalUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    if (finalUrl) {
      setFormData((prev) => ({
        ...prev,
        mockup_angles: {
          ...(prev.mockup_angles || {}),
          [angleKey]: finalUrl,
        },
      }));
    }
    setIsUploading(false);
  };

  const handleRemoveAngleImage = (angleKey) => {
    setFormData((prev) => ({
      ...prev,
      mockup_angles: {
        ...(prev.mockup_angles || {}),
        [angleKey]: '',
      },
    }));
  };

  // Add Online Image URL
  const handleAddOnlineImageUrl = () => {
    if (!onlineImageUrl.trim()) return;
    const url = onlineImageUrl.trim();
    setFormData((prev) => {
      const updated = [...prev.images, url];
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || '',
        visual_mode: 'image',
      };
    });
    setOnlineImageUrl('');
  };

  // Set an image as primary thumbnail
  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => {
      const target = prev.images[index];
      const remaining = prev.images.filter((_, i) => i !== index);
      const reordered = [target, ...remaining];
      return {
        ...prev,
        images: reordered,
        image_url: reordered[0],
      };
    });
  };

  // Delete an image
  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || '',
        visual_mode: updated.length > 0 ? 'image' : 'mockup',
      };
    });
  };

  // Add new material
  const handleAddNewMaterial = () => {
    const trimmed = newMaterialInput.trim();
    if (!trimmed) return;
    if (!materialsList.includes(trimmed)) {
      const updated = [...materialsList, trimmed];
      setMaterialsList(updated);
      try {
        localStorage.setItem(CUSTOM_MATERIALS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setFormData((prev) => ({ ...prev, material: trimmed }));
    setNewMaterialInput('');
    setShowAddMaterial(false);
  };

  // Add new cutting type
  const handleAddNewCutting = () => {
    const trimmed = newCuttingInput.trim();
    if (!trimmed) return;
    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!slug) return;
    const newCut = { value: slug, label: trimmed };

    if (!cuttingsList.some((c) => c.value === slug)) {
      const updated = [...cuttingsList, newCut];
      setCuttingsList(updated);
      try {
        localStorage.setItem(CUSTOM_CUTTINGS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setFormData((prev) => ({ ...prev, cutting_type: slug }));
    setNewCuttingInput('');
    setShowAddCutting(false);
  };

  // Add new kaos category (Kasual, Polo, Olahraga, Hoodie, etc.)
  const handleAddNewKaosCategory = () => {
    const trimmed = newKaosCategoryInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!kaosCategoriesList.includes(trimmed)) {
      const updated = [...kaosCategoriesList, trimmed];
      setKaosCategoriesList(updated);
      try {
        localStorage.setItem(CUSTOM_KAOS_CAT_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setFormData((prev) => ({
      ...prev,
      category_label: trimmed,
      kaos_category: trimmed,
    }));
    setNewKaosCategoryInput('');
    setShowAddKaosCategory(false);
  };

  // Size chart row handlers
  const handleSizeChartChange = (index, field, val) => {
    setFormData((prev) => {
      const rows = Array.isArray(prev.size_chart) ? [...prev.size_chart] : [];
      rows[index] = { ...rows[index], [field]: val };
      return { ...prev, size_chart: rows };
    });
  };

  const handleAddSizeRow = () => {
    setFormData((prev) => ({
      ...prev,
      size_chart: [
        ...(Array.isArray(prev.size_chart) ? prev.size_chart : []),
        { size: 'XXL', chest: '58', length: '76', sleeve: '25' },
      ],
    }));
  };

  const handleRemoveSizeRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      size_chart: (prev.size_chart || []).filter((_, i) => i !== index),
    }));
  };

  const handleResetSizeChart = () => {
    const stored = getStoredSizeCharts();
    const cutKey = formData.cutting_type || 'regular';
    const chart = stored[cutKey] || stored.regular;
    setFormData((prev) => ({
      ...prev,
      size_chart: chart.rows.map((r) => ({ ...r })),
    }));
  };

  // Add new exclusive category
  const handleAddNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const newCat = { value: slug, label: trimmed };

    if (!exclusiveCategories.some((c) => c.value === slug)) {
      const updated = [...exclusiveCategories, newCat];
      setExclusiveCategories(updated);
      try {
        const customOnly = updated.filter(
          (c) => !DEFAULT_EXCLUSIVE_CATEGORIES.some((d) => d.value === c.value)
        );
        localStorage.setItem(CUSTOM_EXCLUSIVE_CAT_KEY, JSON.stringify(customOnly));
      } catch {
        // ignore
      }
    }
    setFormData((prev) => ({ ...prev, exclusive_category: slug }));
    setNewCategoryInput('');
    setShowAddCategory(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'category_label') {
        updated.kaos_category = value;
      }

      if (name === 'is_exclusive') {
        updated.product_group = checked ? 'eksklusif' : 'harian';
      }

      return updated;
    });
  };

  // Real-time dotted price handlers
  const handlePriceChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      priceText: formatNumberDots(rawDigits),
    }));
  };

  const handleOriginalPriceChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      originalPriceText: formatNumberDots(rawDigits),
    }));
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

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama produk wajib diisi.');
      return;
    }

    const numericPrice = parseNumberDots(formData.priceText);
    const numericOriginalPrice = parseNumberDots(formData.originalPriceText);

    if (numericPrice <= 0) {
      alert('Harga produk harus lebih dari 0.');
      return;
    }

    const { visual_mode: _vm, priceText: _pt, originalPriceText: _opt, ...restData } = formData;

    const isExcl = Boolean(formData.is_exclusive);
    const cutKey = formData.cutting_type || 'oversized';

    const payload = {
      ...restData,
      product_group: isExcl ? 'eksklusif' : 'harian',
      price: numericPrice,
      original_price: numericOriginalPrice > 0 ? numericOriginalPrice : null,
      images: formData.images,
      image_url: formData.images[0] || formData.image_url || '',
      is_preorder: Boolean(formData.is_preorder),
      preorder_duration: formData.is_preorder ? formData.preorder_duration : '',
      extra_colors_count: Number(formData.extra_colors_count) || 0,
      is_exclusive: isExcl,
      is_customizable: Boolean(formData.is_customizable),
      cutting_type: cutKey,
      kaos_category: formData.category_label || 'KASUAL',
      category_label: formData.category_label || 'KASUAL',
      size_chart: Array.isArray(formData.size_chart) ? formData.size_chart : [],
      sablon_type: null,
      exclusive_category: isExcl ? formData.exclusive_category : null,
      placeholder_title: formData.placeholder_title || formData.name,
      colors: safeColors(formData.colors),
      mockup_angles: formData.is_customizable ? (formData.mockup_angles || null) : null,
    };

    onSave(payload);
  };

  const isEditing = Boolean(product && product.id && !product.is_copy);
  const isDuplicating = Boolean(product && product.is_copy);

  // Discount preview calculation
  const numPrice = parseNumberDots(formData.priceText);
  const numOrig = parseNumberDots(formData.originalPriceText);
  const discountInfo = computeDiscountInfo(numPrice, numOrig);

  const handleSwapPrices = () => {
    setFormData((prev) => ({
      ...prev,
      priceText: prev.originalPriceText,
      originalPriceText: prev.priceText,
    }));
  };

  const handleApplyDeductionAsOriginal = () => {
    if (discountInfo.hasDiscount && discountInfo.displayOriginalPrice) {
      setFormData((prev) => ({
        ...prev,
        originalPriceText: formatNumberDots(discountInfo.displayOriginalPrice),
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
              {isDuplicating ? (
                <>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Duplikat Produk Baru</span>
                </>
              ) : isEditing ? (
                'Edit Produk'
              ) : formData.product_group === 'eksklusif' ? (
                '👑 Tambah Katalog Exclusive (Limited Edition)'
              ) : (
                'Tambah Produk Baru'
              )}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isDuplicating
                ? `Menyalin dari "${product.name}". Sesuaikan data yang ingin diubah.`
                : 'Kelola data katalog produk Kaos Dilio (Otomatis sync ke website).'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
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
                placeholder="Contoh: Oversized Fit Hitam Solid"
                required
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Price with Auto-Dots */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Harga Jual (Rp) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  name="priceText"
                  value={formData.priceText}
                  onChange={handlePriceChange}
                  placeholder="65.000"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Otomatis titik pemisah ribuan
              </span>
            </div>

            {/* Discount Price (Harga Coret) */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Harga Coret / Normal (Opsional untuk Diskon)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  name="originalPriceText"
                  value={formData.originalPriceText}
                  onChange={handleOriginalPriceChange}
                  placeholder="Contoh: 85.000"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              {discountInfo.hasDiscount && (
                <div className="mt-2 space-y-1.5">
                  <div className="text-xs text-red-600 font-bold flex items-center flex-wrap gap-1.5 bg-red-50 p-2 rounded-xl border border-red-200">
                    <span>🏷️ Promo Aktif: Diskon {discountInfo.discountPercent}%</span>
                    <span className="text-[11px] font-normal text-red-500">
                      (Hemat Rp {formatNumberDots(discountInfo.savings)})
                    </span>
                    <span className="text-[11px] text-neutral-600 font-medium block w-full mt-0.5">
                      Tampil di Web: Coret <span className="line-through font-bold text-neutral-500">Rp {formatNumberDots(discountInfo.displayOriginalPrice)}</span> → Harga Jual <span className="font-black text-neutral-900">Rp {formatNumberDots(numPrice)}</span>
                    </span>
                  </div>
                  {discountInfo.isDeductionMode && (
                    <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold">💡 Input Rp {formatNumberDots(numOrig)} otomatis dihitung sebagai potongan hemat Rp {formatNumberDots(discountInfo.savings)}.</span>
                        <span className="block text-[10px] text-amber-700">Web akan otomatis mencoret Rp {formatNumberDots(discountInfo.displayOriginalPrice)} (persis Foto 4).</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleApplyDeductionAsOriginal}
                          className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-1 rounded-md cursor-pointer transition-colors"
                          title="Ubah angka di form menjadi Rp 150.000 agar eksplisit"
                        >
                          Set Rp {formatNumberDots(discountInfo.displayOriginalPrice)}
                        </button>
                        <button
                          type="button"
                          onClick={handleSwapPrices}
                          className="text-[10px] underline text-amber-900 font-semibold cursor-pointer px-1"
                        >
                          Tukar Posisi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ceklis 1: Pre-Order Toggle & Duration */}
            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
              <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-neutral-900 text-xs uppercase tracking-wider">
                <input
                  type="checkbox"
                  name="is_preorder"
                  checked={formData.is_preorder}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Produk Pre-Order (PO)</span>
              </label>

              {formData.is_preorder && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-bold text-amber-900">
                    Estimasi Lama Pre-Order:
                  </label>
                  <input
                    type="text"
                    name="preorder_duration"
                    value={formData.preorder_duration}
                    onChange={handleChange}
                    placeholder="Contoh: 7 Hari Kerja, 10 Hari, 14 Hari"
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['1-2 Hari', '2-3 Hari', '3-5 Hari', '7 Hari Kerja', '14 Hari Kerja'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, preorder_duration: chip }))}
                        className="px-2 py-0.5 rounded-md bg-white border border-amber-300 hover:bg-amber-100 text-[10px] font-bold text-amber-950 transition-colors cursor-pointer"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Khusus Form Katalog Exclusive: Pilihan Kategori dibuat ceklis (seperti Pre-Order) */}
            {formData.product_group === 'eksklusif' && (
              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-neutral-900 text-xs uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.exclusive_category)}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setFormData((prev) => ({ ...prev, exclusive_category: '' }));
                      } else {
                        const firstCat = cleanExclusiveCategories[0]?.value || '';
                        setFormData((prev) => ({ ...prev, exclusive_category: firstCat }));
                      }
                    }}
                    className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>👑 Kategori Khusus Exclusive</span>
                </label>

                <p className="text-[10px] text-neutral-500">
                  {Boolean(formData.exclusive_category)
                    ? 'Baju akan masuk ke tab kategori yang dipilih di bawah.'
                    : 'Kosongkan jika baju eksklusif ini tidak ada kategori khusus (langsung tampil di "Semua").'}
                </p>

                {Boolean(formData.exclusive_category) && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-neutral-700">
                        Pilih Kategori:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddCategory(!showAddCategory)}
                          className="text-[10px] font-bold text-neutral-900 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Tambah</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowManageExclusiveCat(!showManageExclusiveCat)}
                          className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Kelola</span>
                        </button>
                      </div>
                    </div>

                    <select
                      name="exclusive_category"
                      value={formData.exclusive_category}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
                    >
                      {cleanExclusiveCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>

                    {showManageExclusiveCat && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex flex-wrap gap-1.5">
                          {cleanExclusiveCategories.map((cat) => (
                            <span
                              key={cat.value}
                              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-white border border-neutral-200 rounded-full text-[10px] font-semibold text-neutral-800"
                            >
                              {cat.label}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteListItem({ kind: 'exclusiveCat', value: cat.value })
                                }
                                className="p-0.5 text-neutral-400 hover:text-red-600 rounded cursor-pointer"
                                title={`Hapus ${cat.label}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {showAddCategory && (
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          placeholder="Nama kategori exclusive baru..."
                          className="flex-1 px-2.5 py-1 bg-white border border-neutral-300 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          className="px-2.5 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                        >
                          Simpan
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Ceklis 3: Fitur Desain Custom Kaos Ini + Upload Sudut Mockup */}
            <div className={`bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-3 ${formData.product_group === "eksklusif" ? "sm:col-span-2" : "sm:col-span-1"}`}>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-neutral-900 text-xs uppercase tracking-wider">
                  <input
                    type="checkbox"
                    name="is_customizable"
                    checked={formData.is_customizable}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>✏️ Aktifkan Fitur "Desain Custom Kaos Ini"</span>
                </label>
                <span className="text-[11px] text-neutral-500">
                  {formData.is_customizable
                    ? '✅ Tombol Desain Custom tampil di katalog'
                    : 'Kosongkan jika kaos sudah bergambar/sablon'}
                </span>
              </div>

              {formData.is_customizable && (
                <div className="pt-2 border-t border-neutral-200/80 space-y-2.5 animate-in fade-in duration-150">
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Upload foto baju tampak <strong>Belakang, Lengan Kiri, dan Lengan Kanan</strong> agar pembeli bisa menempelkan desain sablon di setiap sisi baju ini saat membuka Studio Custom:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'back', label: 'Tampak Belakang', desc: 'Punggung baju' },
                      { key: 'left', label: 'Lengan Kiri', desc: 'Sisi lengan kiri' },
                      { key: 'right', label: 'Lengan Kanan', desc: 'Sisi lengan kanan' },
                    ].map((slot) => {
                      const currentVal = formData.mockup_angles?.[slot.key];
                      return (
                        <div
                          key={slot.key}
                          className="bg-white rounded-xl border border-neutral-200 p-2.5 flex flex-col gap-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-neutral-800">{slot.label}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                currentVal
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-neutral-100 text-neutral-500'
                              }`}
                            >
                              {currentVal ? 'Terisi' : 'Default Pola'}
                            </span>
                          </div>

                          <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200/70 flex items-center justify-center group">
                            {currentVal ? (
                              <>
                                <img
                                  src={currentVal}
                                  alt={slot.label}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <label className="px-2.5 py-1.5 bg-white text-neutral-900 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-neutral-100 shadow-xs">
                                    Ganti
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={isUploading}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAngleImageUpload(slot.key, file);
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAngleImage(slot.key)}
                                    className="p-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700 cursor-pointer shadow-xs"
                                    title="Hapus foto sudut ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-neutral-200/50 transition-colors">
                                <Plus className="w-5 h-5 text-neutral-400 mb-1" />
                                <span className="text-[11px] font-bold text-neutral-700">Upload Foto</span>
                                <span className="text-[9px] text-neutral-400 mt-0.5">{slot.desc}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAngleImageUpload(slot.key, file);
                                  }}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Category Sub-filter & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            {/* Pola Cutting (Sidebar Filter: Oversized, Regular, Fitted, Boxy, Long Sleeve + Add New) */}
            {(true) && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Pola Cutting (Filter Sidebar)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCutting(!showAddCutting)}
                    className="text-[11px] font-bold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Cutting Baru</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManageCutting(!showManageCutting)}
                    className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer ml-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Kelola &amp; Hapus</span>
                  </button>
                </div>

                <select
                  name="cutting_type"
                  value={formData.cutting_type || 'oversized'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
                >
                  {cleanCuttingsList.map((cut) => (
                    <option key={cut.value} value={cut.value}>
                      {cut.label}
                    </option>
                  ))}
                </select>

                {showManageCutting && (
                  <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                    <span className="text-[10px] text-neutral-500 block">
                      Item yang dihapus tidak tampil lagi di dropdown, filter sidebar katalog, dan tab
                      kategori (termasuk opsi default bawaan). Produk yang memakai tidak ikut berubah.
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cleanCuttingsList.map((cut) => (
                        <span
                          key={cut.value}
                          className="inline-flex items-center gap-1 pl-2 pr-1 py-1 bg-white border border-neutral-200 rounded-full text-[11px] font-semibold text-neutral-800"
                        >
                          {cut.label}
                          <button
                            type="button"
                            onClick={() => handleDeleteListItem({ kind: 'cuttings', value: cut.value })}
                            className="p-0.5 text-neutral-400 hover:text-red-600 rounded cursor-pointer"
                            title={`Hapus ${cut.label}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showAddCutting && (
                  <div className="mt-2 flex gap-1.5 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={newCuttingInput}
                      onChange={(e) => setNewCuttingInput(e.target.value)}
                      placeholder="Contoh: Raglan, Crop Tee, Muscle Fit..."
                      className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCutting}
                      className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                )}
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



            {/* Material Dropdown + Add New Material (Req 5) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Bahan Kain (Material)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddMaterial(!showAddMaterial)}
                  className="text-[11px] font-bold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Bahan Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManageMaterial(!showManageMaterial)}
                  className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer ml-2"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Kelola &amp; Hapus</span>
                </button>
              </div>

              <select
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
              >
                {cleanMaterialsList.map((mat) => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                ))}
              </select>

              {showManageMaterial && (
                <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                  <div className="flex flex-wrap gap-1.5">
                    {cleanMaterialsList.map((mat) => (
                      <span
                        key={mat}
                        className="inline-flex items-center gap-1 pl-2 pr-1 py-1 bg-white border border-neutral-200 rounded-full text-[11px] font-semibold text-neutral-800"
                      >
                        {mat}
                        <button
                          type="button"
                          onClick={() => handleDeleteListItem({ kind: 'materials', value: mat })}
                          className="p-0.5 text-neutral-400 hover:text-red-600 rounded cursor-pointer"
                          title={`Hapus ${mat}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showAddMaterial && (
                <div className="mt-2 flex gap-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={newMaterialInput}
                    onChange={(e) => setNewMaterialInput(e.target.value)}
                    placeholder="Contoh: Heavyweight 16s, Cotton Combed 20s"
                    className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewMaterial}
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              )}
            </div>

            {/* Kategori / Jenis Kaos (Label di Card & Filter Atas) - Dropdown + Add New (Req 1) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Kategori / Jenis Kaos (Label di Card)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddKaosCategory(!showAddKaosCategory)}
                  className="text-[11px] font-bold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Kategori Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManageKaosCat(!showManageKaosCat)}
                  className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer ml-2"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Kelola &amp; Hapus</span>
                </button>
              </div>

              <select
                name="category_label"
                value={formData.category_label}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-neutral-900"
              >
                {cleanKaosCategoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {showManageKaosCat && (
                <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                  <span className="text-[10px] text-neutral-500 block">
                    Item yang dihapus tidak tampil lagi sebagai tab kategori katalog (Kasual, Polo,
                    dll). Produk yang memakai tidak ikut berubah.
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cleanKaosCategoriesList.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 pl-2 pr-1 py-1 bg-white border border-neutral-200 rounded-full text-[11px] font-semibold text-neutral-800"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => handleDeleteListItem({ kind: 'kaosCat', value: cat })}
                          className="p-0.5 text-neutral-400 hover:text-red-600 rounded cursor-pointer"
                          title={`Hapus ${cat}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showAddKaosCategory && (
                <div className="mt-2 flex gap-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={newKaosCategoryInput}
                    onChange={(e) => setNewKaosCategoryInput(e.target.value)}
                    placeholder="Contoh: HOODIE, KASUAL, POLO..."
                    className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewKaosCategory}
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2B. Editable Size Chart (Req 4) */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-neutral-700" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Informasi Size Chart Produk (cm)
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Sesuaikan ukuran Lebar Dada, Panjang Badan, & Panjang Lengan untuk produk ini.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSizeChart}
                  className="px-2.5 py-1 text-[11px] font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 cursor-pointer"
                >
                  Reset Sesuai Cutting
                </button>
                <button
                  type="button"
                  onClick={handleAddSizeRow}
                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Ukuran</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-neutral-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2 px-3">Size</th>
                    <th className="py-2 px-3">Lebar Dada (cm)</th>
                    <th className="py-2 px-3">Panjang Badan (cm)</th>
                    <th className="py-2 px-3">Lengan (cm)</th>
                    <th className="py-2 px-2 text-center w-10">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(formData.size_chart || []).map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={row.size}
                          onChange={(e) => handleSizeChartChange(idx, 'size', e.target.value)}
                          className="w-16 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg font-bold text-neutral-900"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={row.chest}
                          onChange={(e) => handleSizeChartChange(idx, 'chest', e.target.value)}
                          className="w-full px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={row.length}
                          onChange={(e) => handleSizeChartChange(idx, 'length', e.target.value)}
                          className="w-full px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={row.sleeve}
                          onChange={(e) => handleSizeChartChange(idx, 'sleeve', e.target.value)}
                          className="w-full px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeRow(idx)}
                          className="p-1 text-neutral-400 hover:text-red-600 rounded-lg cursor-pointer"
                          title="Hapus baris ukuran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Description & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-6 pt-2">
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

          {/* 4. Multi-Image Upload (Req 3) */}
          <div className="border-t border-neutral-100 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Foto Produk (Bisa Diisi Lebih Dari 1 Gambar)
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Foto pertama akan menjadi foto utama (thumbnail) di katalog.
                </p>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, visual_mode: 'mockup' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.visual_mode === 'image'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  📷 Foto Asli Produk ({formData.images.length})
                </button>
              </div>
            </div>

            {formData.visual_mode === 'image' ? (
              <div className="space-y-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                {/* Upload & Add Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Pilih Foto dari Komputer (Bisa pilih sekaligus banyak)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleMultipleImagesUpload}
                      className="w-full text-xs text-neutral-600 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer disabled:opacity-50"
                    />
                    {isUploading && (
                      <span className="text-[11px] font-bold text-neutral-900 inline-flex items-center gap-1 mt-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Mengunggah foto...
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Atau Tambah Link Gambar Online
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={onlineImageUrl}
                        onChange={(e) => setOnlineImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... atau link foto"
                        className="flex-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddOnlineImageUrl}
                        className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>

                {/* Uploaded Images Gallery Grid */}
                {formData.images.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-neutral-700 block">
                      Daftar Foto Produk ({formData.images.length} Foto):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-2xs aspect-square flex flex-col"
                        >
                          <img
                            src={imgUrl}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Primary Badge */}
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 bg-neutral-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>Utama</span>
                            </span>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1 text-white">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="px-2 py-1 bg-white/20 hover:bg-white/40 text-[10px] font-bold rounded cursor-pointer"
                              >
                                Jadi Utama
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 text-red-300 hover:text-red-100 rounded cursor-pointer"
                              title="Hapus foto ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-dashed border-neutral-300 text-center text-xs text-neutral-400">
                    Belum ada foto ditambahkan. Klik tombol upload di atas untuk menambahkan 1 atau beberapa foto.
                  </div>
                )}


              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 items-start bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70">
                {/* Live Mockup Preview */}
                <div
                  className="w-36 h-44 rounded-2xl flex flex-col items-center justify-center p-3 text-center shadow-xs border border-neutral-200/50 shrink-0 relative overflow-hidden"
                  style={{ backgroundColor: formData.placeholder_bg }}
                >
                  <span
                    className="text-base font-extrabold whitespace-pre-line leading-tight"
                    style={{ color: formData.placeholder_text_color }}
                  >
                    {formData.placeholder_title || 'Teks Produk'}
                  </span>
                </div>

                <div className="flex-1 space-y-3 w-full">
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
                      className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs"
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
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            formData.placeholder_bg === preset.hex
                              ? 'ring-2 ring-neutral-900 border-transparent scale-110'
                              : 'border-neutral-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                        >
                          {formData.placeholder_bg === preset.hex && (
                            <Check className="w-3.5 h-3.5" style={{ color: preset.text }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Color Dots Swatches */}
          <div className="border-t border-neutral-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Varian Warna Produk
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
                    className="text-neutral-400 hover:text-red-500 ml-0.5 cursor-pointer"
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
                  className="w-6 h-6 rounded-full border border-neutral-300 hover:scale-110 transition-transform shadow-2xs cursor-pointer"
                  style={{ backgroundColor: hex }}
                  title={`Tambah ${hex}`}
                />
              ))}
              <button
                type="button"
                onClick={() => setColorWheelOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg shadow-2xs hover:shadow transition-all cursor-pointer ml-1.5"
                title="Buka Roda Warna (Color Wheel) Custom"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-indigo-500 inline-block" />
                <span>+ Custom</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs shadow-md hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 cursor-pointer"
            >
              {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isUploading
                  ? 'Mengunggah Foto...'
                  : isDuplicating
                  ? 'Simpan Sebagai Produk Baru'
                  : isEditing
                  ? 'Simpan Perubahan'
                  : 'Tambah Produk'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Color Wheel Custom Picker Modal */}
      <ColorWheelModal
        isOpen={colorWheelOpen}
        initialColor={customColor || '#5FADA6'}
        onClose={() => setColorWheelOpen(false)}
        onSelectColor={(hex) => {
          setCustomColor(hex);
          addColorDot(hex);
        }}
      />
    </div>
  );
}
