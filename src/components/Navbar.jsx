import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo on Left */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-tight text-neutral-900 hover:opacity-90 transition-opacity"
          >
            <span>Kaos Dilio</span>
          </Link>

          {/* Right Action: Konsultasi Admin (WhatsApp) - Matching Mockup */}
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 border border-neutral-300 rounded-full text-xs sm:text-sm font-bold text-neutral-800 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-200 shadow-2xs cursor-pointer group"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:text-emerald-400 transition-colors" />
            <span>Konsultasi Admin</span>
          </a>
        </div>
      </div>
    </header>
  );
}
