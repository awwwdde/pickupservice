import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  model: string;
  image: string;
}

const featuredProjects: Project[] = [
  { id: 'f1', title: 'Carbon Edition', model: 'Porsche 911 GT3 RS', image: 'https://images.unsplash.com/photo-1503376760367-1b61b4d08ce1?q=80&w=1600' },
  { id: 'f2', title: 'Overland Beast', model: 'Mitsubishi Pajero Sport', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600' },
  { id: 'f3', title: 'Night Crawler', model: 'Toyota LC 300', image: 'https://images.unsplash.com/photo-1598551292182-48a52e391b1f?q=80&w=1600' },
];

const otherProjects: Project[] = [
  { id: '1', title: 'Urban Stealth', model: 'Audi RS6', image: 'https://images.unsplash.com/photo-1606148281133-3119f868212e?q=80&w=1000' },
  { id: '2', title: 'Desert Storm', model: 'Toyota Hilux', image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=1000' },
  { id: '3', title: 'Race Ready', model: 'BMW M4 G82', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000' },
  { id: '4', title: 'Classic Restoration', model: 'Datsun 240Z', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000' },
];

const ProjectsPage: FC = () => {
  const horizontalRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [xRange, setXRange] = useState(0);

  // Инициализация Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.2, 
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useLayoutEffect(() => {
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
  }, []);

  const { scrollYProgress } = useScroll({
    target: horizontalRef,
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -xRange]);

  return (
    <main className="bg-[#0a0a0a] text-white antialiased">
      {/* Header */}
      <header className="w-[90%] mx-auto pt-40 pb-20">
        <h1 className="text-[11vw] font-bold uppercase tracking-tighter leading-[0.75]">
          Наши<br />
          <span className="text-neutral-600 italic">Проекты</span>
        </h1>
      </header>

      {/* СЕКЦИЯ 1: ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ (PINNED) */}
      <section ref={horizontalRef} className="relative h-[400vh]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div 
            ref={trackRef}
            style={{ x }} 
            className="flex h-[70vh] px-[5vw] gap-8"
          >
            {featuredProjects.map((project) => (
              <Link 
                key={project.id} 
                to={`/portfolio/${project.id}`}
                className="relative flex-shrink-0 w-[80vw] md:w-[65vw] h-full overflow-hidden"
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover grayscale-[0.3]" 
                />
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent backdrop-blur-[4px] mask-gradient" />
                   <div className="relative z-10 flex justify-between items-end">
                      <div className="max-w-md">
                        <p className="font-mono text-[10px] uppercase tracking-widest mb-3 opacity-60">Избранные проекты</p>
                        <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter leading-none">{project.title}</h2>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs uppercase border border-white/20 px-3 py-1 rounded-full">{project.model}</span>
                      </div>
                   </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* СЕКЦИЯ 2: АСИММЕТРИЧНАЯ СЕТКА */}
      <section className="w-[90%] mx-auto py-60">
        <div className="flex justify-between items-end mb-32 border-b border-white/10 pb-10">
          <h2 className="text-5xl font-bold uppercase tracking-tighter">Все проекты</h2>
          <span className="font-mono text-sm opacity-40">/ Всего 12 проектов</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-32 md:gap-x-20">
          {otherProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative aspect-[4/5] ${index % 2 !== 0 ? 'md:mt-48' : ''}`}
            >
              <Link to={`/portfolio/${project.id}`} className="block w-full h-full relative">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                />
                <div className="absolute bottom-0 left-0 w-full p-8 bg-black/20 backdrop-blur-xl">
                  <div className="flex flex-col">
                    <h3 className="text-2xl font-bold uppercase tracking-tight">{project.title}</h3>
                    <div className="flex justify-between items-center mt-4">
                       <p className="font-mono text-[10px] opacity-60 uppercase">{project.model}</p>
                       <span className="text-xs">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProjectsPage;