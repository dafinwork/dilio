import { MapPin, Phone } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

export default function Footer() {
  return (
    <footer className="bg-[#18191A] text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-neutral-800/80">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <span className="inline-block text-2xl font-black text-white tracking-tight">
              Kaos Dilio
            </span>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              Destinasi kaos polos dan layanan sablon untuk outfit harian, event, komunitas, merchandise hingga bisnis clothing.
            </p>
          </div>

          {/* Column 2: KOLEKSI */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              KOLEKSI
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400">
              <li>Kaos Oversized</li>
              <li>Kaos Reguler Fit</li>
              <li>Kaos Boxy Cut</li>
              <li>Kaos Fitted</li>
            </ul>
          </div>

          {/* Column 3: LAYANAN */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              LAYANAN
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400">
              <li>Sablon Satuan &amp; Grosir</li>
              <li>Bikin Clothing Brand</li>
              <li>Bikin Kaos Event &amp; Komunitas</li>
              <li>Bikin Merchandise</li>
            </ul>
          </div>

          {/* Column 4: HUBUNGI KAMI */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              HUBUNGI KAMI
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span>Studio Dilio, Jakarta Barat</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-medium"
                >
                  0899-0809-822
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Kaos Dilio - Kaos Polos Custom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
