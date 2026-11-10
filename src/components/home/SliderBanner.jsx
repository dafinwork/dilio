import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BANNER_STORAGE_KEY = 'kaos_dilio_banner_slides';

export const DEFAULT_BANNER_SLIDES = [
  {
    id: 'banner-nsa-1',
    image: `${import.meta.env.BASE_URL}banner-hero-1.jpg`,
    title: 'New States Apparel - Live Your Life in Color',
    subtitle: 'Choose your color with our range of essential styles',
    link: '',
    isActive: true,
  },
  {
    id: 'banner-dilio-2',
    image: `${import.meta.env.BASE_URL}hero-banner.png`,
    title: 'Koleksi Kaos Polos & Sablon Premium',
    subtitle: 'Bahan Cotton Combed 24s/30s & Heavyweight 16s Terlengkap',
    link: '',
    isActive: true,
  },
];

export function getStoredBannerSlides() {
  try {
    const saved = localStorage.getItem(BANNER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_BANNER_SLIDES;
}

export default function SliderBanner() {
  const [slides, setSlides] = useState(() => getStoredBannerSlides());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  // Listen to storage events so changes in Admin update the banner live
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === BANNER_STORAGE_KEY || !e.key) {
        setSlides(getStoredBannerSlides());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('kaos_dilio_banner_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('kaos_dilio_banner_updated', handleStorageChange);
    };
  }, []);

  const activeSlides = slides.filter((s) => s.isActive !== false);
  const totalSlides = activeSlides.length;

  // Auto-play timer (every 5s)
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides, isPaused]);

  if (totalSlides === 0) return null;

  const safeIndex = currentIndex < totalSlides ? currentIndex : 0;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartRef.current = 0;
    touchEndRef.current = 0;
  };

  return (
    <section className="w-full overflow-hidden bg-neutral-950 border-b border-neutral-100">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-[16/7] sm:aspect-[21/8] md:aspect-[24/8] lg:aspect-[3.2/1] overflow-hidden group select-none bg-neutral-950"
      >
        {/* Banner Images Carousel */}
        {activeSlides.map((slide, idx) => {
          const isActive = idx === safeIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {slide.link ? (
                <a href={slide.link} className="block w-full h-full">
                  <img
                    src={slide.image}
                    alt={slide.title || `Banner ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </a>
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title || `Banner ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          );
        })}

        {/* Navigation Arrows (visible on hover or touch devices) */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Banner Sebelumnya"
              className="absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/80 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Banner Berikutnya"
              className="absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/80 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Dots / Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-xs">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Ke slide banner ${i + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === safeIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
