import { useEffect } from 'react';
import { X, Ruler, Info } from 'lucide-react';

export const SIZE_CHARTS_STORAGE_KEY = 'kaos_dilio_size_charts';

export const DEFAULT_SIZE_CHARTS = {
  regular: {
    name: 'Regular Fit / Kasual',
    description: 'Potongan standar fitting reguler yang pas dan nyaman dipakai harian.',
    headers: ['Ukuran', 'Lebar Dada (A)', 'Panjang Badan (B)', 'Panjang Lengan (C)'],
    rows: [
      { size: 'S', chest: '47 cm', length: '67 cm', sleeve: '20 cm' },
      { size: 'M', chest: '50 cm', length: '70 cm', sleeve: '21 cm' },
      { size: 'L', chest: '53 cm', length: '73 cm', sleeve: '22 cm' },
      { size: 'XL', chest: '56 cm', length: '75 cm', sleeve: '23 cm' },
      { size: 'XXL', chest: '59 cm', length: '77 cm', sleeve: '24 cm' },
      { size: '3XL', chest: '62 cm', length: '79 cm', sleeve: '25 cm' },
    ],
  },
  oversized: {
    name: 'Oversized Fit',
    description: 'Potongan longgar modern dengan drop-shoulder khas streetwear aesthetic.',
    headers: ['Ukuran', 'Lebar Dada (A)', 'Panjang Badan (B)', 'Panjang Lengan (C)'],
    rows: [
      { size: 'S', chest: '53 cm', length: '70 cm', sleeve: '23 cm' },
      { size: 'M', chest: '56 cm', length: '73 cm', sleeve: '24 cm' },
      { size: 'L', chest: '59 cm', length: '75 cm', sleeve: '25 cm' },
      { size: 'XL', chest: '62 cm', length: '77 cm', sleeve: '26 cm' },
      { size: 'XXL', chest: '65 cm', length: '79 cm', sleeve: '27 cm' },
    ],
  },
  boxy: {
    name: 'Boxy Cut',
    description: 'Potongan mengotak agak crop dengan silhouette lebar dan leher rib kokoh.',
    headers: ['Ukuran', 'Lebar Dada (A)', 'Panjang Badan (B)', 'Panjang Lengan (C)'],
    rows: [
      { size: 'S', chest: '55 cm', length: '65 cm', sleeve: '22 cm' },
      { size: 'M', chest: '58 cm', length: '68 cm', sleeve: '23 cm' },
      { size: 'L', chest: '61 cm', length: '70 cm', sleeve: '24 cm' },
      { size: 'XL', chest: '64 cm', length: '72 cm', sleeve: '25 cm' },
      { size: 'XXL', chest: '67 cm', length: '74 cm', sleeve: '26 cm' },
    ],
  },
  fitted: {
    name: 'Fitted / Slim Fit',
    description: 'Potongan pas badan (slim fit) yang membingkai siluet tubuh dengan rapi dan atletis.',
    headers: ['Ukuran', 'Lebar Dada (A)', 'Panjang Badan (B)', 'Panjang Lengan (C)'],
    rows: [
      { size: 'S', chest: '45 cm', length: '66 cm', sleeve: '19 cm' },
      { size: 'M', chest: '48 cm', length: '69 cm', sleeve: '20 cm' },
      { size: 'L', chest: '51 cm', length: '72 cm', sleeve: '21 cm' },
      { size: 'XL', chest: '54 cm', length: '74 cm', sleeve: '22 cm' },
      { size: 'XXL', chest: '57 cm', length: '76 cm', sleeve: '23 cm' },
    ],
  },
  polo: {
    name: 'Kaos Polo (Wangki)',
    description: 'Kaos berkerah rapi dengan kancing depan, cocok untuk gaya semi-formal & kasual.',
    headers: ['Ukuran', 'Lebar Dada (A)', 'Panjang Badan (B)', 'Panjang Lengan (C)'],
    rows: [
      { size: 'S', chest: '48 cm', length: '68 cm', sleeve: '21 cm' },
      { size: 'M', chest: '51 cm', length: '71 cm', sleeve: '22 cm' },
      { size: 'L', chest: '54 cm', length: '73 cm', sleeve: '23 cm' },
      { size: 'XL', chest: '57 cm', length: '75 cm', sleeve: '24 cm' },
      { size: 'XXL', chest: '60 cm', length: '77 cm', sleeve: '25 cm' },
    ],
  },
  olahraga: {
    name: 'Kaos Olahraga / Sport',
    description: 'Material dry-fit aerodinamis elastis untuk aktivitas fisik, gym & lari.',
    headers: ['Ukuran', 'Lebar Dada (A)', 'Panjang Badan (B)', 'Panjang Lengan (C)'],
    rows: [
      { size: 'S', chest: '46 cm', length: '66 cm', sleeve: '19 cm' },
      { size: 'M', chest: '49 cm', length: '69 cm', sleeve: '20 cm' },
      { size: 'L', chest: '52 cm', length: '72 cm', sleeve: '21 cm' },
      { size: 'XL', chest: '55 cm', length: '74 cm', sleeve: '22 cm' },
      { size: 'XXL', chest: '58 cm', length: '76 cm', sleeve: '23 cm' },
    ],
  },
  'long-sleeve': {
    name: 'Long Sleeve (Lengan Panjang)',
    description: 'Kaos lengan panjang dengan manset/rib nyaman pada pergelangan tangan.',
    headers: ['Ukuran', 'Lebar Dada (A)', 'Panjang Badan (B)', 'Panjang Lengan (C)'],
    rows: [
      { size: 'S', chest: '47 cm', length: '68 cm', sleeve: '58 cm' },
      { size: 'M', chest: '50 cm', length: '71 cm', sleeve: '60 cm' },
      { size: 'L', chest: '53 cm', length: '74 cm', sleeve: '62 cm' },
      { size: 'XL', chest: '56 cm', length: '76 cm', sleeve: '64 cm' },
      { size: 'XXL', chest: '59 cm', length: '78 cm', sleeve: '66 cm' },
    ],
  },
};

