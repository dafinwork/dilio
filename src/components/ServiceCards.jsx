import { Shirt, Calendar, Briefcase, ArrowUpRight } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

export default function ServiceCards() {
  const services = [
    {
      title: 'Bikin Kaos Clothing Brand',
      desc: 'Mulai dari pemilihan kain custom, pola potong (cutting) khusus, hingga pemasangan label leher (woven/satin) dan hangtag untuk brand Anda.',
      icon: Shirt,
      whatsappMsg: 'Halo Admin Kaos Dilio, saya ingin konsultasi produksi untuk Clothing Brand.',
    },
    {
      title: 'Bikin Kaos Event & Komunitas',
      desc: 'Solusi tepat dan cepat untuk kaos panitia, peserta jalan sehat, family gathering, atau seragam komunitas dengan harga efisien.',
      icon: Calendar,
      whatsappMsg: 'Halo Admin Kaos Dilio, saya ingin konsultasi produksi kaos untuk Event / Komunitas.',
    },
    {
      title: 'Bikin Kaos Merchandise',
      desc: 'Tingkatkan branding perusahaan dengan seragam kantor (Polo Shirt, Kemeja PDH) dan merchandise promosi eksklusif berkualitas.',
      icon: Briefcase,
      whatsappMsg: 'Halo Admin Kaos Dilio, saya ingin konsultasi pemesanan Kaos Merchandise / Seragam Perusahaan.',
    },
  ];

  return (
    <section className="mt-16 sm:mt-24">
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-snug">
          Kami siap jadi partner untuk keperluan event hingga bisnis clothing Anda.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {services.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="relative bg-[#F9FAFB] border border-neutral-100/90 rounded-3xl p-7 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 group"
            >
              {/* Decorative Corner Accent */}
              <div
                className="absolute top-0 right-0 w-28 h-28 bg-[#FCE8DC]/70 rounded-bl-[100px] pointer-events-none transition-transform duration-500 group-hover:scale-110"
                aria-hidden="true"
              />

              {/* Header Icon */}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center border border-neutral-100">
                  <Icon className="w-6 h-6 text-[#FF5722]" />
                </div>

                <h3 className="mt-6 text-lg sm:text-xl font-extrabold text-neutral-900 leading-snug">
                  {item.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* WhatsApp Action */}
              <div className="relative z-10 mt-6 pt-4 border-t border-neutral-200/50">
                <a
                  href={`https://wa.me/628990809822?text=${encodeURIComponent(item.whatsappMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 hover:text-[#FF5722] transition-colors"
                >
                  <span>Konsultasi Jasa Ini</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
