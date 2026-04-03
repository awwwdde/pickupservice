import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../api/backend';
import { isPrerenderEnv } from '../utils/isPrerender'

import image1 from '../assets/img/image1.png';
import image2 from '../assets/img/image2.png';
import image3 from '../assets/img/image3.png';
import image4 from '../assets/img/images4.png';
import image5 from '../assets/img/image5.png';
import image6 from '../assets/img/image6.png';
import image7 from '../assets/img/image7.png';

interface Project {
  id: string;
  title: string;
  model: string;
  image: string;
}

const featuredProjects: Project[] = [
  { id: 'f1', title: 'Carbon Edition', model: 'Porsche 911 GT3 RS', image: image1 },
  { id: 'f2', title: 'Overland Beast', model: 'Mitsubishi Pajero Sport', image: image2 },
  { id: 'f3', title: 'Night Crawler', model: 'Toyota LC 300', image: image3 },
];

const otherProjects: Project[] = [
  { id: '1', title: 'Urban Stealth', model: 'Audi RS6', image: image4 },
  { id: '2', title: 'Desert Storm', model: 'Toyota Hilux', image: image5 },
  { id: '3', title: 'Race Ready', model: 'BMW M4 G82', image: image6 },
  { id: '4', title: 'Classic Restoration', model: 'Datsun 240Z', image: image7 },
];

const ProjectsPage: FC = () => {
  const isPrerender = isPrerenderEnv()
  const horizontalRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [xRange, setXRange] = useState(0);
  const [featured, setFeatured] = useState<Project[]>(featuredProjects);
  const [others, setOthers] = useState<Project[]>(otherProjects);

  useEffect(() => {
    if (isPrerender) return
    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.1, 
      smoothWheel: true,
    });

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [isPrerender]);

  useEffect(() => {
    if (isPrerender) return
    let cancelled = false;
    fetchProjects()
      .then((items) => {
        if (cancelled || !items.length) return;
        const mapped: Project[] = items.map((item) => ({
          id: String(item.id),
          title: item.title,
          model: item.vehicle || item.category || 'Проект',
          image: item.image
        }));
        setFeatured(mapped.slice(0, 3));
        setOthers(mapped.slice(3).length ? mapped.slice(3) : mapped);
      })
      .catch(() => {
        // Фолбэк оставляем из локальных данных.
      });
    return () => {
      cancelled = true;
    };
  }, [isPrerender]);

  useLayoutEffect(() => {
    if (isPrerender) return
    const calculateRange = () => {
      if (trackRef.current) {
        const totalWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const margin = viewportWidth * 0.1; 
        setXRange(totalWidth - viewportWidth + margin);
      }
    };

    calculateRange();
    window.addEventListener('resize', calculateRange);
    return () => window.removeEventListener('resize', calculateRange);
  }, [isPrerender]);

  const { scrollYProgress } = useScroll({
    target: horizontalRef,
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -xRange]);

  return (
    <main className="bg-[#020202] text-white antialiased selection:bg-white selection:text-black">
      
      {/* 1. HEADER С АНИМАЦИЕЙ КАК В КОНТАКТАХ */}
      <header className="w-[90%] mx-auto pt-40 pb-20 border-b border-white/10">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-[11vw] font-bold uppercase tracking-tighter leading-[0.75]">
            Наши <br />
            <span className="text-neutral-500 italic font-light tracking-tight">Проекты.</span>
          </h1>
        </motion.div>

        <p className="mt-8 max-w-2xl text-neutral-400 text-base leading-relaxed">
          Ремонт и тюнинг внедорожников: диагностика, усиление подвески, экспедиционная подготовка и модернизация 4x4 — по
          проектам ПикапСервис.
        </p>
      </header>

      {/* 2. ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ (БЕЗ ВХОДНЫХ АНИМАЦИЙ) */}
      <section ref={horizontalRef} className="relative md:h-[400vh]">
        {/* Desktop */}
        {/* ИСПРАВЛЕНИЕ: Заменили flex на md:flex, чтобы избежать конфликта с hidden на мобилках */}
        <div className="hidden md:flex md:sticky top-0 h-screen items-center overflow-hidden">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex h-[70vh] px-[5vw] gap-8"
          >
            {featured.map((project) => (
              <Link
                key={project.id}
                to={`/portfolio/${project.id}`}
                className="block relative flex-shrink-0 w-[80vw] md:w-[65vw] h-full overflow-hidden group"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                />
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 z-10">
                  <div className="relative flex justify-between items-end">
                    <div className="max-w-md">
                      <p className="font-mono text-[10px] uppercase tracking-widest mb-3 opacity-60">// Избранный кейс</p>
                      <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter leading-none">{project.title}</h2>
                    </div>
                    <div className="text-right hidden md:block">
                      <span className="font-mono text-xs uppercase border border-white/20 px-3 py-1 rounded-full">{project.model}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Mobile: swipe + snap */}
        <div className="md:hidden w-full overflow-x-auto snap-x snap-mandatory">
          <div className="flex gap-4 w-max px-[6%] py-14">
            {featured.map((project) => (
              <Link
                key={project.id}
                to={`/portfolio/${project.id}`}
                className="block snap-start relative flex-none w-[85vw] max-w-[420px] h-[56vh] overflow-hidden group"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover grayscale-[25%] group-hover:grayscale-0 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                  <div className="flex justify-between items-end">
                    <div className="max-w-[70%]">
                      <p className="font-mono text-[10px] uppercase tracking-widest mb-3 opacity-60">// Избранный кейс</p>
                      <h2 className="text-3xl font-bold uppercase tracking-tighter leading-none">{project.title}</h2>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs uppercase border border-white/20 px-3 py-1 rounded-full whitespace-nowrap">
                        {project.model}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. АСИММЕТРИЧНАЯ СЕТКА (БЕЗ ВХОДНЫХ АНИМАЦИЙ) */}
      <section className="w-[90%] mx-auto py-24 md:py-60">
        <div className="flex justify-between items-end mb-32 border-b border-white/10 pb-10">
          <h2 className="text-5xl font-bold uppercase tracking-tighter">Все проекты</h2>
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-30">/ Total: 07</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 md:gap-y-32 md:gap-x-20">
          {others.map((project, index) => (
            <div
              key={project.id}
              className={`relative aspect-[4/5] group overflow-hidden ${index % 2 !== 0 ? 'md:mt-48' : ''}`}
            >
              <Link to={`/portfolio/${project.id}`} className="block w-full h-full relative">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out" 
                />
                <div className="absolute bottom-0 left-0 w-full p-8 bg-black/40 backdrop-blur-md border-t border-white/10">
                  <div className="flex flex-col">
                    <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:italic transition-all duration-300">{project.title}</h3>
                    <div className="flex justify-between items-center mt-4">
                       <p className="font-mono text-[10px] opacity-60 uppercase">{project.model}</p>
                       <span className="text-xs group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProjectsPage;