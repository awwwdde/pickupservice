import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Mouse, Plus } from 'lucide-react'
import herovid from '../assets/vid/hero.webm'

const words = ['СОЗДАЕМ', 'РЕМОНТИРУЕМ', 'ОБСЛУЖИВАЕМ']

// Глобальная переменная для отслеживания проигрывания видео в рамках сессии
let isHeroVideoPlayed = false;

const projectsData = [
  {
    id: 0,
    title: 'Наши Проекты',
    description: 'Бескомпромиссный подход к делу. Изучите наше портфолио по подготовке и ремонту японских внедорожников.',
    type: 'info',
    image: null
  },
  { id: 1, image: 'https://images.unsplash.com/photo-1629897048514-3dd74142d179?q=80&w=800' },
  { id: 2, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800' },
  { id: 3, image: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?q=80&w=800' },
  { id: 4, image: 'https://images.unsplash.com/photo-1506015391300-4152148407ce?q=80&w=800' }
]

const MainPage: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const parallaxRef = useRef<HTMLDivElement | null>(null)

  const [isVideoReady, setIsVideoReady] = useState(false)
  const [showContent, setShowContent] = useState(isHeroVideoPlayed)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 35,
    restDelta: 0.001
  })

  const textY = useTransform(smoothProgress, [0, 0.35], [80, 0])
  const textOpacity = useTransform(smoothProgress, [0.05, 0.2, 0.8, 0.95], [0, 1, 1, 0])
  const firstBlockY = useTransform(smoothProgress, [0, 1], [400, -400])
  const secondBlockY = useTransform(smoothProgress, [0, 1], [500, -500])
  
  const firstBlockOpacity = useTransform(smoothProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])
  const secondBlockOpacity = useTransform(smoothProgress, [0.3, 0.5, 0.6, 0.8], [0, 1, 1, 0])

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.loop = false;

    if (!isHeroVideoPlayed) {
      document.body.style.overflow = 'hidden';
      video.play().catch(console.error);
    } else {
      document.body.style.overflow = '';
      setShowContent(true);
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (isHeroVideoPlayed) {
      e.currentTarget.currentTime = e.currentTarget.duration || 9999;
    }
  }

  const handleVideoEnd = () => {
    isHeroVideoPlayed = true;
    setShowContent(true);
    document.body.style.overflow = '';
    window.dispatchEvent(new Event('hero-ready'));
  }

  useEffect(() => {
    if (!showContent) return
    const id = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, 2600)
    return () => clearInterval(id)
  }, [showContent])

  return (
    <div className="bg-black text-white selection:bg-[#FF8201]">
      <section className="relative h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={herovid}
          muted
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={() => setIsVideoReady(true)}
          onEnded={handleVideoEnd}
          className={`absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-1000 ${
            showContent ? 'opacity-60' : 'opacity-100'
          }`}
        />
        
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
          <AnimatePresence>
            {showContent && (
              <motion.div
                className="relative flex w-full items-center justify-between px-[35px] text-[64px] font-semibold tracking-tighter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <motion.span
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    МЫ
                  </motion.span>
                  <span className="inline-flex h-[1.1em] items-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentWordIndex}
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                        className="text-white"
                      >
                        {words[currentWordIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </div>
                <div className="overflow-hidden">
                  <motion.span
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  >
                    ВНЕДОРОЖНИКИ
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex justify-center">
          <motion.div
            className="glass-header flex items-center gap-2 px-5 py-2.5 text-[14px] border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mouse className="h-4 w-4" />
            </motion.span>
            <span className="opacity-80 uppercase tracking-widest text-[10px]">прокрутите вниз</span>
          </motion.div>
        </div>
      </section>
      <section
        ref={parallaxRef}
        className="relative h-[400vh] w-full bg-[#f3f3f1]"
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-10 text-black">
          <motion.div
            style={{ y: textY, opacity: textOpacity }}
            className="relative z-5 w-full max-w-[1200px] text-center text-[96px] font-medium italic tracking-tighter leading-[0.9]"
          >
            <span>Собираем и обслуживаем </span>
            <span className="text-[#FF8201]">японские </span>
            <span>внедорожники</span>
          </motion.div>
          <motion.div
            style={{ y: firstBlockY, opacity: firstBlockOpacity }}
            className="absolute z-10 left-[10%] top-1/2 -translate-y-1/2 glass-header px-8 py-5 text-[20px] text-[#FF8201] shadow-xl"
          >
            ПИКАПСЕРВИС
          </motion.div>
          <motion.div
            style={{ y: secondBlockY, opacity: secondBlockOpacity }}
            className="absolute z-10 right-[10%] top-1/2 -translate-y-1/2 glass-header max-w-[400px] px-10 py-10 text-[18px] shadow-xl leading-relaxed"
          >
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
          </motion.div>
        </div>
      </section>
      <section className="w-full bg-[#f3f3f1] py-32 overflow-hidden">
        <div className="flex items-start justify-center gap-4 h-[510px] px-[5%]">
          {projectsData.map((project, index) => {
            const isActive = activeProjectIndex === index;

            return (
              <motion.div
                key={project.id}
                onMouseEnter={() => setActiveProjectIndex(index)}
                animate={{
                  width: isActive ? 400 : 300,
                  height: isActive ? 510 : 400,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex-none overflow-hidden cursor-pointer"
              >
                {project.type === 'info' ? (
                  <div className="w-full h-full bg-black text-white p-[30px] flex flex-col relative">
                    <div className="flex flex-col">
                      <motion.h2 
                        className="font-serif leading-tight mb-4"
                        animate={{ fontSize: isActive ? '42px' : '32px' }}
                        transition={{ duration: 0.4 }}
                      >
                        {project.title}
                      </motion.h2>
                      
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-[#a0a0a0] text-[15px] leading-relaxed pr-4"
                          >
                            {project.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="absolute bottom-[15px] left-[15px] right-[15px]">
                      <button className="w-full cursor-pointer h-[60px] bg-[#1c1c1c] hover:bg-[#252525] transition-colors flex items-center justify-center gap-3 rounded-none border border-white/5 uppercase tracking-widest text-[11px] font-bold">
                        Все работы
                        <Plus className="w-4 h-4 text-purple-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 relative group">
                    <motion.img
                      src={project.image || ''}
                      alt="Work"
                      className="w-full h-full object-cover"
                      animate={{ scale: isActive ? 1.05 : 1 }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  )
}

export default MainPage