import { Link } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

export default function Footer() {
  return (
    <footer className="bg-[#18191A] text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-neutral-800/80">
          {/* Column 1: Brand Info & Social */}
          <div className="space-y-4">
            <Link to="/" className="inline-block text-2xl font-black text-white tracking-tight">
              Kaos Dilio
            </Link>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              Destinasi kaos polos dan layanan sablon untuk outfit harian, event, komunitas, merchandise hingga bisnis clothing.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                aria-label="Instagram Kaos Dilio"
              >
                <svg className="w-4 h-4 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* TikTok SVG */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                aria-label="TikTok Kaos Dilio"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 9.79 5.34V13.3a8.27 8.27 0 0 0 6.66 3.19v-3.45a4.85 4.85 0 0 1-3.45-1.42 4.8 4.8 0 0 1-1.39-3.4v-.03h4.84v-1.5z" />
                </svg>
              </a>

              {/* WhatsApp SVG */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-emerald-600 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                aria-label="WhatsApp Admin"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.176 8.176 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.41 0-2.79-.37-4.01-1.07l-.29-.17-3.11.82.83-3.03-.19-.31a8.188 8.188 0 0 1-1.26-4.45c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.59c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: KOLEKSI */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              KOLEKSI
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/koleksi-kaos?cutting=oversized"
                  className="hover:text-white transition-colors"
                >
                  Kaos Oversized
                </Link>
              </li>
              <li>
                <Link
                  to="/koleksi-kaos?cutting=reguler"
                  className="hover:text-white transition-colors"
                >
                  Kaos Reguler Fit
                </Link>
              </li>
              <li>
                <Link
                  to="/koleksi-kaos?cutting=boxy"
                  className="hover:text-white transition-colors"
                >
                  Kaos Boxy Cut
                </Link>
              </li>
              <li>
                <Link
                  to="/koleksi-kaos?cutting=long-sleeve"
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
                <Link to="/bikin-kaos-custom" className="hover:text-white transition-colors">
                  Sablon Satuan & Grosir
                </Link>
              </li>
              <li>
                <Link to="/bikin-kaos-custom" className="hover:text-white transition-colors">
                  Bikin Clothing Brand
                </Link>
              </li>
              <li>
                <Link to="/bikin-kaos-custom" className="hover:text-white transition-colors">
                  Bikin Kaos Event & Komunitas
                </Link>
              </li>
              <li>
                <Link to="/bikin-kaos-custom" className="hover:text-white transition-colors">
                  Bikin Merchandise
                </Link>
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
          <p>© {new Date().getFullYear()} Kaos Dilio - Kaos Polos Custom. All rights reserved.</p>
          <div className="flex items-center gap-4 text-neutral-500">
            <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1">
              <span>🔐 CMS Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
