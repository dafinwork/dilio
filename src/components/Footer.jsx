import { Link } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

export default function Footer() {
  return (
    <footer className="bg-[#18191A] text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-neutral-800/80">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block text-2xl font-black text-white tracking-tight">
              Kaos Dilio
            </Link>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              Destinasi kaos polos dan layanan sablon untuk outfit harian, event, komunitas, merchandise hingga bisnis clothing.
            </p>
          </div>

          {/* Column 2: KOLEKSI */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              KOLEKSI
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/?cutting=oversized"
                  className="hover:text-white transition-colors"
                >
                  Kaos Oversized
                </Link>
              </li>
              <li>
                <Link
                  to="/?cutting=reguler"
                  className="hover:text-white transition-colors"
                >
                  Kaos Reguler Fit
                </Link>
              </li>
              <li>
                <Link
                  to="/?cutting=boxy"
                  className="hover:text-white transition-colors"
                >
                  Kaos Boxy Cut
                </Link>
              </li>
              <li>
                <Link
                  to="/?cutting=long-sleeve"
                  className="hover:text-white transition-colors"
                >
                  Kaos Long Sleeve
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: LAYANAN */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              LAYANAN
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href={getWhatsAppUrl('Halo admin Kaos Dilio, saya ingin konsultasi Sablon Satuan & Grosir')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Sablon Satuan &amp; Grosir
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppUrl('Halo admin Kaos Dilio, saya ingin konsultasi Bikin Clothing Brand')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Bikin Clothing Brand
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppUrl('Halo admin Kaos Dilio, saya ingin konsultasi Bikin Kaos Event & Komunitas')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Bikin Kaos Event &amp; Komunitas
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppUrl('Halo admin Kaos Dilio, saya ingin konsultasi Bikin Merchandise')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Bikin Merchandise
                </a>
              </li>
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
                  href="tel:08990809822"
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
          <p>
            © {new Date().getFullYear()} Kaos Dilio - Kaos Polos Custom. All rights reserved
            <Link
              to="/admin"
              className="text-neutral-500 hover:text-neutral-400 cursor-default select-none transition-colors"
              title=""
            >
              .
            </Link>
          </p>
          <div className="text-neutral-500 text-[11px]">
            <span>Solusi Kaos Polos &amp; Sablon Terpercaya</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
