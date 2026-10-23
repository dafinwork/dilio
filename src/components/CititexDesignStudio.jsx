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
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  ChevronRight,
  Info,
  Sliders,
  CheckCircle2,
  ExternalLink
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

export const CATEGORIES = [
  { id: 'all', name: 'Semua Produk', count: 17 },
  { id: 'T-Shirts', name: 'T-Shirts', count: 8 },
  { id: 'Jacket & Hoodies', name: 'Jacket & Hoodies', count: 4 },
  { id: 'Polo T-Shirt', name: 'Polo T-Shirt', count: 2 },
  { id: 'Sport T-Shirts', name: 'Sport T-Shirts', count: 3 },
];

export const APPAREL_MODELS = [
  // T-SHIRTS (8 Produk)
  {
    id: 'nsa-7200',
    name: 'New States Apparel Premium Cotton 7200',
    category: 'T-Shirts',
    badges: ['POPULER', 'BEST SELLER', 'TURUN HARGA'],
    badge: 'BEST SELLER',
    price: 42000,
    tags: '34 Warna • S-5XL • 180gsm • 24s',
    desc: 'Bahan berkualitas premium memadukan rasa ringan dengan tekstur lembut untuk aktivitas harian.',
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
    id: 'nsa-3600',
    name: 'New States Apparel Softstyle 3600',
    category: 'T-Shirts',
    badges: ['POPULER', 'TURUN HARGA'],
    badge: 'EKONOMIS',
    price: 37000,
    tags: '28 Warna • S-3XL • 150gsm • 30s',
    desc: 'Bahan berkualitas premium memadukan rasa ringan dengan tekstur lembut untuk aktivitas harian.',
    specs: [
      '100% cotton combed 30s lembut.',
      '150g/m2 terasa ringan & sejuk.',
      'Sangat cocok untuk kaos harian dan event.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 'dilio-boxy',
    name: 'Dilio Heavyweight Boxy Fit 24s',
    category: 'T-Shirts',
    badges: ['POPULER', 'STREETWEAR'],
    badge: 'POPULER',
    price: 55000,
    tags: '16 Warna • S-2XL • 200gsm • 24s Heavyweight',
    desc: 'Potongan Boxy Streetwear (Drop-shoulder lebar) dengan rib leher tebal 3 cm anti melar.',
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
    badges: ['TRENDING'],
    badge: 'TRENDING',
    price: 58000,
    tags: '16 Warna • S-2XL • 220gsm • 20s Combed',
    desc: 'Siluet Oversized santai kekinian dengan lengan mendekati siku, super adem untuk iklim tropis.',
    specs: [
      '100% Combed 20s Gramasi 210-220 gsm.',
      'Siluet Oversized santai kekinian.',
      'Lengan lebih panjang mendekati siku.',
      'Super adem untuk iklim tropis Indonesia.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'nsa-7280',
    name: 'New States Apparel Premium Cotton Long Sleeve 7280',
    category: 'T-Shirts',
    badges: ['POPULER'],
    badge: 'POPULER',
    price: 56000,
    tags: '34 Warna • S-5XL • 180gsm • 24s',
    desc: 'Kaos lengan panjang dengan manset rib elastis, cocok untuk cuaca sejuk dan hijab friendly.',
    specs: [
      '100% cotton preshrunk combed 24s.',
      'Lengan panjang dengan rib karet elastis pada manset.',
      'Cocok untuk cuaca dingin dan hijab friendly.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'nsa-72y00',
    name: 'New States Apparel Premium Cotton Youth T-shirt 72Y00',
    category: 'T-Shirts',
    badges: ['KIDS'],
    badge: 'KIDS',
    price: 33000,
    tags: '34 Warna • XS-XL • 180gsm • 24s',
    desc: 'Tersedia berbagai macam pilihan warna ceria dengan jahitan rapi, nyaman untuk aktivitas anak seharian.',
    specs: [
      '100% Combed Ring Spun Jersey.',
      'Ketebalan 24s adem untuk kulit anak-anak.',
      'Jahitan rantai ganda tahan tarik.'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 'nsa-7260',
    name: 'New States Apparel Premium Cotton Raglan 3/4 7260',
    category: 'T-Shirts',
    badges: ['RAGLAN'],
    badge: 'RAGLAN',
    price: 55000,
    tags: '11 Warna • S-2XL • 180gsm • 24s',
    desc: 'Kaos lembut dan nyaman dengan kombinasi dua warna yang cocok untuk aktivitas sehari-hari serta memberikan tampilan outfit yang rapi dan modern.',
    specs: [
      '100% cotton combed 24s.',
      'Kombinasi warna badan dan lengan klasik.',
      'Lengan potongan raglan 3/4.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'nsa-5400',
    name: 'New States Apparel Heavyweight T-shirt 5400',
    category: 'T-Shirts',
    badges: ['HEAVYWEIGHT'],
    badge: 'HEAVYWEIGHT',
    price: 65000,
    tags: '8 Warna • S-2XL • 210gsm • 20s',
    desc: 'Bahan berkualitas premium memadukan rasa ringan dengan tekstur lembut untuk aktivitas harian.',
    specs: [
      '100% cotton preshrunk heavyweight 20s.',
      'Bahan tebal, tidak nerawang, dan kokoh.',
      'Pilihan utama clothing brand streetwear.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },

  // JACKET & HOODIES (4 Produk)
  {
    id: 'nsa-9500',
    name: 'New States Apparel Super Blend Hooded Sweatshirt 9500',
    category: 'Jacket & Hoodies',
    badges: ['BEST SELLER', 'WINTER WARM'],
    badge: 'BEST SELLER',
    price: 135000,
    tags: '14 Warna • S-3XL • 270gsm • Fleece Blend',
    desc: 'Hoodie pullover dengan kantong kanguru depan, bahan fleece lembut di dalam dan tebal.',
    specs: [
      '50% Cotton / 50% Polyester preshrunk fleece knit.',
      '270 g/m2 (8.0 oz/yd2) sangat tebal dan hangat.',
      'Air jet yarn = softer feel and reduced pilling.',
      'Double-lined hood with color-matched drawcord.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 'nsa-9000',
    name: 'New States Apparel Super Blend Crewneck 9000',
    category: 'Jacket & Hoodies',
    badges: ['POPULER'],
    badge: 'POPULER',
    price: 115000,
    tags: '12 Warna • S-3XL • 270gsm • Crewneck Fleece',
    desc: 'Sweatshirt crewneck klasik tanpa kupluk, bahan hangat dan cocok untuk custom sablon event/brand.',
    specs: [
      '50% Cotton / 50% Polyester Fleece.',
      'Kerah rib 1x1 dengan spandex anti melar.',
      'Jahitan jarum ganda di leher, pundak, dan lengan.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 'nsa-9600',
    name: 'New States Apparel Super Blend Full Zip Hooded 9600',
    category: 'Jacket & Hoodies',
    badges: ['ZIPPER'],
    badge: 'ZIPPER',
    price: 145000,
    tags: '10 Warna • S-3XL • 270gsm • Zipper Fleece',
    desc: 'Jaket hoodie resleting depan dengan bahan tebal, resleting logam halus dan tahan lama.',
    specs: [
      'Bahan fleece tebal 270 gsm.',
      'Resleting YKK berkualitas tinggi.',
      'Dua saku depan dan tali kupluk serasi.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'dilio-boxy-hoodie',
    name: 'Dilio Streetwear Boxy Hoodie 330gsm',
    category: 'Jacket & Hoodies',
    badges: ['HEAVYWEIGHT', 'STREETWEAR'],
    badge: 'STREETWEAR',
    price: 165000,
    tags: '8 Warna • M-2XL • 330gsm • Heavy Fleece',
    desc: 'Potongan boxy oversized streetwear dengan kupluk double layer yang tegak dan kokoh.',
    specs: [
      '100% Cotton Fleece Heavyweight 330 gsm.',
      'Double layer hood tanpa tali (clean streetwear look).',
      'Rib karet tebal 7 cm pada pinggang dan pergelangan tangan.'
    ],
    sizes: ['M', 'L', 'XL', '2XL']
  },

  // POLO T-SHIRT (2 Produk)
  {
    id: 'nsa-8165',
    name: 'New States Apparel Easy Care Polo Shirt 8165',
    category: 'Polo T-Shirt',
    badges: ['BEST SELLER', 'EASY CARE'],
    badge: 'BEST SELLER',
    price: 68000,
    tags: '16 Warna • S-3XL • 200gsm • Pique Cotton Blend',
    desc: 'Kaos polo berkerah dengan rajutan pique lembut, jahitan rapi untuk seragam kantor dan semi-formal.',
    specs: [
      '65% Polyester / 35% Cotton Pique.',
      'Kancing warna senada dan kerah kokoh.',
      'Mudah disetrika dan tidak mudah kusut.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 'dilio-polo-pique',
    name: 'Dilio Classic Pique Polo Combed 24s',
    category: 'Polo T-Shirt',
    badges: ['PREMIUM'],
    badge: 'PREMIUM',
    price: 75000,
    tags: '10 Warna • S-2XL • 220gsm • 100% Pique Combed',
    desc: 'Polo shirt 100% katun combed pique murni, sangat sejuk di kulit dan tidak mudah melar.',
    specs: [
      '100% Cotton Combed Pique kualitas ekspor.',
      'Placket kancing 3 titik rapi.',
      'Kenyamanan maksimal untuk iklim tropis.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },

  // SPORT T-SHIRTS (3 Produk)
  {
    id: 'nsa-2700',
    name: 'New States Apparel Dri-Fit T-Shirt 2700',
    category: 'Sport T-Shirts',
    badges: ['BEST SELLER', 'QUICK DRY'],
    badge: 'QUICK DRY',
    price: 38000,
    tags: '12 Warna • S-3XL • 130gsm • 100% Polyester Quick-Dry',
    desc: 'Kaos olahraga dengan teknologi anti-keringat dan sirkulasi udara maksimal untuk performa lari & gym.',
    specs: [
      '100% Microfiber Performance Polyester.',
      'Sangat ringan (130gsm) dan cepat kering.',
      'Anti-bakteri dan tahan bau keringat.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 'nsa-2720',
    name: 'New States Apparel Dri-Fit Raglan 2720',
    category: 'Sport T-Shirts',
    badges: ['SPORT RAGLAN'],
    badge: 'SPORT',
    price: 42000,
    tags: '8 Warna • S-2XL • 130gsm • Quick-Dry',
    desc: 'Kombinasi warna raglan sporty dengan bahan lentur, cepat kering, dan sangat ringan.',
    specs: [
      '100% Polyester Quick-Dry fabric.',
      'Potongan lengan raglan untuk gerakan bebas.',
      'Jahitan flatlock anti lecet saat berolahraga.'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'dilio-active-dry',
    name: 'Dilio Active Performance Dry-Fit',
    category: 'Sport T-Shirts',
    badges: ['ATHLETIC'],
    badge: 'ATHLETIC',
    price: 45000,
    tags: '8 Warna • S-2XL • 140gsm • Honeycomb Mesh',
    desc: 'Tekstur jaring mikro sarang lebah untuk ventilasi ekstra selama aktivitas fisik intens.',
    specs: [
      'Micro Honeycomb Quick-Dry Technology.',
      'UV Protection 30+ untuk aktivitas outdoor.',
      'Elastisitas 4-way stretch.'
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

export const TEMPLATES = [
  {
    id: 'tokyo-street',
    title: 'Tokyo Street Sun',
    category: 'Streetwear',
    clipart: 'japanese_sun.svg',
    text: 'TOKYO 2026',
    font: 'Bebas Neue (Streetwear)',
    textColor: '#FFFFFF'
  },
  {
    id: 'retro-surf',
    title: 'Retro Surf Club',
    category: 'Retro',
    clipart: 'retro_surf.svg',
    text: 'BALI SURF CLUB',
    font: 'Pacifico (Retro Script)',
    textColor: '#F59E0B'
  },
  {
    id: 'street-tiger',
    title: 'Raw Streetwear Tiger',
    category: 'Streetwear',
    clipart: 'tiger_streetwear.svg',
    text: 'WILD & FREE',
    font: 'Permanent Marker (Graffiti)',
    textColor: '#EF4444'
  },
  {
    id: 'coffee-club',
    title: 'Artisan Coffee Club',
    category: 'Minimalist',
    clipart: 'coffee_lover.svg',
    text: 'CAFFEINE ADDICT',
    font: 'Oswald (Bold Condensed)',
    textColor: '#F59E0B'
  }
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
  // Main view state: 'catalog' (Cititex Step 1 & 2) vs 'editor' (Cititex Step 3 Studio)
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedCategory, setSelectedCategory] = useState('T-Shirts');

  // Navigation & Tool states
  const [activeTab, setActiveTab] = useState('product'); // 'product', 'upload', 'text', 'clipart', 'layer', 'my_images', 'template', 'help'
  const [currentProduct, setCurrentProduct] = useState(APPAREL_MODELS[0]);
  const [currentColor, setCurrentColor] = useState(PRODUCT_COLORS[0]); // default Black
  const [currentAngle, setCurrentAngle] = useState('front'); // 'front', 'back', 'left', 'right'
  const [selectedSize, setSelectedSize] = useState('L');
  const [zoomLevel, setZoomLevel] = useState(1);

  // User uploaded images history for "My Images" tab
  const [uploadedImages, setUploadedImages] = useState([]);

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

  // Start customizing a selected product (Transitions from Catalog to Studio)
  const handleSelectProductToDesign = (product) => {
    setCurrentProduct(product);
    setCurrentView('editor');
    setActiveTab('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Initialize Fabric Canvas when in editor view
  useEffect(() => {
    if (currentView !== 'editor' || !canvasElRef.current) return;

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

    const handleDeselection = () => {
      setActiveObjectId(null);
    };

    const handleObjectModified = () => {
      syncLayersList(canvas);
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleDeselection);
    canvas.on('object:added', () => syncLayersList(canvas));
    canvas.on('object:removed', () => syncLayersList(canvas));
    canvas.on('object:modified', handleObjectModified);

    // Restore design for current angle if exists
    if (designsRef.current[currentAngle]) {
      canvas.loadFromJSON(designsRef.current[currentAngle]).then(() => {
        canvas.renderAll();
        syncLayersList(canvas);
      });
    }

    return () => {
      // Save canvas state before destroying
      if (fabricCanvasRef.current) {
        designsRef.current[currentAngle] = fabricCanvasRef.current.toJSON();
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [currentAngle, currentView, syncLayersList]);

  // Angle switching handler
  const handleSwitchAngle = (angleId) => {
    if (angleId === currentAngle) return;
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      designsRef.current[currentAngle] = canvas.toJSON();
    }
    setCurrentAngle(angleId);
  };

  // Add Custom Text
  const handleAddText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const id = `text-${Date.now()}`;
    const textObj = new Textbox(textInput || 'TEKS SABLON', {
      left: 130,
      top: 150,
      originX: 'center',
      originY: 'center',
      fill: textColor,
      fontFamily: selectedFont.family,
      fontSize: fontSize,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textAlign: textAlign,
      charSpacing: letterSpacing * 50,
      cornerColor: '#3B82F6',
      cornerSize: 8,
      transparentCorners: false,
      borderColor: '#3B82F6',
      cornerStyle: 'circle',
      padding: 6
    });

    textObj.__id = id;
    textObj.__name = textInput || 'Teks';
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    syncLayersList(canvas);
    showToast('Teks ditambahkan ke kaos!');
  };

  // Add Clipart to Canvas
  const handleAddClipart = async (clipart) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      const url = `${BASE_URL}/mockup-assets/clipart/${clipart.file}`;
      const imgObj = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });

      imgObj.scaleToWidth(140);
      imgObj.set({
        left: 130,
        top: 160,
        originX: 'center',
        originY: 'center',
        cornerColor: '#3B82F6',
        cornerSize: 8,
        transparentCorners: false,
        cornerStyle: 'circle',
        padding: 6
      });

      imgObj.__id = `clipart-${Date.now()}`;
      imgObj.__name = clipart.name;
      canvas.add(imgObj);
      canvas.setActiveObject(imgObj);
      canvas.renderAll();
      syncLayersList(canvas);
      showToast(`Clipart "${clipart.name}" ditambahkan!`);
    } catch (e) {
      console.error(e);
      showToast('Gagal memuat gambar clipart.');
    }
  };

  // Apply Pre-made Design Template
  const handleApplyTemplate = async (template) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      canvas.clear();

      // Add clipart
      const url = `${BASE_URL}/mockup-assets/clipart/${template.clipart}`;
      const imgObj = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      imgObj.scaleToWidth(130);
      imgObj.set({
        left: 130,
        top: 130,
        originX: 'center',
        originY: 'center',
        cornerColor: '#3B82F6',
        cornerSize: 8,
        transparentCorners: false,
        cornerStyle: 'circle'
      });
      imgObj.__id = `template-img-${Date.now()}`;
      imgObj.__name = template.title;
      canvas.add(imgObj);

      // Add title text underneath
      const foundFont = FONTS.find((f) => f.name.includes(template.font.split(' ')[0])) || FONTS[1];
      const textObj = new Textbox(template.text, {
        left: 130,
        top: 220,
        originX: 'center',
        originY: 'center',
        fill: template.textColor,
        fontFamily: foundFont.family,
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        cornerColor: '#3B82F6',
        cornerSize: 8,
        transparentCorners: false,
        cornerStyle: 'circle'
      });
      textObj.__id = `template-txt-${Date.now()}`;
      textObj.__name = template.text;
      canvas.add(textObj);

      canvas.renderAll();
      syncLayersList(canvas);
      showToast(`Template "${template.title}" berhasil diterapkan!`);
    } catch (e) {
      console.error(e);
      showToast('Gagal memuat template desain.');
    }
  };

  // Upload Local Image File
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;

      // Add to uploaded images list
      setUploadedImages((prev) => [
        { id: Date.now(), name: file.name, url: dataUrl },
        ...prev
      ]);

      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      try {
        const imgObj = await FabricImage.fromURL(dataUrl);
        imgObj.scaleToWidth(150);
        imgObj.set({
          left: 130,
          top: 150,
          originX: 'center',
          originY: 'center',
          cornerColor: '#3B82F6',
          cornerSize: 8,
          transparentCorners: false,
          cornerStyle: 'circle',
          padding: 6
        });
        imgObj.__id = `upload-${Date.now()}`;
        imgObj.__name = file.name;
        canvas.add(imgObj);
        canvas.setActiveObject(imgObj);
        canvas.renderAll();
        syncLayersList(canvas);
        showToast('Gambar berhasil diunggah ke kaos!');
      } catch (err) {
        console.error(err);
        showToast('Gagal memproses gambar yang diunggah.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Canvas Actions
  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(0.7, Math.min(1.6, Number((prev + delta).toFixed(2)))));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleDeleteActive = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
      syncLayersList(canvas);
      showToast('Objek dihapus dari desain.');
    }
  };

  // Layer manipulations
  const handleToggleVisibility = (obj) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !obj) return;
    obj.set('visible', !obj.visible);
    canvas.renderAll();
    syncLayersList(canvas);
  };

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

  // Export & Download Studio Photo
  const handleDownloadMockup = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    showToast('Sedang merender foto mockup studio...');

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1080;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext('2d');

    const shirtImg = new Image();
    shirtImg.crossOrigin = 'anonymous';
    shirtImg.onload = () => {
      // 1. Draw neutral clean backdrop
      ctx.fillStyle = '#F5F5F7';
      ctx.fillRect(0, 0, 1080, 1080);

      // 2. Draw actual studio cutout
      const scale = 1080 / shirtImg.width;
      const h = shirtImg.height * scale;
      const y = (1080 - h) / 2;
      ctx.drawImage(shirtImg, 0, y, 1080, h);

      // 3. Draw fabric graphic artwork
      const fabricDataUrl = canvas.toDataURL({ format: 'png', multiplier: 2.2 });
      const overlayImg = new Image();
      overlayImg.onload = () => {
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
- Kategori: ${currentProduct.category}
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

  // Filter products in catalog view
  const filteredCatalogProducts =
    selectedCategory === 'all'
      ? APPAREL_MODELS
      : APPAREL_MODELS.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F7F9] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: CITITEX CATALOG VIEW (STEP 1 & STEP 2) */}
      {/* ========================================================================= */}
      {currentView === 'catalog' && (
        <div className="min-h-screen flex flex-col bg-white">
          {/* Top Navbar */}
          <header className="h-16 border-b border-neutral-100 bg-white sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                title="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Beranda</span>
              </Link>
              <span className="h-4 w-px bg-neutral-200"></span>
              <span className="text-lg font-black text-neutral-900 tracking-tight">
                Kaos Dilio
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPricelistOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 hover:border-neutral-900 rounded-xl text-xs font-bold text-neutral-800 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Pricelist Sablon</span>
              </button>
              <a
                href={getWhatsAppUrl('Halo Admin Kaos Dilio, saya ingin konsultasi seputar custom apparel & sablon')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Konsultasi Admin</span>
              </a>
            </div>
          </header>

          {/* Hero Section */}
          <section className="bg-neutral-50/70 border-b border-neutral-100 py-10 sm:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 inline-block mb-3">
                  Online T-Shirt Studio Customizer
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                  Custom Apparel
                </h1>
                <p className="mt-2 text-sm sm:text-base text-neutral-600 leading-relaxed">
                  Pilih produk apparel polos berkualitas untuk mulai membuat kustomisasi sablon impianmu. Desain langsung secara interaktif dengan foto asli studio.
                </p>
              </div>

              {/* 4 Category Selector Cards (Plek ketiplek Cititex) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 sm:p-5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-900/10 -translate-y-0.5'
                          : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-black leading-tight">
                        {cat.name}
                      </span>
                      <span
                        className={`text-xs font-semibold mt-2.5 ${
                          isActive ? 'text-neutral-300' : 'text-neutral-500'
                        }`}
                      >
                        {cat.count} Produk
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Product Cards Grid Section (Step 2 Catalog) */}
          <section className="py-12 sm:py-16 bg-white flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Filter Pills Bar */}
              <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-100 overflow-x-auto">
                <div className="flex items-center gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {cat.name} ({cat.count})
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-neutral-400 font-semibold hidden sm:inline">
                  Menampilkan {filteredCatalogProducts.length} produk siap kustom
                </span>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCatalogProducts.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Image Area with authentic shirt preview */}
                    <div className="relative aspect-[4/5] bg-neutral-100 p-6 flex items-center justify-center overflow-hidden">
                      {/* Badges on top */}
                      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 max-w-[85%]">
                        {item.badges?.map((badge, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-2xs ${
                              badge === 'BEST SELLER'
                                ? 'bg-amber-400 text-neutral-950 font-black'
                                : badge === 'POPULER'
                                ? 'bg-neutral-900 text-white'
                                : badge === 'TURUN HARGA'
                                ? 'bg-red-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      <img
                        src={`${BASE_URL}/mockup-assets/front/black.jpg`}
                        alt={item.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Specs tag */}
                        <span className="text-[11px] font-bold text-neutral-500 block mb-1">
                          {item.tags}
                        </span>

                        <h3 className="text-sm font-black text-neutral-900 leading-snug group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>

                        <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      {/* Bottom Price & Start Button */}
                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                            Mulai Dari
                          </span>
                          <span className="text-base font-black text-neutral-900">
                            Rp {item.price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectProductToDesign(item)}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Mulai Desain</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CITITEX INTERACTIVE DESIGN STUDIO (STEP 3) */}
      {/* ========================================================================= */}
      {currentView === 'editor' && (
        <div className="flex-1 flex flex-col">
          {/* TOP CITITEX-STYLE HEADER */}
          <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-3 sm:px-8 sticky top-0 z-40 shadow-xs">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setCurrentView('catalog')}
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Pilih Model Apparel Lainnya"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Pilih Produk Lain</span>
              </button>

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

            {/* Right Header Buttons matching Cititex */}
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
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-neutral-500" />
                <span>Simpan Template</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadMockup}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                title="Unduh Mockup Foto Asli (1080px)"
              >
                <Download className="w-3.5 h-3.5 text-neutral-700" />
                <span className="hidden sm:inline">Unduh Foto Asli</span>
              </button>

              {/* Yellow Primary Action Button just like Cititex (#F59E0B) */}
              <button
                type="button"
                onClick={() => setCartModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-neutral-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-neutral-950" />
                <span>Masukkan ke Keranjang</span>
              </button>
            </div>
          </header>

          {/* WORKSPACE LAYOUT (8 Toolbar Items + Secondary Panel + Canvas Stage + Angle Switcher) */}
          <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
            
            {/* 1. PRIMARY TOOLBAR (Leftmost icons matching Cititex 8 tools) */}
            <div className="w-full lg:w-20 bg-white border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-row lg:flex-col items-center py-2 lg:py-5 justify-around lg:justify-start gap-1 lg:gap-2 z-30 flex-shrink-0">
              {[
                { id: 'product', label: 'Product', icon: Shirt },
                { id: 'upload', label: 'Upload Image', icon: Upload },
                { id: 'text', label: 'Add Text', icon: Type },
                { id: 'clipart', label: 'Add Clip Art', icon: Sparkles },
                { id: 'layer', label: 'Layer', icon: Layers },
                { id: 'my_images', label: 'My Images', icon: ImageIcon },
                { id: 'template', label: 'Template', icon: LayoutTemplate },
                { id: 'help', label: 'Help', icon: HelpCircle },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
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
                        {currentProduct.desc}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setProductDetailsOpen(true)}
                          className="flex-1 py-2 px-3 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-white transition-colors cursor-pointer"
                        >
                          Product Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentView('catalog')}
                          className="flex-1 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
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
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative flex items-center justify-center ${
                            currentColor.id === col.id
                              ? 'border-neutral-900 scale-110 shadow-sm'
                              : 'border-neutral-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        >
                          {currentColor.id === col.id && (
                            <Check
                              className={`w-4 h-4 ${col.isDark ? 'text-white' : 'text-neutral-900'}`}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* B. UPLOAD IMAGE TAB */}
              {activeTab === 'upload' && (
                <div className="space-y-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Upload Desain Gambar</h2>
                  
                  {/* Dropzone */}
                  <div
                    onClick={() => fileUploadRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-50/60 hover:bg-neutral-50"
                  >
                    <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                    <p className="text-xs font-bold text-neutral-800">Klik untuk upload file desain</p>
                    <p className="text-[11px] text-neutral-400 mt-1">PNG (Transparan), JPG, SVG, WebP</p>
                  </div>
                  <input
                    ref={fileUploadRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* DTF Print Tips Box */}
                  <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Tips Sablon DTF Berkualitas Tinggi</span>
                    </div>
                    <ul className="text-[11px] text-blue-800 space-y-1 list-disc pl-4 leading-relaxed">
                      <li>Gunakan format <b>PNG tanpa latar belakang</b> (transparan).</li>
                      <li>Resolusi gambar ideal adalah <b>300 DPI</b> agar hasil sablon tidak pecah.</li>
                      <li>Warna RGB akan dikonversi otomatis ke tinta CMYK + White DTF.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* C. ADD TEXT TAB */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Tambahkan Teks</h2>
                  
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Teks Tulisan:</label>
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Ketik teks di sini..."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Pilihan Font:</label>
                    <select
                      value={selectedFont.name}
                      onChange={(e) => {
                        const f = FONTS.find((x) => x.name === e.target.value);
                        if (f) setSelectedFont(f);
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                    >
                      {FONTS.map((font) => (
                        <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Styling Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Ukuran Font ({fontSize}px):</label>
                      <input
                        type="range"
                        min="16"
                        max="72"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Warna Teks:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-200"
                        />
                        <span className="text-xs font-mono font-bold text-neutral-600">{textColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Alignment & Styles */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBold(!isBold)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-colors cursor-pointer ${
                        isBold ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      B (Tebal)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsItalic(!isItalic)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold italic border transition-colors cursor-pointer ${
                        isItalic ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      I (Miring)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddText}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
                  >
                    Tambahkan Teks ke Kaos
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
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-200/60 cursor-pointer"
                              title="Tampilkan / Sembunyikan"
                            >
                              {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBringForward(layer.obj)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-200/60 cursor-pointer"
                              title="Bawa ke Atas"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendBackward(layer.obj)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-200/60 cursor-pointer"
                              title="Bawa ke Bawah"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* F. MY IMAGES TAB */}
              {activeTab === 'my_images' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">My Uploaded Images</h2>
                  {uploadedImages.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400 space-y-2">
                      <ImageIcon className="w-8 h-8 mx-auto text-neutral-300" />
                      <p className="text-xs font-semibold">Belum ada gambar yang diunggah.</p>
                      <button
                        type="button"
                        onClick={() => fileUploadRef.current?.click()}
                        className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Upload Sekarang
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {uploadedImages.map((img) => (
                        <div
                          key={img.id}
                          onClick={async () => {
                            const canvas = fabricCanvasRef.current;
                            if (!canvas) return;
                            const imgObj = await FabricImage.fromURL(img.url);
                            imgObj.scaleToWidth(140);
                            imgObj.set({
                              left: 130,
                              top: 150,
                              originX: 'center',
                              originY: 'center',
                              cornerColor: '#3B82F6',
                              cornerSize: 8,
                              transparentCorners: false,
                              cornerStyle: 'circle'
                            });
                            imgObj.__id = `my-img-${Date.now()}`;
                            imgObj.__name = img.name;
                            canvas.add(imgObj);
                            canvas.setActiveObject(imgObj);
                            canvas.renderAll();
                            syncLayersList(canvas);
                            showToast(`"${img.name}" ditempelkan ke kaos!`);
                          }}
                          className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                        >
                          <img src={img.url} alt={img.name} className="w-16 h-16 object-contain rounded" />
                          <span className="text-[10px] font-bold text-neutral-700 truncate max-w-full">
                            {img.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* G. TEMPLATE TAB */}
              {activeTab === 'template' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Design Templates</h2>
                  <p className="text-xs text-neutral-500">
                    Pilih template desain siap pakai, langsung diterapkan ke kaos dengan 1 klik!
                  </p>

                  <div className="space-y-3">
                    {TEMPLATES.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`${BASE_URL}/mockup-assets/clipart/${tmpl.clipart}`}
                            alt={tmpl.title}
                            className="w-12 h-12 object-contain"
                          />
                          <div>
                            <h4 className="text-xs font-black text-neutral-900">{tmpl.title}</h4>
                            <span className="text-[10px] text-neutral-400 uppercase font-bold">{tmpl.category}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Pakai
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* H. HELP TAB */}
              {activeTab === 'help' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Bantuan & Panduan</h2>
                  
                  <div className="space-y-3 text-xs text-neutral-600">
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <h4 className="font-black text-neutral-900 mb-1">Bagaimana cara memesan?</h4>
                      <p className="text-[11px] leading-relaxed">
                        Desain kaosmu sesuka hati, lalu klik tombol kuning <b>"Masukkan ke Keranjang"</b> di pojok kanan atas untuk memasukkan rincian ukuran dan mengirim langsung ke WhatsApp admin.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <h4 className="font-black text-neutral-900 mb-1">Maksimal Area Cetak</h4>
                      <p className="text-[11px] leading-relaxed">
                        Area cetak depan & belakang mendukung ukuran standar A5, A4, hingga A3 jumbo.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <h4 className="font-black text-neutral-900 mb-1">Butuh Bantuan Desainer?</h4>
                      <p className="text-[11px] leading-relaxed mb-2">
                        Tim admin Kaos Dilio siap membantu menyempurnakan file desainmu tanpa biaya tambahan!
                      </p>
                      <a
                        href={getWhatsAppUrl('Halo Admin Kaos Dilio, saya butuh bantuan konsultasi desain custom')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-600 font-bold hover:underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp Admin</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. CANVAS STAGE AREA */}
            <div className="flex-1 bg-[#F0F2F5] relative flex flex-col items-center justify-center p-4 min-h-[460px] overflow-hidden">
              
              {/* Floating Canvas Action Bar (Undo, Redo, Zoom, Delete) */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-neutral-200 shadow-sm">
                <button
                  type="button"
                  onClick={handleDeleteActive}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-red-600 transition-colors cursor-pointer"
                  title="Hapus Objek Terpilih"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="w-px h-4 bg-neutral-200"></span>
                <button
                  type="button"
                  onClick={() => handleZoom(-0.1)}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors cursor-pointer"
                  title="Perkecil (Zoom Out)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(0.1)}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors cursor-pointer"
                  title="Perbesar (Zoom In)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Angle Switcher Pills (Depan, Belakang, Lengan Kiri, Lengan Kanan) */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-neutral-200 shadow-sm">
                {ANGLES.map((ang) => (
                  <button
                    key={ang.id}
                    type="button"
                    onClick={() => handleSwitchAngle(ang.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentAngle === ang.id
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    {ang.label}
                  </button>
                ))}
              </div>

              {/* T-Shirt Studio Stage with Authentic Backdrop Cutout */}
              <div
                className="relative select-none transition-transform duration-200"
                style={{
                  width: 520,
                  height: 520,
                  transform: `scale(${zoomLevel})`
                }}
              >
                {/* 1. Real Studio Photo Background */}
                <img
                  src={shirtPhotoUrl}
                  alt={`${currentProduct.name} ${currentColor.name}`}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-md"
                  onError={(e) => {
                    // Fallback to black cutout if color file not found
                    e.currentTarget.src = `${BASE_URL}/mockup-assets/${currentAngle}/black.jpg`;
                  }}
                />

                {/* 2. Dotted Bounding Box for Printable Area */}
                <div
                  className="absolute border border-dashed border-neutral-400/70 pointer-events-none rounded-sm flex flex-col justify-between p-1"
                  style={{
                    width: 260,
                    height: 360,
                    left: 130,
                    top: 80
                  }}
                >
                  <span className="text-[9px] font-mono font-bold text-neutral-400 tracking-wider">
                    Area Cetak (A3 / A4)
                  </span>
                  <span className="text-[9px] font-mono font-bold text-neutral-400 self-end">
                    {currentAngle === 'front' ? 'Dada Depan' : currentAngle === 'back' ? 'Punggung' : 'Lengan'}
                  </span>
                </div>

                {/* 3. Interactive Fabric.js Canvas */}
                <div
                  className="absolute"
                  style={{
                    width: 260,
                    height: 360,
                    left: 130,
                    top: 80
                  }}
                >
                  <canvas ref={canvasElRef} width={260} height={360} />
                </div>
              </div>

              {/* Canvas bottom caption */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <span className="text-[11px] font-semibold text-neutral-400">
                  Klik objek pada kaos untuk menggeser, memutar, atau mengubah ukuran.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PRODUCT DETAILS */}
      {/* ========================================================================= */}
      {productDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setProductDetailsOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {currentProduct.badge}
              </span>
              <h3 className="text-lg font-black text-neutral-900 mt-2">{currentProduct.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">{currentProduct.tags}</p>
            </div>

            <div className="space-y-2 text-xs text-neutral-700">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">Spesifikasi Bahan:</h4>
              <ul className="space-y-1.5 list-disc pl-4 text-neutral-600 leading-relaxed">
                {currentProduct.specs.map((sp, idx) => (
                  <li key={idx}>{sp}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-neutral-400 block font-bold">Harga Bahan:</span>
                <span className="text-lg font-black text-neutral-900">
                  Rp {currentProduct.price.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setProductDetailsOpen(false)}
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SIZE GUIDE (PANDUAN UKURAN) */}
      {/* ========================================================================= */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-lg font-black text-neutral-900">Panduan Ukuran (Size Chart)</h3>
              <p className="text-xs text-neutral-500 mt-1">Standar ukuran Kaos Polos Indonesia (Toleransi 1-2 cm)</p>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 text-neutral-700 uppercase font-black text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Ukuran</th>
                    <th className="px-4 py-3">Lebar Dada (cm)</th>
                    <th className="px-4 py-3">Panjang Badan (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-semibold text-neutral-700">
                  <tr><td className="px-4 py-2.5 font-bold">S</td><td className="px-4 py-2.5">47 cm</td><td className="px-4 py-2.5">67 cm</td></tr>
                  <tr><td className="px-4 py-2.5 font-bold">M</td><td className="px-4 py-2.5">50 cm</td><td className="px-4 py-2.5">70 cm</td></tr>
                  <tr><td className="px-4 py-2.5 font-bold">L</td><td className="px-4 py-2.5">53 cm</td><td className="px-4 py-2.5">73 cm</td></tr>
                  <tr><td className="px-4 py-2.5 font-bold">XL</td><td className="px-4 py-2.5">56 cm</td><td className="px-4 py-2.5">75 cm</td></tr>
                  <tr><td className="px-4 py-2.5 font-bold">2XL</td><td className="px-4 py-2.5">59 cm</td><td className="px-4 py-2.5">77 cm</td></tr>
                  <tr><td className="px-4 py-2.5 font-bold">3XL</td><td className="px-4 py-2.5">62 cm</td><td className="px-4 py-2.5">80 cm</td></tr>
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRICELIST SABLON (DTF & PLASTISOL) */}
      {/* ========================================================================= */}
      {pricelistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setPricelistOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-xl font-black text-neutral-900">Daftar Harga Sablon Satuan &amp; Grosir</h3>
              <p className="text-xs text-neutral-500 mt-1">Estimasi biaya cetak sablon Kaos Dilio (di luar harga bahan kaos)</p>
            </div>

            <div className="space-y-4 text-xs">
              {/* DTF Table */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                <div className="bg-neutral-900 text-white px-4 py-2.5 font-black text-xs flex justify-between items-center">
                  <span>Sablon DTF (Direct to Film) Full Color</span>
                  <span className="text-[10px] text-amber-400 font-bold">Bisa Satuan Tanpa Minimum</span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 text-[10px] text-neutral-600 uppercase font-bold border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-2">Ukuran Area</th>
                      <th className="px-4 py-2">Dimensi</th>
                      <th className="px-4 py-2">Satuan (1-11 pcs)</th>
                      <th className="px-4 py-2">Grosir (12+ pcs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-semibold text-neutral-700">
                    <tr><td className="px-4 py-2.5 font-bold">Logo / Saku (A6)</td><td className="px-4 py-2.5">10 x 10 cm</td><td className="px-4 py-2.5">Rp 10.000</td><td className="px-4 py-2.5 text-emerald-600 font-bold">Rp 6.000</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">Sedang (A4)</td><td className="px-4 py-2.5">21 x 29 cm</td><td className="px-4 py-2.5">Rp 20.000</td><td className="px-4 py-2.5 text-emerald-600 font-bold">Rp 14.000</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">Jumbo (A3)</td><td className="px-4 py-2.5">29 x 42 cm</td><td className="px-4 py-2.5">Rp 30.000</td><td className="px-4 py-2.5 text-emerald-600 font-bold">Rp 22.000</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[11px] text-neutral-400">*Harga grosir otomatis berlaku untuk pesanan 12 pcs ke atas.</span>
              <button
                type="button"
                onClick={() => setPricelistOpen(false)}
                className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ORDER & CART MODAL (SEND TO WHATSAPP) */}
      {/* ========================================================================= */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCartModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Langkah Terakhir Pemesanan
              </span>
              <h3 className="text-xl font-black text-neutral-900 mt-1">Konfirmasi Pesanan Custom</h3>
              <p className="text-xs text-neutral-500">
                Masukkan rincian ukuran &amp; jumlah yang diinginkan. Pesanan akan diteruskan langsung ke WhatsApp admin.
              </p>
            </div>

            {/* Product Summary Box */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-4">
              <img
                src={shirtPhotoUrl}
                alt={currentProduct.name}
                className="w-16 h-16 object-contain rounded-xl bg-white border border-neutral-200 p-1"
              />
              <div className="flex-1">
                <h4 className="text-xs font-black text-neutral-900">{currentProduct.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-3 h-3 rounded-full border border-neutral-300" style={{ backgroundColor: currentColor.hex }} />
                  <span className="text-xs font-semibold text-neutral-600">{currentColor.name}</span>
                </div>
                <span className="text-xs font-bold text-neutral-900 block mt-1">
                  Rp {currentProduct.price.toLocaleString('id-ID')} / pcs
                </span>
              </div>
            </div>

            {/* Size Breakdown Inputs */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-2">
                Pilih Jumlah per Ukuran:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {currentProduct.sizes.map((s) => (
                  <div key={s} className="p-2 border border-neutral-200 rounded-xl text-center bg-white space-y-1">
                    <span className="text-xs font-black text-neutral-800 block">{s}</span>
                    <input
                      type="number"
                      min="0"
                      value={sizeQuantities[s] || 0}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setSizeQuantities((prev) => ({ ...prev, [s]: val }));
                      }}
                      className="w-full text-center text-xs font-bold border border-neutral-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Contact Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nama Pemesan (Opsional):</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Catatan Tambahan (Opsional):</label>
                <textarea
                  rows="2"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Contoh: Butuh tanggal 28 Oktober, lokasi kirim Bandung..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Total calculation & Submit Button */}
            <div className="pt-3 border-t border-neutral-200 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-neutral-500">Total Kuantitas:</span>
                <span className="text-neutral-900 font-black">{totalQty} pcs</span>
              </div>
              <div className="flex justify-between items-center text-base font-black">
                <span className="text-neutral-700">Estimasi Total Bahan:</span>
                <span className="text-neutral-900 text-lg">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>

              <button
                type="button"
                onClick={handleSendWhatsAppOrder}
                className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Pesan Sekarang ke WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
