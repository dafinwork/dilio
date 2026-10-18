import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shirt,
  Download,
  Copy,
  Check,
  RefreshCw,
  Upload,
  ArrowLeft,
  Sparkles,
  Palette,
  Sliders,
  Layers,
  Eye,
  Camera,
  Trash2,
  Maximize2
} from 'lucide-react';

// Trending e-commerce & streetwear t-shirt palette
const POPULAR_PALETTE = [
  { name: 'Jet Black', hex: '#121212', dark: true },
  { name: 'Pure White', hex: '#FFFFFF', dark: false },
  { name: 'Broken White', hex: '#F4F2EB', dark: false },
  { name: 'Charcoal Grey', hex: '#2C3038', dark: true },
  { name: 'Misty Grey', hex: '#B8BCC4', dark: false },
  { name: 'Sage Green', hex: '#5E8C7A', dark: true },
  { name: 'Olive Army', hex: '#484F38', dark: true },
  { name: 'Terracotta', hex: '#BD5338', dark: true },
  { name: 'Deep Maroon', hex: '#6E1A24', dark: true },
  { name: 'Navy Dark', hex: '#141E30', dark: true },
  { name: 'Electric Blue', hex: '#2255A4', dark: true },
  { name: 'Dusty Lilac', hex: '#8778A8', dark: true },
  { name: 'Mustard Warm', hex: '#CF8B26', dark: true },
  { name: 'Mocha Brown', hex: '#5C4033', dark: true },
];

