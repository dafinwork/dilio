import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/helpers';

const PRICING_TIERS = [
  {
    id: 'satuan',
    title: 'Satuan mulai dari Rp. 43.000',
    image: `${import.meta.env.BASE_URL}pricing/pricing-satuan.jpg`,
    alt: 'Kaos Custom Satuan Dilio',
    features: [
      '1 pcs',
      "Bahan cotton combed 30's",
      'Sablon DTF full color',
      'Bisa revisi sebelum dicetak',
      'Cocok untuk kebutuhan pribadi, hadiah, atau kaos custom personal',
    ],
    waMessage:
      'Halo Admin Kaos Dilio, saya ingin order kaos custom satuan (mulai Rp 43.000). Mohon info selengkapnya.',
  },
  {
    id: 'grup',
    title: 'Grup mulai dari Rp. 37.000',
    image: `${import.meta.env.BASE_URL}pricing/pricing-grup.jpg`,
    alt: 'Kaos Custom Grup Komunitas Dilio',
    features: [
      '12 Pcs+',
      'Bahan cotton combed 30s',
      'Sablon DTF Full color',
      'Bisa revisi sebelum dicetak',
      'Pas untuk kaos kelas kecil, keluarga, komunitas, atau tim kerja',
    ],
    waMessage:
      'Halo Admin Kaos Dilio, saya ingin order kaos custom grup 12 pcs+ (mulai Rp 37.000). Mohon info selengkapnya.',
  },
  {
    id: 'partai',
    title: 'Jumlah besar mulai Rp. 30.000',
    image: `${import.meta.env.BASE_URL}pricing/pricing-partai.jpg`,
    alt: 'Kaos Custom Jumlah Besar Gathering Dilio',
    features: [
      '72 Pcs ++',
      'Bahan combed 30s',
      'Sablon DTF Full color',
      'Bisa revisi sebelum dicetak',
      'Ideal untuk kaos angkatan, seragam kantor, acara & gathering perusahaan',
    ],
    waMessage:
      'Halo Admin Kaos Dilio, saya ingin order kaos custom jumlah besar 72 pcs++ (mulai Rp 30.000). Mohon info selengkapnya.',
  },
];

export default function PricingTierSection() {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Estimasi harga beli banyak lebih hemat
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-500">
            Sudah termasuk Kaos dan sablon &amp; Harga bisa berbeda di setiap cabang
          </p>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Photo Banner with subtle carousel indicator */}
              <div className="relative w-full aspect-[16/10] bg-neutral-100 overflow-hidden">
                <img
                  src={tier.image}
                  alt={tier.alt}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Carousel arrow dots hints like Cititex */}
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-80">
                  <span className="w-5 h-5 rounded-full bg-black/30 backdrop-blur-xs text-white flex items-center justify-center text-[10px]">
                    ‹
                  </span>
                  <span className="w-5 h-5 rounded-full bg-black/30 backdrop-blur-xs text-white flex items-center justify-center text-[10px]">
                    ›
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 leading-snug">
                    {tier.title}
                  </h3>

                  {/* Feature bullet list */}
                  <ul className="mt-4 space-y-2.5 text-xs text-neutral-600">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-neutral-400 select-none">•</span>
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* WhatsApp Order Button */}
                <a
                  href={getWhatsAppUrl(tier.waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-[#10B981]" />
                  <span>Order Sekarang</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
