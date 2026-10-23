import React, { useRef, useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    username: '2***K',
    rating: 5,
    text: 'Sablon bagus bgttt, outlinenya ga begitu keliatan, warnanya juga ga turun huhu bagus bgt. Adminnya juga fast respond dan ramah',
    photo: `${import.meta.env.BASE_URL}reviews/review-1.jpg`,
    alt: 'Review Sablon Kaos Dilio 1',
  },
  {
    id: 2,
    username: 'prelovednya_ai',
    rating: 5,
    text: 'Pertama kali sablon DTG ternyata hasilnya sebagus ituuuu woooyyy. Puas banget sama hasilnya. Adminnya juga baik banget dan solutif bgt bantu pemilihan warnanya.',
    photo: `${import.meta.env.BASE_URL}reviews/review-2.jpg`,
    alt: 'Review Sablon Kaos Dilio 2',
  },
  {
    id: 3,
    username: 'ratucumi',
    rating: 5,
    text: 'Seperti biasa adminnya selalu komunikatif dan solutif saat diskusi desain. Ternyata untuk kualitas hasil sablonnya juga bagus, sesuai ekspektasi!',
    photo: `${import.meta.env.BASE_URL}reviews/review-3.jpg`,
    alt: 'Review Sablon Kaos Dilio 3',
  },
  {
    id: 4,
    username: 'bintang_satria',
    rating: 5,
    text: 'Pesen buat kaos gathering kantor 85 pcs, jadinya tepat waktu bahkan lebih cepat dari perkiraan. Bahan 24s nya tebel dan sablon rapi banget!',
    photo: `${import.meta.env.BASE_URL}pricing/pricing-grup.jpg`,
    alt: 'Review Kaos Gathering Kantor',
  },
  {
    id: 5,
    username: 'dimas_apparel',
    rating: 5,
    text: 'Udah langganan bikin merchandise clothing di Kaos Dilio. Cutting boxy fit nya pas bgt sama tren streetwear sekarang. Kualitas jahitannya premium. Recommended!',
    photo: `${import.meta.env.BASE_URL}pricing/pricing-satuan.jpg`,
    alt: 'Review Kaos Merchandise Brand',
  },
];

export default function CustomerReviewsSection() {
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    const current = el.scrollLeft;
    setScrollProgress(Math.min(100, Math.max(0, (current / maxScroll) * 100)));
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollBy = (offset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Top Title */}
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-8 sm:mb-12">
          Baca review tentang kami
        </h2>

        {/* 2-Column Layout matching Image 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Quote Icon & Highlight Heading */}
          <div className="lg:col-span-4 space-y-4">
            {/* Big Stylized Quote Marks */}
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Quote className="w-6 h-6 rotate-180 fill-neutral-800 text-neutral-800" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
              Apa yang dikatakan customer tentang kami
            </h3>

            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Pengalaman real dari customer Kaos Dilio
            </p>
          </div>

          {/* Right Column: Reviews Carousel & Controls */}
          <div className="lg:col-span-8 space-y-5">
            {/* Horizontal scroll container */}
            <div
              ref={scrollContainerRef}
              className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth scrollbar-none snap-x"
            >
              {REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="w-[260px] sm:w-[280px] shrink-0 bg-neutral-50/90 hover:bg-neutral-50 border border-neutral-200/90 rounded-2xl p-4 flex flex-col justify-between snap-start shadow-2xs hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* User & Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {review.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-neutral-800 truncate">
                        {review.username}
                      </span>
                    </div>

                    {/* 5 Stars */}
                    <div className="flex items-center gap-0.5 mb-2.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    {/* Comment Text */}
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-4">
                      {review.text}
                    </p>
                  </div>

                  {/* Photo Attachment Thumbnail */}
                  <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between">
                    <img
                      src={review.photo}
                      alt={review.alt}
                      className="w-14 h-16 rounded-xl object-cover border border-neutral-200 shadow-2xs"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Verified Order
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Controls: Arrows & Progress Scroll Indicator */}
            <div className="flex items-center justify-between pt-2">
              {/* Scroll Track Bar */}
              <div className="w-48 sm:w-64 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 rounded-full transition-all duration-150"
                  style={{
                    width: '35%',
                    transform: `translateX(${scrollProgress * 1.8}%)`,
                  }}
                />
              </div>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollBy(-280)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Review Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(280)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Review Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
