import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Crown, Shirt, Sparkles, MessageCircle, Menu, X } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      to: '/desain-eksklusif',
      label: 'Desain Eksklusif',
      icon: Crown,
      iconColor: 'text-amber-500',
    },
    {
      to: '/koleksi-kaos',
      label: 'Koleksi Kaos',
      icon: Shirt,
      iconColor: 'text-neutral-700',
    },
    {
      to: '/bikin-kaos-custom',
      label: 'Bikin Kaos Custom',
      icon: Sparkles,
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo on Left */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 hover:opacity-90 transition-opacity"
          >
            <span>Kaos Dilio</span>
          </Link>

          {/* Right-aligned Navigation Group (Menu + Konsultasi Admin) */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            <nav className="flex items-center gap-6 lg:gap-8">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2 text-sm font-semibold tracking-tight transition-colors py-2 ${
                        isActive
                          ? 'text-neutral-900'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className="w-4 h-4 text-neutral-800 transition-transform group-hover:scale-110" />
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Action: Konsultasi Admin (WhatsApp) */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-900 rounded-lg text-xs sm:text-sm font-bold text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-200 shadow-2xs hover:shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:text-white" />
              <span>Konsultasi Admin</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-emerald-600 hover:bg-neutral-50 rounded-lg"
              title="Konsultasi Admin"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-neutral-800" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-neutral-100">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-900 bg-neutral-900 text-white rounded-lg text-sm font-bold shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Konsultasi Admin (WhatsApp)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
