import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function HeroSlider({ navigate, formRef }) {
  return (
    <section className='rounded-2xl max-w-4xl w-full'>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: false }}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        className="w-full rounded-2xl"
        style={{ height: 'clamp(220px, 40vw, 420px' }}   // ✅ explicit height so both slides are equal
      >
        {/* ── Slide 1: Text CTA with rich gradient background ── */}
        <SwiperSlide>
          <div
            className="w-full h-full flex flex-col items-center justify-evenly gap-1 px-8 text-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #0ea5e9 100%)', // ✅ vivid blue gradient instead of plain black
            }}
            onClick={() => formRef.current.scrollIntoView({ behavior: "smooth" })}
          >
            {/* Decorative blurred circles for depth */}
            <div className="absolute w-64 h-64 bg-white opacity-5 rounded-full -top-10 -left-10 blur-3xl pointer-events-none" />
            <div className="absolute w-48 h-48 bg-yellow-400 opacity-10 rounded-full -bottom-8 -right-8 blur-2xl pointer-events-none" />

            <span className="text-yellow-400 font-semibold text-sm sm:text-base uppercase tracking-widest">
              🏆 Competition Open
            </span>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">
              Submit Your Photo / Video &<br className="hidden sm:block" /> Win Amazing Prizes!
            </h2>

            <p className="text-base sm:text-lg text-blue-100 max-w-xl leading-relaxed">
              Showcase your contributions to public health and earn recognition from thousands.
            </p>

            <button
              className="px-8 py-1 md:py-3 bg-yellow-400 text-blue-900 font-bold text-lg rounded-full shadow-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
              onClick={(e) => { e.stopPropagation(); navigate('/prizing') }}
            >
              View Prizes & Recognition →
            </button>
          </div>
        </SwiperSlide>

        {/* ── Slide 2: Image ── */}
        <SwiperSlide>
          <img
            src="https://res.cloudinary.com/djc8opvcg/image/upload/v1780636448/WhatsApp_Image_2026-06-04_at_6.17.58_PM_fc94et.jpg"
            alt="Hero Banner"
            className="w-full h-full object-cover rounded-2xl"
          />
        </SwiperSlide>
      </Swiper>
    </section>
  );
}

export default HeroSlider;