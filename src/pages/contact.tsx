import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';


const ContactPage: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyTrackRef = useRef<HTMLDivElement>(null); 
  const [mapKey] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.1,
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: stickyTrackRef,
    offset: ["start start", "end end"]
  });


  const mapY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const mapScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const hudOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <main ref={containerRef} className="bg-[#020202] text-white font-sans antialiased min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="w-[90%] mx-auto pt-40 pb-20 md:pb-32 border-b border-white/10 relative overflow-hidden">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <h1 className="text-[11vw] font-bold uppercase tracking-tighter leading-[0.85] mix-blend-difference">
            Найдите <br />
            <span className="text-neutral-500 italic font-light tracking-tight">нас.</span>
          </h1>
        </motion.div>
      </section>

      {/* 2. CONTACTS GRID */}
      <section className="w-[90%] mx-auto py-20 md:py-32 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-0 relative z-10">
          <div className="md:col-span-4 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 max-w-[280px] leading-relaxed">
                // Профессиональное обслуживание и тюнинг японских внедорожников. База PICKUPSERVICE — точка сборки экспедиционных проектов.
              </p>
            </motion.div>
            <div className="hidden md:block font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-700">
              [ Свобода. Мощь. Природа. ]
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col gap-20 md:pl-20">
            <div className="group border-b border-white/10 pb-10">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-neutral-600 mb-6">01. Почта</span>
              <a href="mailto:info@pickupservice.ru" className="relative inline-block text-4xl md:text-7xl font-bold uppercase tracking-tighter hover:italic transition-all duration-500">
                info@pickupservice.ru
              </a>
            </div>

            <div className="group border-b border-white/10 pb-10">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-neutral-600 mb-6">02. Телефон</span>
              <a href="tel:+79859234777" className="relative inline-block text-4xl md:text-7xl font-bold uppercase tracking-tighter hover:italic transition-all duration-500">
                +7 985 923 47 77
              </a>
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-6 pt-4">
              {['Telegram', 'MAX', 'ВКонтакте'].map((social) => (
                <a key={social} href="#" className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500 hover:text-white transition-colors relative overflow-hidden group">
                  <span className="inline-block transition-transform duration-500 group-hover:-translate-y-full">{social}</span>
                  <span className="absolute top-0 left-0 inline-block transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-white underline underline-offset-4">{social}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: простая карта без HUD */}
        <div className="md:hidden w-full px-[6%] py-20">
          <div className="mb-8">
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600 block mb-2">Где мы находимся</span>
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Координаты</h2>
          </div>

          <div className="relative w-full h-[52vh] bg-[#050505] border border-white/5 overflow-hidden">
            <iframe
              key={mapKey}
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.371342371511!2d37.534411316046484!3d55.75581448055152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54bd6ed0f2c73%3A0x69687e1f40d86161!2z0JrRg9GC0YPQt9C-0LLRgdC60LjQuSDQv9GALdGCLiwgMzYsIE1vc2t2YSwgMTIxMTcw!5e0!3m2!1sru!2sru!4v1650000000000!5m2!1sru!2sru"
              className="w-full h-full border-none opacity-90 pointer-events-auto"
              allowFullScreen
              loading="lazy"
            />
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(2,2,2,1)] pointer-events-none" />
          </div>

          <div className="mt-6 font-mono text-[10px] text-white/50 tracking-[0.3em] uppercase">
            55.7558° N, 37.5366° E
          </div>
        </div>
      </section>
      <section ref={stickyTrackRef} className="relative md:h-[180vh] w-full">
        <div className="hidden md:flex sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
          <div className="w-[90%] mx-auto flex justify-between items-end mb-8 relative z-30">
            <motion.div style={{ opacity: hudOpacity }}>
               <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600 block mb-2">Где мы находимся</span>
               <h2 className="text-4xl font-bold uppercase tracking-tighter">Координаты</h2>
            </motion.div>
          </div>
          <div className="relative w-[90%] mx-auto h-[65vh] md:h-[70vh] bg-[#050505] border border-white/5 cursor-crosshair overflow-hidden">
            <motion.div 
              style={{ y: mapY, scale: mapScale }}
              className="absolute inset-[-15%] w-[130%] h-[130%] grayscale invert contrast-[1.4] brightness-[0.35] z-10"
            >
            <iframe
              key={mapKey}
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.371342371511!2d37.534411316046484!3d55.75581448055152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54bd6ed0f2c73%3A0x69687e1f40d86161!2z0JrRg9GC0YPQt9C-0LLRgdC60LjQuSDQv9GALdGCLiwgMzYsIE1vc2t2YSwgMTIxMTcw!5e0!3m2!1sru!2sru!4v1650000000000!5m2!1sru!2sru"
              className="w-full h-full border-none opacity-80 pointer-events-auto"
              allowFullScreen
              loading="lazy"
            />
            </motion.div>

            <motion.div 
              style={{ opacity: hudOpacity }}
              className="absolute inset-0 pointer-events-none p-6 md:p-10 flex flex-col justify-between z-20"
            >
              <div className="flex justify-between items-start">
                 <div className="w-12 h-12 border-t border-l border-white/30" />
                 <div className="text-right">
                   <div className="w-12 h-12 border-t border-r border-white/30 mb-4 ml-auto" />
                   <div className="font-mono text-[9px] text-white/40 tracking-[0.3em] animate-pulse">LOCK_MODE: ENABLED</div>
                 </div>
              </div>

              {/* Статичный прицел */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                 <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center relative">
                    <div className="w-[1px] h-40 bg-gradient-to-b from-transparent via-white/20 to-transparent absolute"></div>
                    <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent absolute"></div>
                    <div className="w-3 h-3 bg-white rounded-full z-10 shadow-[0_0_20px_white]"></div>
                    <div className="absolute inset-0 border border-white/40 rounded-full animate-ping"></div>
                 </div>
              </div>

              <div className="flex justify-between items-end">
                 <div>
                   <div className="w-12 h-12 border-b border-l border-white/30 mb-4" />
                   <span className="font-mono text-[9px] text-white/40 tracking-[0.3em] block">55.7558° N, 37.5366° E</span>
                 </div>
                 <div className="w-12 h-12 border-b border-r border-white/30" />
              </div>
            </motion.div>
            
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(2,2,2,1)] pointer-events-none" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;