export function getStoredSizeCharts() {
  try {
    const saved = localStorage.getItem(SIZE_CHARTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const merged = { ...DEFAULT_SIZE_CHARTS };
        for (const [k, val] of Object.entries(parsed)) {
          if (val && Array.isArray(val.rows)) {
            merged[k] = {
              ...(DEFAULT_SIZE_CHARTS[k] || {
                name: k.toUpperCase(),
                description: 'Spesifikasi ukuran kaos.',
                headers: ['Ukuran', 'Lebar Dada (A)', 'Panjang Badan (B)', 'Panjang Lengan (C)'],
              }),
              ...val,
            };
          }
        }
        return merged;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_SIZE_CHARTS;
}

export default function SizeChartModal({
  isOpen,
  onClose,
  defaultType = 'regular',
  customChart = null,
  productName = '',
}) {
  const hasCustomProductChart = Array.isArray(customChart) && customChart.length > 0;
  const chartsMap = getStoredSizeCharts();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fallbackChart = (defaultType && chartsMap[defaultType]) || chartsMap.regular;

  const currentChart = hasCustomProductChart
    ? {
        name: productName || fallbackChart.name,
        description: `Spesifikasi ukuran khusus untuk ${productName || 'produk ini'}.`,
        headers: ['Ukuran', 'Lebar Dada (A)', 'Panjang Badan (B)', 'Panjang Lengan (C)'],
        rows: customChart,
      }
    : {
        ...fallbackChart,
        name: productName || fallbackChart.name,
      };

  const formatDim = (val) => {
    if (!val) return '-';
    const s = String(val).trim();
    return /\bcm\b/i.test(s) ? s : `${s} cm`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                Panduan Size Chart Kaos
              </h3>
              <p className="text-xs text-neutral-500">
                {productName ? `Spesifikasi ukuran untuk ${productName}` : 'Spesifikasi ukuran detail produk ini'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Product Size Info Header */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 text-xs text-neutral-600">
            <span className="font-bold text-neutral-900 block mb-0.5">{currentChart.name}</span>
            <p>{currentChart.description}</p>
          </div>

          {/* Single Size Chart Table for this Product */}
          <div className="overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-100 text-neutral-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  {currentChart.headers.map((h, idx) => (
                    <th key={idx} className="py-3 px-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {currentChart.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-black text-neutral-900">{row.size}</td>
                    <td className="py-2.5 px-4 text-neutral-700 font-medium">{formatDim(row.chest)}</td>
                    <td className="py-2.5 px-4 text-neutral-700 font-medium">{formatDim(row.length)}</td>
                    <td className="py-2.5 px-4 text-neutral-700 font-medium">{formatDim(row.sleeve)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to Measure visual guide */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2 text-xs text-neutral-700">
            <div className="flex items-center gap-2 font-bold text-neutral-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Panduan Cara Mengukur:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>
                <strong>Lebar Dada (A):</strong> Diukur mendatar dari bawah ketiak kiri ke ketiak kanan.
              </li>
              <li>
                <strong>Panjang Badan (B):</strong> Diukur dari titik tertinggi bahu lurus ke bawah ujung kaos.
              </li>
              <li>
                <strong>Panjang Lengan (C):</strong> Diukur dari ujung jahitan bahu hingga ujung manset lengan.
              </li>
              <li className="text-amber-900 font-semibold">
                *Toleransi jahitan konveksi normal berkisar +/- 1 s/d 2 cm.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