// Cutting models definition with realistic organic SVG vectors
const SHIRT_MODELS = {
  boxy: {
    id: 'boxy',
    name: 'Boxy Fit',
    subtitle: 'Streetwear Drop-Shoulder',
    bodyPath: 'M 345 155 C 395 180, 475 180, 525 155 C 640 185, 770 235, 820 265 L 910 475 L 750 570 L 675 470 L 665 770 C 665 785, 645 795, 435 795 C 225 795, 205 785, 205 770 L 195 470 L 120 570 L -40 475 L 50 265 C 100 235, 230 185, 345 155 Z',
    collarOuter: 'M 345 155 C 395 220, 475 220, 525 155 C 475 238, 395 238, 345 155 Z',
    neckHole: 'M 350 160 C 395 200, 475 200, 520 160 C 475 178, 395 178, 350 160 Z',
    sleevesFold: [
      { d: 'M 195 470 C 255 590, 315 690, 235 780 C 225 670, 195 540, 195 470 Z', op: 0.55 },
      { d: 'M 675 470 C 615 590, 555 690, 635 780 C 645 670, 675 540, 675 470 Z', op: 0.55 },
      { d: 'M 255 640 C 395 690, 475 690, 615 640 C 475 735, 395 735, 255 640 Z', op: 0.38 },
      { d: 'M 50 265 C 100 395, 140 495, 120 570 C 100 495, 80 395, 50 265 Z', op: 0.45 },
      { d: 'M 820 265 C 770 395, 730 495, 750 570 C 770 495, 790 395, 820 265 Z', op: 0.45 },
    ],
    graphicBox: { x: 330, y: 320, width: 210, height: 260 }
  },
  oversized: {
    id: 'oversized',
    name: 'Oversized',
    subtitle: 'Relaxed Loose Fit',
    bodyPath: 'M 335 145 C 395 170, 475 170, 535 145 C 625 168, 755 208, 795 228 L 845 490 L 715 565 L 655 455 L 655 905 C 655 925, 635 935, 435 935 C 235 935, 215 925, 215 905 L 215 455 L 155 565 L 25 490 L 75 228 C 115 208, 245 168, 335 145 Z',
    collarOuter: 'M 335 145 C 395 210, 475 210, 535 145 C 475 228, 395 228, 335 145 Z',
    neckHole: 'M 340 150 C 395 190, 475 190, 530 150 C 475 170, 395 170, 340 150 Z',
    sleevesFold: [
      { d: 'M 215 455 C 255 645, 275 795, 235 925 C 215 785, 205 635, 215 455 Z', op: 0.5 },
      { d: 'M 655 455 C 615 645, 595 795, 635 925 C 655 785, 665 635, 655 455 Z', op: 0.5 },
      { d: 'M 245 735 C 375 785, 495 785, 625 735 C 495 835, 375 835, 245 735 Z', op: 0.35 },
      { d: 'M 75 228 C 125 350, 165 440, 155 565 C 135 440, 105 350, 75 228 Z', op: 0.4 },
      { d: 'M 795 228 C 745 350, 705 440, 715 565 C 735 440, 765 350, 795 228 Z', op: 0.4 }
    ],
    graphicBox: { x: 320, y: 320, width: 230, height: 280 }
  },
  regular: {
    id: 'regular',
    name: 'Regular Fit',
    subtitle: 'Standard Classic Cut',
    bodyPath: 'M 345 148 C 395 178, 475 178, 525 148 C 595 168, 675 198, 715 228 L 785 435 L 675 495 L 635 395 L 635 840 C 635 860, 615 870, 435 870 C 255 870, 235 860, 235 840 L 235 395 L 195 495 L 85 435 L 155 228 C 195 198, 275 168, 345 148 Z',
    collarOuter: 'M 345 148 C 395 218, 475 218, 525 148 C 475 233, 395 233, 345 148 Z',
    neckHole: 'M 350 153 C 395 198, 475 198, 520 153 C 475 178, 395 178, 350 153 Z',
    sleevesFold: [
      { d: 'M 235 395 C 265 575, 285 745, 255 840 C 255 695, 235 575, 235 395 Z', op: 0.48 },
      { d: 'M 635 395 C 605 575, 585 745, 615 840 C 615 695, 635 575, 635 395 Z', op: 0.48 },
      { d: 'M 295 300 C 435 345, 575 345, 545 490 C 475 395, 375 395, 295 300 Z', op: 0.28 }
    ],
    graphicBox: { x: 335, y: 310, width: 200, height: 260 }
  },
  fitted: {
    id: 'fitted',
    name: 'Fitted / Slim',
    subtitle: 'Athletic Slim Fit',
    bodyPath: 'M 355 138 C 395 168, 475 168, 515 138 C 565 158, 625 178, 655 208 L 695 395 L 615 445 L 585 345 L 575 810 C 575 830, 555 840, 435 840 C 315 840, 295 830, 295 810 L 285 345 L 255 445 L 175 395 L 215 208 C 245 178, 305 158, 355 138 Z',
    collarOuter: 'M 355 138 C 395 208, 475 208, 515 138 C 475 218, 395 218, 355 138 Z',
    neckHole: 'M 360 143 C 395 188, 475 188, 510 143 C 475 168, 395 168, 360 143 Z',
    sleevesFold: [
      { d: 'M 285 345 C 325 540, 335 690, 305 810 C 305 640, 295 490, 285 345 Z', op: 0.38 },
      { d: 'M 585 345 C 545 540, 535 690, 565 810 C 565 640, 575 490, 585 345 Z', op: 0.38 }
    ],
    graphicBox: { x: 345, y: 300, width: 180, height: 250 }
  },
  longsleeve: {
    id: 'longsleeve',
    name: 'Long Sleeve',
    subtitle: 'Classic Cuffed Arm',
    bodyPath: 'M 345 148 C 395 178, 475 178, 525 148 C 575 168, 615 178, 635 188 L 845 810 L 725 840 L 635 395 L 635 840 C 635 860, 615 870, 435 870 C 255 870, 235 860, 235 840 L 235 395 L 145 840 L 25 810 L 235 188 C 255 178, 295 168, 345 148 Z',
    collarOuter: 'M 345 148 C 395 218, 475 218, 525 148 C 475 233, 395 233, 345 148 Z',
    neckHole: 'M 350 153 C 395 198, 475 198, 520 153 C 475 178, 395 178, 350 153 Z',
    sleevesFold: [
      { d: 'M 235 395 C 265 575, 285 745, 255 840 C 255 695, 235 575, 235 395 Z', op: 0.48 },
      { d: 'M 635 395 C 605 575, 585 745, 615 840 C 615 695, 635 575, 635 395 Z', op: 0.48 },
      { d: 'M 235 188 C 175 440, 115 640, 25 810 C 95 640, 155 440, 235 188 Z', op: 0.4 },
      { d: 'M 635 188 C 695 440, 755 640, 845 810 C 775 640, 715 440, 635 188 Z', op: 0.4 }
    ],
    graphicBox: { x: 335, y: 310, width: 200, height: 260 }
  }
};

