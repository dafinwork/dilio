import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, Pipette, Sparkles } from 'lucide-react';
import { getColorName } from '../../utils/helpers';

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function hexToHsl(hex) {
  let clean = String(hex || '').replace('#', '').trim();
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  if (clean.length !== 6) return [180, 50, 50];
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

const TRENDING_TSHIRT_PALETTE = [
  { name: 'Sage Green', hex: '#5FADA6' },
  { name: 'Dusty Rose', hex: '#AD5F67' },
  { name: 'Terracotta', hex: '#D97706' },
  { name: 'Navy Dark', hex: '#0B132B' },
  { name: 'Olive Army', hex: '#4D533C' },
  { name: 'Deep Maroon', hex: '#7F1D1D' },
  { name: 'Mustard Warm', hex: '#D97706' },
  { name: 'Dusty Lilac', hex: '#9381FF' },
  { name: 'Charcoal Grey', hex: '#374151' },
  { name: 'Mocha Brown', hex: '#6F4E37' },
  { name: 'Butter Cream', hex: '#FEF3C7' },
  { name: 'Ice Blue', hex: '#93C5FD' },
];

export default function ColorWheelModal({ isOpen, initialColor = '#5FADA6', onClose, onSelectColor }) {
  const [hue, setHue] = useState(175);
  const [sat, setSat] = useState(32);
  const [lightness, setLightness] = useState(53);
  const [hexInput, setHexInput] = useState('#5FADA6');
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef(null);
  const nativeInputRef = useRef(null);

  // Sync initial color
  useEffect(() => {
    if (isOpen) {
      const validHex = initialColor && initialColor.startsWith('#') ? initialColor : '#5FADA6';
      const [h, s, l] = hexToHsl(validHex);
      setHue(h);
      setSat(s);
      setLightness(l);
      setHexInput(validHex.toUpperCase());
    }
  }, [isOpen, initialColor]);

  // Compute current hex from HSL
  const currentHex = rgbToHex(...hslToRgb(hue, sat, lightness));

  // Draw wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - radius;
        const dy = y - radius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const index = (y * width + x) * 4;

        if (dist <= radius) {
          let angle = Math.atan2(dy, dx) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          const s = (dist / radius) * 100;
          const [r, g, b] = hslToRgb(angle, s, lightness);
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        } else {
          data[index + 3] = 0;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [lightness]);

  useEffect(() => {
    if (isOpen) {
      drawWheel();
    }
  }, [isOpen, drawWheel]);

  // Update color from wheel coordinates
  const handleWheelCoord = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const radius = rect.width / 2;
    const x = clientX - rect.left - radius;
    const y = clientY - rect.top - radius;
    const dist = Math.sqrt(x * x + y * y);

    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    const s = Math.min(100, Math.round((dist / radius) * 100));

    setHue(Math.round(angle));
    setSat(s);
    const hex = rgbToHex(...hslToRgb(Math.round(angle), s, lightness));
    setHexInput(hex);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    handleWheelCoord(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      handleWheelCoord(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Direct Hex Input change
  const handleHexInputChange = (e) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('#')) val = '#' + val;
    setHexInput(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      const [h, s, l] = hexToHsl(val);
      setHue(h);
      setSat(s);
      setLightness(l);
    }
  };

  // Select preset
  const handleSelectPreset = (hex) => {
    setHexInput(hex.toUpperCase());
    const [h, s, l] = hexToHsl(hex);
    setHue(h);
    setSat(s);
    setLightness(l);
  };

  // Submit selected color
  const handleConfirm = () => {
    const finalHex = /^#[0-9A-F]{6}$/i.test(hexInput) ? hexInput : currentHex;
    onSelectColor(finalHex);
    onClose();
  };

  if (!isOpen) return null;

  // Calculate indicator thumb position on wheel (220x220 canvas)
  const wheelSize = 220;
  const radius = wheelSize / 2;
  const rad = (hue * Math.PI) / 180;
  const dist = (sat / 100) * radius;
  const thumbX = radius + dist * Math.cos(rad);
  const thumbY = radius + dist * Math.sin(rad);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col my-auto animate-in zoom-in-95 duration-200"
        onPointerUp={handlePointerUp}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900 leading-tight">
                Pilih Warna Custom (Color Wheel)
              </h3>
              <p className="text-[11px] text-neutral-400">
                Pilih warna bebas via roda warna atau ketik kode HEX
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            {/* Color Wheel Canvas */}
            <div className="flex flex-col items-center">
              <div
                className="relative rounded-full shadow-inner border-4 border-white ring-2 ring-neutral-200/80 cursor-crosshair select-none touch-none"
                style={{ width: wheelSize, height: wheelSize }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
              >
                <canvas
                  ref={canvasRef}
                  width={wheelSize}
                  height={wheelSize}
                  className="rounded-full w-full h-full block"
                />
                {/* Thumb Indicator */}
                <div
                  className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform"
                  style={{
                    left: `${thumbX}px`,
                    top: `${thumbY}px`,
                    backgroundColor: currentHex,
                  }}
                />
              </div>

              {/* Lightness / Kecerahan Slider */}
              <div className="w-full mt-3 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  <span>Gelap</span>
                  <span>Kecerahan: {lightness}%</span>
                  <span>Terang</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={lightness}
                  onChange={(e) => {
                    const l = Number(e.target.value);
                    setLightness(l);
                    setHexInput(rgbToHex(...hslToRgb(hue, sat, l)));
                  }}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>
            </div>

            {/* Right Side: Preview & HEX Code Input (Matching Gambar 2) */}
            <div className="w-full sm:w-48 space-y-4 flex flex-col justify-between">
              {/* Live Preview Box */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col items-center text-center space-y-2">
                <div
                  className="w-full h-16 rounded-xl border border-black/10 shadow-inner flex items-center justify-center transition-colors"
                  style={{ backgroundColor: currentHex }}
                >
                  <span
                    className="text-xs font-mono font-black px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs"
                  >
                    {currentHex}
                  </span>
                </div>
                <span className="text-xs font-bold text-neutral-800">
                  {getColorName(currentHex)}
                </span>
              </div>

              {/* HEX Code Input Box (Seperti di Gambar 2: #5FADA6) */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Kode HEX Warna:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={handleHexInputChange}
                    maxLength={7}
                    placeholder="#5FADA6"
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-sm font-black text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  {/* Native eyedropper / system picker */}
                  <button
                    type="button"
                    onClick={() => {
                      if (nativeInputRef.current) {
                        if (nativeInputRef.current.showPicker) {
                          nativeInputRef.current.showPicker();
                        } else {
                          nativeInputRef.current.click();
                        }
                      }
                    }}
                    className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors shrink-0"
                    title="Buka Color Picker Sistem / Eyedropper"
                  >
                    <Pipette className="w-4 h-4" />
                  </button>
                  <input
                    ref={nativeInputRef}
                    type="color"
                    value={currentHex}
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trending T-Shirt Color Palette */}
          <div>
            <span className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Warna Populer Kaos Distro:
            </span>
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
              {TRENDING_TSHIRT_PALETTE.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => handleSelectPreset(item.hex)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer ${
                    currentHex.toUpperCase() === item.hex.toUpperCase()
                      ? 'border-neutral-900 ring-2 ring-neutral-900 bg-neutral-50'
                      : 'border-neutral-200/80 hover:bg-neutral-50'
                  }`}
                  title={`${item.name} (${item.hex})`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shadow-2xs inline-block"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="text-[9px] font-semibold text-neutral-600 truncate max-w-[50px]">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Gunakan Warna Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
}
