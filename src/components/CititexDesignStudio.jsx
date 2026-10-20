import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, FabricImage, Textbox } from 'fabric';
import {
  Shirt,
  Upload,
  Type,
  Sparkles,
  Layers,
  HelpCircle,
  Undo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ShoppingCart,
  Check,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  X,
  MessageCircle,
  Save,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

// Base URL helper to support subpath deployment (GitHub Pages) and custom domain
const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

// 16 Authentic Colors corresponding to our real studio photoshoot cutouts in public/mockup-assets/
export const PRODUCT_COLORS = [
  { id: 'black', name: 'Black', hex: '#181818', isDark: true },
  { id: 'white', name: 'White', hex: '#FBFBFB', isDark: false },
  { id: 'sport_grey', name: 'Sport Grey', hex: '#A0A5AA', isDark: false },
  { id: 'navy', name: 'Navy', hex: '#1B2430', isDark: true },
  { id: 'maroon', name: 'Maroon', hex: '#581825', isDark: true },
  { id: 'red', name: 'Red', hex: '#C51D24', isDark: true },
  { id: 'royal_blue', name: 'Royal Blue', hex: '#1F4591', isDark: true },
  { id: 'forest_green', name: 'Forest Green', hex: '#1E3A2F', isDark: true },
  { id: 'military_green', name: 'Military Green', hex: '#464B35', isDark: true },
  { id: 'charcoal', name: 'Charcoal', hex: '#33373B', isDark: true },
  { id: 'mustard', name: 'Mustard', hex: '#D99426', isDark: true },
  { id: 'salmon', name: 'Salmon', hex: '#DE7E68', isDark: false },
  { id: 'lilac', name: 'Lilac', hex: '#A593B6', isDark: false },
  { id: 'sand', name: 'Sand', hex: '#D5C3A5', isDark: false },
  { id: 'dark_chocolate', name: 'Dark Chocolate', hex: '#3A2A22', isDark: true },
  { id: 'aqua_sky', name: 'Aqua Sky', hex: '#58A9B2', isDark: false },
];

export const APPAREL_MODELS = [
  {
    id: 'nsa-7200',
    name: 'New States Apparel Premium Cotton 7200',
    category: 'T-Shirts',
    badge: 'BEST SELLER',
    price: 45000,
    specs: [
      '100% cotton ring spun preshrunk jersey knit.',
      '180g/m2 (ketebalan 24s combed).',
      'Single needle 2.2 cm collar.',
      'Taped neck and shoulders.',
      'Tubular construction (tanpa jahitan samping).',
      'Double needle sleeve and bottom hems.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']
  },
  {
    id: 'dilio-boxy',
    name: 'Dilio Heavyweight Boxy Fit 24s',
    category: 'T-Shirts',
    badge: 'POPULER',
    price: 55000,
    specs: [
      '100% Cotton Combed 24s Heavyweight.',
      'Potongan Boxy Streetwear (Drop-shoulder lebar).',
      'Rib leher tebal 3 cm anti melar.',
      'Bahan kokoh, jatuh rapi, dan tidak tembus pandang.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'dilio-oversized',
    name: 'Dilio Oversized Drop Fit 20s',
    category: 'T-Shirts',
    badge: 'TRENDING',
    price: 58000,
    specs: [
      '100% Combed 20s Gramasi 210-220 gsm.',
      'Siluet Oversized santai kekinian.',
      'Lengan lebih panjang mendekati siku.',
      'Super adem untuk iklim tropis Indonesia.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'nsa-3600',
    name: 'New States Apparel Softstyle 3600',
    category: 'T-Shirts',
    badge: 'EKONOMIS',
    price: 38000,
    specs: [
      '100% cotton combed 30s lembut.',
      '150g/m2 terasa ringan & sejuk.',
      'Sangat cocok untuk kaos harian dan event.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 'nsa-7280',
    name: 'New States Apparel Long Sleeve 7280',
    category: 'Long Sleeve',
    badge: 'POPULER',
    price: 58000,
    specs: [
      '100% cotton preshrunk combed 24s.',
      'Lengan panjang dengan rib karet elastis pada manset.',
      'Cocok untuk cuaca dingin dan hijab friendly.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  }
];

export const ANGLES = [
  { id: 'front', label: 'Depan' },
  { id: 'back', label: 'Belakang' },
  { id: 'left', label: 'Lengan Kiri' },
  { id: 'right', label: 'Lengan Kanan' }
];

export const CLIPARTS = [
  { name: 'Streetwear Tiger', category: 'Streetwear', file: 'tiger_streetwear.svg' },
  { name: 'Tokyo Street Sun', category: 'Streetwear', file: 'japanese_sun.svg' },
  { name: 'Retro Surf Club', category: 'Retro', file: 'retro_surf.svg' },
  { name: 'Raw Skull Bones', category: 'Badges', file: 'skull_crossbones.svg' },
  { name: 'Authentic Garment', category: 'Badges', file: 'vintage_badge.svg' },
  { name: 'Need Caffeine', category: 'Foods & Drink', file: 'coffee_lover.svg' }
];

export const FONTS = [
  { name: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans, sans-serif' },
  { name: 'Bebas Neue (Streetwear)', family: 'Bebas Neue, sans-serif' },
  { name: 'Montserrat (Modern)', family: 'Montserrat, sans-serif' },
  { name: 'Oswald (Bold Condensed)', family: 'Oswald, sans-serif' },
  { name: 'Cinzel (Luxury Serif)', family: 'Cinzel, serif' },
  { name: 'Permanent Marker (Graffiti)', family: 'Permanent Marker, cursive' },
  { name: 'Pacifico (Retro Script)', family: 'Pacifico, cursive' },
  { name: 'Courier Prime (Typewriter)', family: 'Courier Prime, monospace' }
];

export default function CititexDesignStudio() {
  // Navigation & Tool states
  const [activeTab, setActiveTab] = useState('product'); // 'product', 'upload', 'text', 'clipart', 'layer', 'help'
  const [currentProduct, setCurrentProduct] = useState(APPAREL_MODELS[0]);
  const [currentColor, setCurrentColor] = useState(PRODUCT_COLORS[0]); // default Black
  const [currentAngle, setCurrentAngle] = useState('front'); // 'front', 'back', 'left', 'right'
  const [selectedSize, setSelectedSize] = useState('L');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Text Tool inputs
  const [textInput, setTextInput] = useState('DILIO');
  const [fontSize, setFontSize] = useState(36);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [selectedFont, setSelectedFont] = useState(FONTS[1]);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState('center');

  // Multi-angle design store (saved objects per angle)
  const designsRef = useRef({
    front: null,
    back: null,
    left: null,
    right: null
  });

  // Layer list state for UI
  const [layersList, setLayersList] = useState([]);
  const [activeObjectId, setActiveObjectId] = useState(null);

  // Modals
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [changeProductOpen, setChangeProductOpen] = useState(false);
  const [pricelistOpen, setPricelistOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [sizeQuantities, setSizeQuantities] = useState({ S: 0, M: 0, L: 2, XL: 1, '2XL': 0 });
  const [customerName, setCustomerName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Canvas refs
  const canvasElRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const fileUploadRef = useRef(null);

  // Real photoshoot backdrop URL
  const shirtPhotoUrl = `${BASE_URL}/mockup-assets/${currentAngle}/${currentColor.id}.jpg`;

  // Update layer list helper
  const syncLayersList = useCallback((canvas) => {
    if (!canvas) return;
    const objs = canvas.getObjects();
    const list = objs.map((o, idx) => ({
      id: o.__id || `layer-${idx}`,
      type: o.type,
      text: o.text || o.__name || (o.type === 'image' ? 'Gambar Upload' : 'Objek Desain'),
      visible: o.visible !== false,
      obj: o
    }));
    setLayersList([...list].reverse());
  }, []);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: 260,
      height: 360,
      selection: true,
      preserveObjectStacking: true
    });

    fabricCanvasRef.current = canvas;

    // Selection box aesthetics
    canvas.selectionColor = 'rgba(59, 130, 246, 0.15)';
    canvas.selectionBorderColor = '#3B82F6';
    canvas.selectionLineWidth = 1.5;

    // Events
    const handleSelection = (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        setActiveObjectId(selected.__id);
        if (selected.type === 'textbox') {
          setTextInput(selected.text || '');
          if (selected.fontSize) setFontSize(selected.fontSize);
          if (selected.fill) setTextColor(selected.fill);
          if (selected.charSpacing !== undefined) {
            setLetterSpacing(Math.round(selected.charSpacing / 50));
          }
          setIsBold(selected.fontWeight === 'bold');
          setIsItalic(selected.fontStyle === 'italic');
          if (selected.textAlign) setTextAlign(selected.textAlign);
          const found = FONTS.find((f) => f.family === selected.fontFamily);
          if (found) setSelectedFont(found);
        }
      }
    };

    canvas.on('object:added', () => syncLayersList(canvas));
    canvas.on('object:removed', () => syncLayersList(canvas));
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setActiveObjectId(null));

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [syncLayersList]);

  // Live Sync: When user adjusts text attributes while a textbox is selected, update it instantly!
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'textbox') {
      activeObj.set({
        text: textInput,
        fontSize: fontSize,
        charSpacing: letterSpacing * 50,
        fill: textColor,
        fontFamily: selectedFont.family,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        textAlign: textAlign
      });
      activeObj.__name = `Teks: ${textInput.slice(0, 15)}`;
      canvas.renderAll();
      syncLayersList(canvas);
    }
  }, [textInput, fontSize, letterSpacing, textColor, selectedFont, isBold, isItalic, textAlign, syncLayersList]);

  // Load / Switch Angle Handler
  const handleAngleSwitch = useCallback(async (newAngle) => {
    if (newAngle === currentAngle) return;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 1. Save current angle canvas objects
    const currentJson = canvas.toJSON();
    designsRef.current[currentAngle] = currentJson;

    // 2. Set new angle
    setCurrentAngle(newAngle);

    // 3. Clear canvas & load stored objects for new angle
    canvas.clear();
    const targetJson = designsRef.current[newAngle];
    if (targetJson && targetJson.objects && targetJson.objects.length > 0) {
      await canvas.loadFromJSON(targetJson);
      canvas.renderAll();
    }
    syncLayersList(canvas);
  }, [currentAngle, syncLayersList]);

  // Add Custom Text to Canvas
  const handleAddText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !textInput.trim()) return;

    const textObj = new Textbox(textInput, {
      left: 130,
      top: 150,
      originX: 'center',
      originY: 'center',
      fill: textColor,
      fontSize: fontSize,
      fontFamily: selectedFont.family,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textAlign: textAlign,
      charSpacing: letterSpacing * 50,
      width: 200,
      cornerColor: '#ffffff',
      cornerStrokeColor: '#3B82F6',
      borderColor: '#3B82F6',
      cornerSize: 10,
      transparentCorners: false
    });

    textObj.__id = `text-${Date.now()}`;
    textObj.__name = `Teks: ${textInput.slice(0, 15)}`;

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    showToast('Teks berhasil ditambahkan ke baju!');
  };

  // Add Uploaded Image to Canvas
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      try {
        const img = await FabricImage.fromURL(dataUrl);
        // Scale down if image is too large for the printable area
        const maxW = 180;
        const maxH = 220;
        if (img.width > maxW || img.height > maxH) {
          const scale = Math.min(maxW / img.width, maxH / img.height);
          img.scale(scale);
        }

        img.set({
          left: 130,
          top: 160,
          originX: 'center',
          originY: 'center',
          cornerColor: '#ffffff',
          cornerStrokeColor: '#3B82F6',
          borderColor: '#3B82F6',
          cornerSize: 10,
          transparentCorners: false
        });

        img.__id = `img-${Date.now()}`;
        img.__name = file.name;

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        showToast('Gambar berhasil ditempel ke area sablon!');
      } catch (err) {
        console.error('Error loading image onto fabric canvas:', err);
        showToast('Gagal memproses gambar.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Add Clipart to Canvas
  const handleAddClipart = async (clipart) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const url = `${BASE_URL}/mockup-assets/clipart/${clipart.file}`;
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      img.scale(0.65);
      img.set({
        left: 130,
        top: 160,
        originX: 'center',
        originY: 'center',
        cornerColor: '#ffffff',
        cornerStrokeColor: '#3B82F6',
        borderColor: '#3B82F6',
        cornerSize: 10,
        transparentCorners: false
      });
      img.__id = `clipart-${Date.now()}`;
      img.__name = clipart.name;

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      showToast(`Clipart "${clipart.name}" ditambahkan!`);
    } catch (err) {
      console.error(err);
      showToast('Gagal menambahkan clipart.');
    }
  };

  // Layer Actions
  const handleBringForward = (obj) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !obj) return;
    canvas.bringObjectForward(obj);
    canvas.renderAll();
    syncLayersList(canvas);
  };

  const handleSendBackward = (obj) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !obj) return;
    canvas.sendObjectBackwards(obj);
    canvas.renderAll();
    syncLayersList(canvas);
  };

  const handleDeleteObject = (obj) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !obj) return;
    canvas.remove(obj);
    canvas.renderAll();
    syncLayersList(canvas);
  };

  const handleToggleVisibility = (obj) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !obj) return;
    obj.set('visible', !obj.visible);
    canvas.renderAll();
    syncLayersList(canvas);
  };

  // Export Real Studio Photo (Merges real photo + sablon overlay at 1080px resolution)
  const handleDownloadMockup = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    showToast('Merender foto studio resolusi tinggi 1080px...');

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1080;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext('2d');

    // 1. Fill clean white studio background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Load the real photoshoot apparel image
    const shirtImg = new Image();
    shirtImg.crossOrigin = 'anonymous';
    shirtImg.onload = () => {
      // Draw shirt centered and proportionally
      const aspect = shirtImg.width / shirtImg.height;
      const targetH = 980;
      const targetW = targetH * aspect;
      const x = (1080 - targetW) / 2;
      const y = (1080 - targetH) / 2;
      ctx.drawImage(shirtImg, x, y, targetW, targetH);

      // 3. Draw fabric canvas overlay (scaled to match the print area)
      const fabricDataUrl = canvas.toDataURL({ format: 'png', multiplier: 2.4 });
      const overlayImg = new Image();
      overlayImg.onload = () => {
        // Place precisely over the chest / print area
        const ovW = overlayImg.width;
        const ovH = overlayImg.height;
        const ovX = (1080 - ovW) / 2;
        const ovY = y + 180;
        ctx.drawImage(overlayImg, ovX, ovY, ovW, ovH);

        // 4. Download file
        const link = document.createElement('a');
        link.download = `KaosDilio_${currentProduct.name}_${currentColor.name}_${currentAngle}.jpg`;
        link.href = exportCanvas.toDataURL('image/jpeg', 0.95);
        link.click();
        showToast('Foto studio produk berhasil diunduh!');
      };
      overlayImg.src = fabricDataUrl;
    };
    shirtImg.onerror = () => {
      showToast('Gagal memuat aset foto kaos.');
    };
    shirtImg.src = shirtPhotoUrl;
  };

  // Calculate Total Quantity & Price
  const totalQty = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);
  const totalPrice = totalQty * currentProduct.price;

  // Send Order via WhatsApp
  const handleSendWhatsAppOrder = () => {
    if (totalQty === 0) {
      showToast('Pilih minimal 1 ukuran kaos terlebih dahulu!');
      return;
    }

    const sizesSummary = Object.entries(sizeQuantities)
      .filter(([_, q]) => q > 0)
      .map(([s, q]) => `${s}: ${q} pcs`)
      .join(', ');

    const text = `Halo Admin Kaos Dilio, saya ingin memesan kaos custom hasil desain di website:

*Rincian Kaos:*
- Model: ${currentProduct.name}
- Warna: ${currentColor.name} (${currentColor.hex})
- Rincian Ukuran: ${sizesSummary}
- Total Qty: ${totalQty} pcs
- Total Estimasi Bahan: Rp ${totalPrice.toLocaleString('id-ID')}
- Sisi Sablon: ${currentAngle === 'front' ? 'Depan' : 'Depan & Belakang'}

*Pemesan:*
- Nama: ${customerName || '-'}
- Catatan Khusus: ${customerNotes || '-'}

Mohon konfirmasi ketersediaan stok & estimasi pengerjaan sablonnya ya, terima kasih!`;

    const waUrl = getWhatsAppUrl(text);
    window.open(waUrl, '_blank');
    setCartModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F7F9] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP CITITEX-STYLE HEADER */}
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-3 sm:px-8 sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            title="Kembali ke Beranda Kaos Dilio"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>

          <span className="h-4 w-px bg-neutral-200"></span>

          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-tight text-neutral-900">
              Kaos Dilio
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 tracking-normal hidden sm:inline-block">
              Custom Studio
            </span>
          </div>

          <span className="hidden md:inline-block h-4 w-px bg-neutral-200"></span>
          <span className="hidden md:inline-block text-xs font-semibold text-neutral-500 truncate max-w-xs">
            {currentProduct.name}
          </span>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setPricelistOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            title="Lihat Daftar Harga Sablon DTF & Plastisol"
          >
            <FileText className="w-3.5 h-3.5 text-neutral-500" />
            <span>Pricelist Sablon</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const canvas = fabricCanvasRef.current;
              if (canvas) {
                localStorage.setItem('dilio_saved_design', JSON.stringify(canvas.toJSON()));
                showToast('Template desain tersimpan di memori!');
              }
            }}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-neutral-500" />
            <span>Simpan</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMockup}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
            title="Unduh Mockup Foto Asli (1080px)"
          >
            <Download className="w-3.5 h-3.5 text-neutral-700" />
            <span className="hidden sm:inline">Unduh Foto Asli</span>
          </button>

          {/* Yellow Primary Action Button just like Cititex */}
          <button
            type="button"
            onClick={() => setCartModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-neutral-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-neutral-950" />
            <span>Pesan Sekarang</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE LAYOUT (Toolbar + Secondary Panel + Canvas Stage + Angle Switcher) */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* 1. PRIMARY TOOLBAR (Leftmost icons) */}
        <div className="w-full lg:w-20 bg-white border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-row lg:flex-col items-center py-2 lg:py-5 justify-around lg:justify-start gap-1 lg:gap-3 z-30 flex-shrink-0">
          {[
            { id: 'product', label: 'Product', icon: Shirt },
            { id: 'upload', label: 'Upload Image', icon: Upload },
            { id: 'text', label: 'Add Text', icon: Type },
            { id: 'clipart', label: 'Add Clip Art', icon: Sparkles },
            { id: 'layer', label: 'Layer', icon: Layers },
            { id: 'help', label: 'Help', icon: HelpCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold text-center leading-tight truncate max-w-[50px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. CONTEXTUAL SECONDARY PANEL */}
        <div className="w-full lg:w-[380px] bg-white border-b lg:border-b-0 lg:border-r border-neutral-200 p-5 overflow-y-auto max-h-[380px] lg:max-h-[calc(100vh-64px)] flex-shrink-0">
          
          {/* A. PRODUCT TAB */}
          {activeTab === 'product' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">Produk</h2>
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">{currentProduct.name}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {currentProduct.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Terbuat dari 100% katun ring-spun berkualitas tinggi, terasa sejuk, halus di kulit, dan potongan badan proporsional untuk tampilan kasual.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setProductDetailsOpen(true)}
                      className="flex-1 py-2 px-3 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-white transition-colors"
                    >
                      Product Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangeProductOpen(true)}
                      className="flex-1 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Ganti Produk
                    </button>
                  </div>
                </div>
              </div>

              {/* Ukuran Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-700">Ukuran Kaos:</span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Panduan Ukuran
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentProduct.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        selectedSize === s
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warna (Real Studio Photo Swatches) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-700">
                    Warna Foto Asli: <span className="font-extrabold text-neutral-900">{currentColor.name}</span>
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">{currentColor.hex}</span>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {PRODUCT_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setCurrentColor(col)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                        currentColor.id === col.id
                          ? 'border-neutral-900 ring-2 ring-blue-500 scale-105'
                          : 'border-neutral-200'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {currentColor.id === col.id && (
                        <Check className={`w-3.5 h-3.5 ${col.isDark ? 'text-white' : 'text-neutral-900'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spesifikasi List */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <span className="text-xs font-bold text-neutral-700">Spesifikasi Kaos:</span>
                <ul className="space-y-1.5 text-xs text-neutral-500 list-disc list-inside leading-relaxed">
                  {currentProduct.specs.map((spec, i) => (
                    <li key={i}>{spec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* B. UPLOAD IMAGE TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Unggah Gambar</h2>
              
              <div
                onClick={() => fileUploadRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-neutral-50 hover:bg-neutral-100 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center border border-neutral-200">
                  <Upload className="w-6 h-6 text-neutral-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Tarik dan taruh gambarmu disini</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">atau</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
                >
                  Cari file
                </button>
                <input
                  type="file"
                  ref={fileUploadRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Persyaratan File Cetak */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="text-xs font-bold text-neutral-800">Persyaratan file sablon:</span>
                <ul className="text-[11px] text-neutral-600 space-y-1 list-disc list-inside">
                  <li>Format JPG, JPEG, PNG (transparan disarankan), SVG.</li>
                  <li>Ukuran file maksimal 10 MB.</li>
                  <li>Ukuran area cetak sablon optimal 300 DPI.</li>
                  <li>Resolusi minimal 1000 × 1000 px untuk hasil tajam.</li>
                </ul>
              </div>
            </div>
          )}

          {/* C. ADD TEXT TAB */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Tambahkan Teks</h2>
              
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Teks Sablon</label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ketik teks desain..."
                  rows={3}
                  className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none font-medium"
                />
              </div>

              {/* Font Size Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-1">
                  <span>Ukuran Font:</span>
                  <span className="font-mono">{fontSize}</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
              </div>

              {/* Letter Spacing */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-1">
                  <span>Spasi Huruf:</span>
                  <span className="font-mono">{letterSpacing}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="10"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(parseInt(e.target.value))}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
              </div>

              {/* Font Color Picker */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Warna Teks</label>
                <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl p-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={textColor.toUpperCase()}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="bg-transparent border-none text-xs font-mono font-bold text-neutral-900 uppercase focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Font Family Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Pilihan Font</label>
                <select
                  value={selectedFont.name}
                  onChange={(e) => setSelectedFont(FONTS.find((f) => f.name === e.target.value) || FONTS[0])}
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 font-bold"
                >
                  {FONTS.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style & Alignment Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  className={`w-9 h-9 rounded-lg border text-xs font-extrabold flex items-center justify-center transition-colors ${
                    isBold ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                  }`}
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => setIsItalic(!isItalic)}
                  className={`w-9 h-9 rounded-lg border text-xs italic font-serif flex items-center justify-center transition-colors ${
                    isItalic ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                  }`}
                  title="Italic"
                >
                  I
                </button>
                <div className="h-6 w-px bg-neutral-200 mx-1"></div>
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => setTextAlign(align)}
                    className={`flex-1 py-1.5 text-xs uppercase font-bold rounded-lg border transition-colors ${
                      textAlign === align
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddText}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
              >
                Tambahkan ke Desain
              </button>
            </div>
          )}

          {/* D. ADD CLIPART TAB */}
          {activeTab === 'clipart' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Tambahkan Clip Art</h2>
              
              <div className="grid grid-cols-2 gap-3">
                {CLIPARTS.map((item) => (
                  <div
                    key={item.file}
                    onClick={() => handleAddClipart(item)}
                    className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <img
                      src={`${BASE_URL}/mockup-assets/clipart/${item.file}`}
                      alt={item.name}
                      className="w-16 h-16 object-contain"
                    />
                    <span className="text-[11px] font-bold text-neutral-800 text-center truncate max-w-full">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E. LAYER TAB */}
          {activeTab === 'layer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Layer Desain</h2>
                <span className="text-xs font-bold text-neutral-500">{layersList.length} Objek</span>
              </div>

              {layersList.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <p className="text-xs font-semibold">Belum ada objek sablon pada sisi ini.</p>
                  <p className="text-[11px] mt-1">Gunakan tab Upload atau Teks untuk mulai mendesain.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {layersList.map((layer) => (
                    <div
                      key={layer.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        activeObjectId === layer.id
                          ? 'bg-blue-50/50 border-blue-400 shadow-2xs'
                          : 'bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-[11px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800">
                          {layer.type === 'textbox' ? 'Teks' : 'Img'}
                        </span>
                        <span className="text-xs font-bold text-neutral-800 truncate max-w-[150px]">
                          {layer.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(layer.obj)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-200/60"
                          title="Tampilkan / Sembunyikan"
                        >
                          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBringForward(layer.obj)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-200/60"
                          title="Bawa ke Atas"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendBackward(layer.obj)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-200/60"
                          title="Bawa ke Bawah"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteObject(layer.obj)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                          title="Hapus Layer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* F. HELP TAB */}
          {activeTab === 'help' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Bantuan & Panduan</h2>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 text-xs text-neutral-600 leading-relaxed">
                <p className="font-bold text-neutral-900">Cara Menggunakan Custom Studio Dilio:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Pilih Produk & Warna:</strong> Buka tab Product untuk memilih model potongan kaos dan 16 warna foto asli.</li>
                  <li><strong>Tempel Desain:</strong> Gunakan tab Upload Image untuk logo/desain Anda, atau Add Text untuk tulisan sablon.</li>
                  <li><strong>Atur Posisi:</strong> Klik gambar/teks di atas baju untuk memutar (*rotate*), memperbesar/memperkecil (*scale*), atau menggeser (*drag*).</li>
                  <li><strong>Ganti Sisi Baju:</strong> Gunakan thumbnail sisi kanan (Depan, Belakang, Lengan) untuk mendesain punggung atau lengan baju.</li>
                  <li><strong>Pesan ke WhatsApp:</strong> Klik tombol kuning *Pesan Sekarang* untuk memilih jumlah ukuran dan mengirim pesanan langsung ke admin.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* 3. CENTER STAGE (Fabric Canvas overlaid on Real Photo) */}
        <div className="flex-1 bg-[#EEF0F4] flex flex-col items-center justify-center p-3 sm:p-8 relative overflow-hidden select-none">
          
          {/* FLOATING CANVAS CONTROLS (Top-Left of stage) */}
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-xl shadow-xs p-1.5 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                const canvas = fabricCanvasRef.current;
                if (canvas) {
                  const objs = canvas.getObjects();
                  if (objs.length > 0) canvas.remove(objs[objs.length - 1]);
                }
              }}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center justify-center"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center justify-center"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center justify-center"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center justify-center"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* MAIN T-SHIRT STAGE CONTAINER */}
          <div
            className="relative flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* The Real Studio Photography Image Backdrop */}
            <div className="relative w-[340px] sm:w-[460px] h-[480px] sm:h-[600px] flex items-center justify-center select-none pointer-events-none">
              <img
                src={shirtPhotoUrl}
                alt={`${currentProduct.name} - ${currentColor.name}`}
                className="w-full h-full object-contain filter drop-shadow-xl select-none"
                draggable={false}
              />
            </div>

            {/* PRINTABLE BOUNDING BOX & FABRIC CANVAS LAYER */}
            {/* Positioned precisely over the chest / torso printing zone */}
            <div
              className="relative border-2 border-dashed border-blue-400/60 rounded-xl pointer-events-auto shadow-xs overflow-visible"
              style={{
                width: 260,
                height: 360,
                position: 'absolute',
                top: currentAngle === 'left' || currentAngle === 'right' ? 140 : 110,
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              <canvas ref={canvasElRef} width={260} height={360} />
            </div>
          </div>

          {/* Sisi Baju Indicator Pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-neutral-200 px-4 py-1.5 rounded-full shadow-xs text-xs font-extrabold text-neutral-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sisi Aktif: {ANGLES.find((a) => a.id === currentAngle)?.label}</span>
          </div>
        </div>

        {/* 4. RIGHT VERTICAL ANGLE STRIP */}
        <div className="w-full lg:w-28 bg-white border-t lg:border-t-0 lg:border-l border-neutral-200 flex flex-row lg:flex-col items-center py-3 lg:py-6 justify-center gap-2 sm:gap-3 z-30 flex-shrink-0">
          {ANGLES.map((angle) => {
            const isSelected = currentAngle === angle.id;
            const thumbUrl = `${BASE_URL}/mockup-assets/${angle.id}/${currentColor.id}.jpg`;
            return (
              <button
                key={angle.id}
                type="button"
                onClick={() => handleAngleSwitch(angle.id)}
                className={`p-1.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-50 shadow-md scale-105'
                    : 'border-transparent hover:border-neutral-300 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="w-14 sm:w-16 h-18 sm:h-20 bg-neutral-50 rounded-xl overflow-hidden flex items-center justify-center p-1 border border-neutral-200">
                  <img
                    src={thumbUrl}
                    alt={angle.label}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className={`text-[11px] font-bold ${isSelected ? 'text-neutral-900' : 'text-neutral-500'}`}>
                  {angle.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Ganti Produk Modal */}
      {changeProductOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-black text-neutral-900">Pilih Model Kaos Dilio</h3>
              <button
                type="button"
                onClick={() => setChangeProductOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 max-h-[60vh] overflow-y-auto">
              {APPAREL_MODELS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setCurrentProduct(prod);
                    setChangeProductOpen(false);
                    showToast(`Model berganti ke ${prod.name}!`);
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    currentProduct.id === prod.id
                      ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-neutral-200 text-neutral-800">
                      {prod.category}
                    </span>
                    <span className="text-xs font-black text-neutral-900">
                      Rp {prod.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">{prod.name}</h4>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{prod.specs[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Product Details Modal */}
      {productDetailsOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-black text-neutral-900">Detail Spesifikasi Kaos</h3>
              <button
                type="button"
                onClick={() => setProductDetailsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-neutral-600 leading-relaxed">
              <h4 className="text-sm font-bold text-neutral-900">{currentProduct.name}</h4>
              <p>Bahan kaos pilihan standar distro dan clothing brand Indonesia, memiliki ketebalan kain yang pas, daya serap keringat tinggi, dan permukaan halus ideal untuk sablon DTF maupun Plastisol.</p>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="font-bold text-neutral-900 mb-1.5">Rincian Teknis:</p>
                <ul className="list-disc list-inside space-y-1">
                  {currentProduct.specs.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-black text-neutral-900">Panduan Ukuran (Size Chart)</h3>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px]">
                    <th className="py-2">Ukuran</th>
                    <th className="py-2">Lebar Dada</th>
                    <th className="py-2">Panjang Kaos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700 font-medium">
                  <tr><td className="py-2 font-bold">S</td><td>47 cm</td><td>67 cm</td></tr>
                  <tr><td className="py-2 font-bold">M</td><td>50 cm</td><td>70 cm</td></tr>
                  <tr><td className="py-2 font-bold">L</td><td>53 cm</td><td>73 cm</td></tr>
                  <tr><td className="py-2 font-bold">XL</td><td>56 cm</td><td>75 cm</td></tr>
                  <tr><td className="py-2 font-bold">2XL</td><td>59 cm</td><td>77 cm</td></tr>
                  <tr><td className="py-2 font-bold">3XL</td><td>62 cm</td><td>80 cm</td></tr>
                </tbody>
              </table>
              <p className="text-[11px] text-neutral-400 mt-3">*Toleransi jahitan konveksi 1-2 cm.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Pricelist & Sablon Modal */}
      {pricelistOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Daftar Harga & Jenis Sablon</h3>
                <p className="text-xs text-neutral-500">Pilihan teknik cetak sablon terbaik Kaos Dilio</p>
              </div>
              <button
                type="button"
                onClick={() => setPricelistOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* DTF Card */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-neutral-900">DTF (Direct to Film)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Bisa Satuan (1 pcs)
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Teknik cetak digital modern untuk foto, gradasi warna rumit, dan desain penuh detail tanpa batasan jumlah warna.
                </p>
                <div className="space-y-1.5 text-xs text-neutral-700">
                  <div className="flex justify-between py-1 border-b border-neutral-200">
                    <span>A5 (Logo Dada / Lengan)</span>
                    <span className="font-bold">Rp 15.000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200">
                    <span>A4 (Dada Sedang)</span>
                    <span className="font-bold">Rp 25.000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200">
                    <span>A3 (Dada Penuh / Punggung)</span>
                    <span className="font-bold">Rp 35.000</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>A3+ (Oversize Graphic)</span>
                    <span className="font-bold">Rp 45.000</span>
                  </div>
                </div>
              </div>

              {/* Plastisol Card */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-neutral-900">Plastisol Premium</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Min. 12 pcs
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Sablon manual oil-based standar clothing brand distro papan atas. Tinta tebal, warna pekat, dan awet dicuci bertahun-tahun.
                </p>
                <div className="space-y-1.5 text-xs text-neutral-700">
                  <div className="flex justify-between py-1 border-b border-neutral-200">
                    <span>1 - 2 Warna</span>
                    <span className="font-bold">Mulai Rp 12.000 / pcs</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200">
                    <span>3 - 4 Warna</span>
                    <span className="font-bold">Mulai Rp 18.000 / pcs</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200">
                    <span>5+ Warna / Raster</span>
                    <span className="font-bold">Mulai Rp 25.000 / pcs</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Pemesanan &gt; 50 pcs</span>
                    <span className="font-bold text-emerald-600">Diskon Khusus</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Tips Desainer:</strong> Untuk pesanan sampel atau satuan gunakan <strong>DTF</strong>. Untuk pesanan komunitas, seragam gathering, atau clothing distro jumlah banyak gunakan <strong>Plastisol</strong> agar lebih hemat.
            </div>
          </div>
        </div>
      )}

      {/* 5. Cart & WhatsApp Checkout Modal */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Pesan Kaos Custom</h3>
                <p className="text-xs text-neutral-500">Pilih rincian ukuran & jumlah pesanan</p>
              </div>
              <button
                type="button"
                onClick={() => setCartModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 my-4">
              <div className="w-14 h-18 bg-white rounded-xl border border-neutral-200 overflow-hidden flex items-center justify-center p-1">
                <img
                  src={shirtPhotoUrl}
                  alt={currentProduct.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-neutral-900 leading-snug">{currentProduct.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                    style={{ backgroundColor: currentColor.hex }}
                  />
                  <span className="text-xs font-semibold text-neutral-600">{currentColor.name}</span>
                </div>
                <span className="text-xs font-extrabold text-neutral-900 block mt-1">
                  Rp {currentProduct.price.toLocaleString('id-ID')} / pcs
                </span>
              </div>
            </div>

            {/* Size Quantities breakdown */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold text-neutral-700">Rincian Ukuran & Jumlah:</span>
              <div className="grid grid-cols-2 gap-2">
                {['S', 'M', 'L', 'XL', '2XL'].map((s) => (
                  <div key={s} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-xs font-bold text-neutral-800">{s}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSizeQuantities((prev) => ({
                            ...prev,
                            [s]: Math.max(0, (prev[s] || 0) - 1)
                          }))
                        }
                        className="w-6 h-6 rounded-md bg-white border border-neutral-300 flex items-center justify-center text-xs font-bold hover:bg-neutral-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{sizeQuantities[s] || 0}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSizeQuantities((prev) => ({
                            ...prev,
                            [s]: (prev[s] || 0) + 1
                          }))
                        }
                        className="w-6 h-6 rounded-md bg-white border border-neutral-300 flex items-center justify-center text-xs font-bold hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Name & Notes */}
            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama Pemesan (opsional)"
                className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Catatan tambahan (misal: sablon DTF / sablon punggung)"
                className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Total Summary */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs mb-5">
              <span className="font-bold text-amber-900">Total: {totalQty} pcs</span>
              <span className="font-black text-amber-950 text-sm">
                Rp {totalPrice.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSendWhatsAppOrder}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirim Pesanan ke WhatsApp Admin</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