export default function StudioMockupPage() {
  // State variables
  const [selectedModel, setSelectedModel] = useState('boxy');
  const [hexColor, setHexColor] = useState('#121212');
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1', '9:16', '4:5'
  const [fabricTextureIntensity, setFabricTextureIntensity] = useState(0.25);
  const [foldsIntensity, setFoldsIntensity] = useState(0.5);
  const [showGrid, setShowGrid] = useState(true);
  const [studioBg, setStudioBg] = useState('#FFFFFF'); // '#FFFFFF', '#F4F4F6', '#18181B', 'transparent'
  
  // Custom Graphic / Logo Sablon
  const [customGraphic, setCustomGraphic] = useState(null);
  const [graphicScale, setGraphicScale] = useState(1);
  const [graphicPosY, setGraphicPosY] = useState(0); // Offset in pixels
  const [sablonStyle, setSablonStyle] = useState('dtf'); // 'dtf', 'plastisol', 'vintage'

  // Status & Feedback
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const svgRef = useRef(null);
  const previewContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentModel = SHIRT_MODELS[selectedModel] || SHIRT_MODELS.boxy;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle Graphic File Upload
  const handleGraphicUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomGraphic(event.target.result);
        showToast('Sablon/Logo berhasil dimuat ke kaos!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Aspect ratio dimension calculation
  const containerDimensions = useMemo(() => {
    if (aspectRatio === '9:16') {
      return { maxWidth: '420px', aspectRatio: '9 / 16' };
    }
    if (aspectRatio === '4:5') {
      return { maxWidth: '520px', aspectRatio: '4 / 5' };
    }
    return { maxWidth: '620px', aspectRatio: '1 / 1' };
  }, [aspectRatio]);

  // Export engine: generates clean, ultra-crisp studio photo (1080px base)
  const generateExportCanvas = useCallback(async () => {
    const targetWidth = 1080;
    let targetHeight = 1080;
    if (aspectRatio === '9:16') targetHeight = 1920;
    if (aspectRatio === '4:5') targetHeight = 1350;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Fill background
    if (studioBg !== 'transparent') {
      ctx.fillStyle = studioBg;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else {
      ctx.clearRect(0, 0, targetWidth, targetHeight);
    }

    // Clone and serialize the SVG
    if (!svgRef.current) return null;
    const clonedSvg = svgRef.current.cloneNode(true);
    clonedSvg.setAttribute('width', targetWidth * 0.88);
    clonedSvg.setAttribute('height', targetWidth * 0.88);

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const x = (targetWidth - img.width) / 2;
        const y = (targetHeight - img.height) / 2;

        // Draw soft contact ground shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 25;
        ctx.drawImage(img, x, y);
        ctx.restore();

        DOMURL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = (err) => {
        DOMURL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  }, [aspectRatio, studioBg]);

  // Download High-Resolution JPG
  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateExportCanvas();
      if (!canvas) throw new Error('Failed to generate image');

      const link = document.createElement('a');
      const cleanHex = hexColor.replace('#', '').toUpperCase();
      link.download = `FotoStudio_${selectedModel}_${cleanHex}_${aspectRatio.replace(':', 'x')}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      showToast('Foto studio berhasil diunduh (1080px)!');
    } catch (err) {
      console.error(err);
      showToast('Gagal merender foto produk.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard (Instant paste to WhatsApp Web)
  const handleCopyClipboard = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateExportCanvas();
      if (!canvas) throw new Error('Failed to generate image');

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopySuccess(true);
          showToast('Gambar tersalin ke Clipboard! Tinggal Ctrl+V di WA.');
          setTimeout(() => setCopySuccess(false), 3000);
        } catch (clipErr) {
          console.warn('Clipboard API error:', clipErr);
          // Fallback download if clipboard is restricted by browser
          const link = document.createElement('a');
          link.download = `FotoStudio_${selectedModel}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          showToast('Gambar otomatis diunduh (akses clipboard browser dibatasi).');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyalin gambar.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#111317] text-white font-sans overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-neutral-900/95 border border-white/20 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR: Controls & Tooling */}
      <aside className="w-full lg:w-[380px] bg-[#181B21] border-r border-white/10 flex flex-col flex-shrink-0 z-30 h-auto lg:h-screen lg:overflow-y-auto custom-scrollbar">
        {/* Studio Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#14161C] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-wide">Studio Mockup AI</h1>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Foto Asli
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">Photorealistic Studio Engine</p>
            </div>
          </div>
          <Link
            to="/admin"
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            title="Kembali ke Dashboard CMS"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* CONTROLS CONTAINER */}
        <div className="p-5 space-y-6 flex-1">
          
          {/* 1. WARNA KAOS (Color Wheel & Hex) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Warna Kaos (Color Wheel)
              </label>
              <span className="text-xs font-mono font-bold text-neutral-400">{hexColor.toUpperCase()}</span>
            </div>

            {/* Simulated Dynamic Color Wheel */}
            <div className="flex items-center justify-center py-2">
              <div
                className="w-32 h-32 rounded-full relative flex items-center justify-center p-1.5 shadow-xl transition-transform hover:scale-105 cursor-pointer"
                style={{
                  background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                }}
              >
                {/* Center preview disc */}
                <div className="w-20 h-20 rounded-full bg-[#181B21] flex items-center justify-center shadow-inner pointer-events-none z-10 border border-white/10">
                  <div
                    className="w-12 h-12 rounded-xl shadow-md border-2 border-white/30 transition-all duration-200"
                    style={{ backgroundColor: hexColor }}
                  />
                </div>
                {/* Native Color Input covering the wheel */}
                <input
                  type="color"
                  value={hexColor.startsWith('#') ? hexColor : '#121212'}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                  title="Pilih warna bebas"
                />
              </div>
            </div>

            {/* Hex Input & Native Picker Trigger */}
            <div className="flex items-center gap-2 bg-[#121418] border border-white/10 rounded-xl px-3 py-2 focus-within:border-white/40 transition-colors">
              <input
                type="color"
                value={hexColor.startsWith('#') ? hexColor : '#121212'}
                onChange={(e) => setHexColor(e.target.value)}
                className="w-6 h-6 rounded border-none bg-transparent cursor-pointer p-0"
              />
              <input
                type="text"
                value={hexColor.toUpperCase()}
                maxLength={7}
                onChange={(e) => {
                  let v = e.target.value;
                  if (!v.startsWith('#')) v = '#' + v;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                    setHexColor(v);
                  }
                }}
                placeholder="#121212"
                className="bg-transparent border-none outline-none text-white text-xs font-mono font-bold w-full uppercase"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(hexColor);
                  showToast(`Kode ${hexColor} disalin!`);
                }}
                className="text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                Copy
              </button>
            </div>

            {/* Trending Streetwear & Distro Presets */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-400 mb-2">Preset Warna E-Commerce Terlaris:</p>
              <div className="grid grid-cols-7 gap-1.5">
                {POPULAR_PALETTE.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => setHexColor(pal.hex)}
                    className={`h-8 rounded-lg border transition-all duration-150 hover:scale-110 flex items-center justify-center ${
                      hexColor.toUpperCase() === pal.hex.toUpperCase()
                        ? 'border-white ring-2 ring-amber-400/80 scale-105'
                        : 'border-white/10'
                    }`}
                    style={{ backgroundColor: pal.hex }}
                    title={`${pal.name} (${pal.hex})`}
                  >
                    {hexColor.toUpperCase() === pal.hex.toUpperCase() && (
                      <Check className={`w-3.5 h-3.5 ${pal.dark ? 'text-white' : 'text-neutral-900'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. MODEL POTONGAN (Cutting Model) */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5 text-blue-400" />
              Model Potongan (Cutting Model)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(SHIRT_MODELS).map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neutral-800 border-white/50 text-white shadow-md ring-1 ring-white/30'
                        : 'bg-[#14161C] border-white/10 text-neutral-400 hover:border-white/30 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{m.name}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </div>
                    <span className="text-[10px] text-neutral-400 line-clamp-1">{m.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. RASIO FOTO & LATAR STUDIO */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              Rasio Foto & Latar Belakang
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '1:1', label: '1:1 (Square)', desc: '1080px' },
                { id: '9:16', label: '9:16 (Story)', desc: '1920px' },
                { id: '4:5', label: '4:5 (Feed)', desc: '1350px' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setAspectRatio(r.id)}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    aspectRatio === r.id
                      ? 'bg-neutral-800 border-white/50 text-white font-bold'
                      : 'bg-[#14161C] border-white/10 text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs">{r.label}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">{r.desc}</div>
                </button>
              ))}
            </div>

            {/* Background Studio Selector */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-neutral-400 font-medium">Latar Studio:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { bg: '#FFFFFF', title: 'Putih Studio Asli' },
                  { bg: '#F4F4F6', title: 'Abu-abu Terang' },
                  { bg: '#18181B', title: 'Dark Studio' },
                  { bg: 'transparent', title: 'Transparan PNG' },
                ].map((b) => (
                  <button
                    key={b.bg}
                    type="button"
                    onClick={() => setStudioBg(b.bg)}
                    className={`w-6 h-6 rounded-md border transition-all ${
                      studioBg === b.bg ? 'ring-2 ring-amber-400 scale-110' : 'border-white/20'
                    }`}
                    style={{
                      backgroundColor: b.bg === 'transparent' ? '#333' : b.bg,
                      backgroundImage: b.bg === 'transparent' ? 'repeating-linear-gradient(45deg, #444 0, #444 4px, #333 4px, #333 8px)' : 'none'
                    }}
                    title={b.title}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 4. TEMPEL SABLON / LOGO (Graphic Overlay) */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Tempel Sablon / Logo
              </label>
              {customGraphic && (
                <button
                  type="button"
                  onClick={() => setCustomGraphic(null)}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>

            {!customGraphic ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/20 hover:border-white/50 text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logo / Desain Sablon (PNG)</span>
              </button>
            ) : (
              <div className="space-y-2.5 bg-[#14161C] p-3 rounded-xl border border-white/10">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Ukuran Sablon:</span>
                  <span className="font-mono text-neutral-300">{Math.round(graphicScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.6"
                  step="0.05"
                  value={graphicScale}
                  onChange={(e) => setGraphicScale(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Posisi Vertikal:</span>
                  <span className="font-mono text-neutral-300">{graphicPosY}px</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="100"
                  step="5"
                  value={graphicPosY}
                  onChange={(e) => setGraphicPosY(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="flex items-center gap-1.5 pt-1">
                  {['dtf', 'plastisol', 'vintage'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSablonStyle(mode)}
                      className={`flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${
                        sablonStyle === mode
                          ? 'bg-purple-900/60 border-purple-400 text-purple-200'
                          : 'border-white/10 text-neutral-400 hover:border-white/20'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleGraphicUpload}
              className="hidden"
            />
          </div>

          {/* 5. FINE-TUNING TEXTURE & KERUTAN */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Detail Tekstur & Kerutan Kain
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Intensitas Bayangan/Kerutan:</span>
                <span className="font-mono text-white">{Math.round(foldsIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.9"
                step="0.05"
                value={foldsIntensity}
                onChange={(e) => setFoldsIntensity(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Serat Kain Katun (Combed Weave):</span>
                <span className="font-mono text-white">{Math.round(fabricTextureIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={fabricTextureIntensity}
                onChange={(e) => setFabricTextureIntensity(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-5 border-t border-white/10 bg-[#14161C] space-y-2.5 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-white hover:bg-neutral-200 text-neutral-900 shadow-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>UNDUH FOTO (1080px JPG)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyClipboard}
            disabled={isExporting}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copySuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copySuccess ? 'Tersalin ke Clipboard!' : 'Salin Gambar (Ctrl+V ke WA)'}</span>
          </button>
        </div>
      </aside>

      {/* RIGHT WORKSPACE: LIVE HIGH-FIDELITY PREVIEW */}
      <main className="flex-1 flex flex-col bg-[#0F1014] relative overflow-hidden">
        {/* Top Preview Control Bar */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#14161C]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-semibold text-neutral-300">
              PREVIEW: FOTO STUDIO ASLI (Bukan Vektor)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                showGrid
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-transparent border-white/10 text-neutral-400'
              }`}
              title="Toggle Grid Garis Studio"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid Studio</span>
            </button>

            {/* Quick Button to CMS */}
            <Link
              to="/admin"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors"
            >
              Buka CMS Kaos Dilio
            </Link>
          </div>
        </div>

        {/* WORKSPACE PREVIEW STAGE */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-auto">
          {/* Mockup Frame */}
          <div
            ref={previewContainerRef}
            className={`relative rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden border border-white/10 ${
              showGrid ? 'studio-grid-pattern' : ''
            }`}
            style={{
              backgroundColor: studioBg === 'transparent' ? '#222' : studioBg,
              width: '100%',
              maxWidth: containerDimensions.maxWidth,
              aspectRatio: containerDimensions.aspectRatio,
              backgroundImage: studioBg === 'transparent' ? 'repeating-linear-gradient(45deg, #2a2a2a 0, #2a2a2a 8px, #1f1f1f 8px, #1f1f1f 16px)' : undefined
            }}
          >
            {/* Soft Ambient Contact Shadow on Ground */}
            <div
              className="absolute w-[80%] h-12 rounded-[50%] blur-2xl pointer-events-none transition-all duration-300"
              style={{
                bottom: '8%',
                backgroundColor: 'rgba(0, 0, 0, 0.28)',
              }}
            />

            {/* RENDER ENGINE (SVG Multi-pass filter + procedural shader) */}
            <svg
              ref={svgRef}
              viewBox="0 0 1000 1000"
              className="w-[88%] h-[88%] drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)] transition-all duration-300 relative z-10"
            >
              <defs>
                {/* 1. Procedural High-Res Cotton Micro-Texture */}
                <filter id="fabric-cotton-texture" x="0%" y="0%" width="100%" height="100%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.75"
                    numOctaves="4"
                    stitchTiles="stitch"
                    result="noise"
                  />
                  <feColorMatrix
                    type="matrix"
                    values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.18 0"
                    result="coloredNoise"
                  />
                  <feComposite in2="SourceGraphic" in="coloredNoise" operator="in" />
                </filter>

                {/* 2. Studio Lighting & Inner Depth Filter */}
                <filter id="studio-softbox" x="-15%" y="-15%" width="130%" height="130%">
                  {/* Subtle inner soft shadow on edges */}
                  <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blurAlpha" />
                  <feOffset dx="0" dy="6" />
                  <feComposite operator="in" in2="SourceAlpha" />
                  <feComposite operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
                  <feFlood floodColor="#000000" floodOpacity="0.45" />
                  <feComposite operator="in" in2="shadowDiff" />
                  <feComposite operator="over" in2="SourceGraphic" />
                </filter>

                {/* Folds Soft & Sharp Blurs */}
                <filter id="fold-soft" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="22" />
                </filter>
                <filter id="fold-hard" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="7" />
                </filter>

                {/* 3. Soft Studio Top-Left Light Gradient */}
                <linearGradient id="studioLightGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
                </linearGradient>

                {/* Collar Ribbing Texture Pattern */}
                <pattern id="collar-rib" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 0 0 L 8 0 M 0 4 L 8 4" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* T-SHIRT RENDER GROUP */}
              <g filter="url(#studio-softbox)">
                {/* 1. Base Fabric Shape with Dynamic Color */}
                <path
                  d={currentModel.bodyPath}
                  fill={hexColor}
                  className="transition-colors duration-200"
                />

                {/* 2. Fabric Weave Micro-Texture Layer (Multiply) */}
                <path
                  d={currentModel.bodyPath}
                  fill="#ffffff"
                  filter="url(#fabric-cotton-texture)"
                  opacity={fabricTextureIntensity}
                  style={{ mixBlendMode: 'multiply' }}
                />

                {/* 3. Studio Studio Lighting Gradient (Top light to bottom falloff) */}
                <path
                  d={currentModel.bodyPath}
                  fill="url(#studioLightGrad)"
                  style={{ mixBlendMode: 'overlay' }}
                />

                {/* 4. Natural Wrinkles & Fabric Folds (Procedural anatomical shadows) */}
                <g style={{ mixBlendMode: 'multiply' }}>
                  {currentModel.sleevesFold.map((fold, idx) => (
                    <path
                      key={idx}
                      d={fold.d}
                      fill="#000000"
                      opacity={fold.op * foldsIntensity * 1.5}
                      filter="url(#fold-soft)"
                    />
                  ))}
                </g>

                {/* 5. Custom Sablon Graphic (If Uploaded) */}
                {customGraphic && (
                  <g
                    transform={`translate(${currentModel.graphicBox.x + (1 - graphicScale) * 100}, ${
                      currentModel.graphicBox.y + graphicPosY + (1 - graphicScale) * 100
                    }) scale(${graphicScale})`}
                    style={{
                      mixBlendMode:
                        sablonStyle === 'vintage'
                          ? 'multiply'
                          : sablonStyle === 'plastisol'
                          ? 'normal'
                          : 'source-over',
                    }}
                  >
                    <image
                      href={customGraphic}
                      width={currentModel.graphicBox.width}
                      height={currentModel.graphicBox.height}
                      preserveAspectRatio="xMidYMid meet"
                      opacity={sablonStyle === 'vintage' ? 0.85 : 1}
                    />
                  </g>
                )}

                {/* 6. Collar & Neck Ribbing (Realistic Depth) */}
                {/* Neck interior (Dark depth) */}
                <path
                  d={currentModel.neckHole}
                  fill="#0B0D11"
                  opacity="0.94"
                />

                {/* Outer Collar Band */}
                <path
                  d={currentModel.collarOuter}
                  fill={hexColor}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="2"
                  filter="url(#fold-hard)"
                />

                {/* Collar Ribbing Overlay */}
                <path
                  d={currentModel.collarOuter}
                  fill="url(#collar-rib)"
                  opacity="0.4"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* BOTTOM QUICK PALETTE BAR */}
        <div className="py-3 px-6 bg-[#14161C] border-t border-white/10 flex items-center justify-between overflow-x-auto text-xs text-neutral-400">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-semibold text-neutral-300">Tips Mas Bayu:</span>
            <span>Gunakan tombol "Salin Gambar" untuk paste instan langsung ke chat WA tanpa perlu simpan file.</span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-mono text-neutral-400">Mode: 100% Client-Side Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400 font-bold">Siap GitHub Pages</span>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #14161C;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2C3038;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3E4450;
        }

        .studio-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 33.333% 33.333%;
          background-position: center center;
        }
      `}</style>
    </div>
  );
}
