import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent
} from 'framer-motion'
import { Mouse, Plus } from 'lucide-react'
import Lenis from 'lenis'

import herovid from '../assets/vid/hero.webm'
import image1 from '../assets/img/image1.png'
import image2 from '../assets/img/image2.png'
import image3 from '../assets/img/image3.png'
import image4 from '../assets/img/images4.png'

const words = ['СОЗДАЕМ', 'РЕМОНТИРУЕМ', 'ОБСЛУЖИВАЕМ']
const aboutImages = [image1, image2, image3, image4]

let isHeroVideoPlayed = false

const projectsData = [
  {
    id: 0,
    title: 'Наши Проекты',
    description: 'Бескомпромиссный подход к делу. Изучите наше портфолио по подготовке и ремонту японских внедорожников.',
    type: 'info',
    image: null
  },
  { id: 1, image: image1 },
  { id: 2, image: image2 },
  { id: 3, image: image3 },
  { id: 4, image: image4 }
]

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MainPage: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const parallaxRef = useRef<HTMLDivElement | null>(null)
  const aboutRef = useRef<HTMLDivElement | null>(null)

  const [showContent, setShowContent] = useState(isHeroVideoPlayed)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [aboutImageIndex, setAboutImageIndex] = useState(0)

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.05, smoothWheel: true })
    if (!isHeroVideoPlayed) lenis.stop()
    const onHeroReady = () => lenis.start()
    window.addEventListener('hero-ready', onHeroReady)
    let rafId: number
    const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)
    return () => {
      window.removeEventListener('hero-ready', onHeroReady)
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: aboutProgress } = useScroll({ target: aboutRef, offset: ['start start', 'end end'] })

  const springConfig = { stiffness: 50, damping: 20, mass: 1 }
  const smoothScroll = useSpring(scrollYProgress, springConfig)
  const smoothAbout = useSpring(aboutProgress, springConfig)

  const firstBlockY = useTransform(smoothScroll, [0, 1], ['60vh', '-60vh'])
  const secondBlockY = useTransform(smoothScroll, [0, 1], ['80vh', '-80vh'])

  const aboutCardY = useTransform(smoothAbout, [0, 1], ['100vh', '-120vh'])
  const aboutIndexRaw = useTransform(smoothAbout, [0.2, 0.8], [0, aboutImages.length - 1])

  useMotionValueEvent(aboutIndexRaw, 'change', (latest) => {
    setAboutImageIndex(Math.round(latest))
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!isHeroVideoPlayed) {
      document.body.style.overflow = 'hidden'
      video.play().catch(console.error)
    } else {
      document.body.style.overflow = ''
      setShowContent(true)
    }
  }, [])

  const handleVideoEnd = () => {
    isHeroVideoPlayed = true
    setShowContent(true)
    document.body.style.overflow = ''
    window.dispatchEvent(new Event('hero-ready'))
  }

  useEffect(() => {
    if (!showContent) return
    const id = setInterval(() => setCurrentWordIndex(p => (p + 1) % words.length), 2600)
    return () => clearInterval(id)
  }, [showContent])

  return (
    <div className="bg-black text-white selection:bg-[#FF8201]">
      
      {/* SECTION 1: HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={herovid}
          muted
          playsInline
          onEnded={handleVideoEnd}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${showContent ? 'opacity-60' : 'opacity-100'}`}
        />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center px-[35px]">
          <AnimatePresence>
            {showContent && (
              <motion.div className="flex w-full items-center justify-between text-[clamp(32px,6vw,64px)] font-semibold tracking-tighter uppercase" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-4">
                  <span>МЫ</span>
                  <div className="inline-flex h-[1.1em] items-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={currentWordIndex} 
                        initial={{ y: '100%' }} 
                        animate={{ y: 0 }} 
                        exit={{ y: '-100%' }} 
                        transition={{ duration: 0.6, ease }}
                        className="inline-block"
                      >
                        {words[currentWordIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
                <span>ВНЕДОРОЖНИКИ</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <motion.div
            className="glass-header flex items-center gap-2 px-4 py-2 text-[14px]"
            initial={{ opacity: 0, y: 10 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          >
            <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Mouse className="h-4 w-4" />
            </motion.span>
            <span>прокрутите вниз, чтобы узнать больше</span>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: PARALLAX */}
      <section ref={parallaxRef} className="relative h-[300vh] bg-[#f3f3f1]">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden text-black px-10">
          <div className="text-center text-[96px] font-medium italic tracking-tighter leading-[0.9]">
            Собираем и обслуживаем <span className="text-[#FF8201]">японские</span> внедорожники
          </div>
          <motion.div style={{ y: firstBlockY }} className="absolute left-[8%] glass-header px-10 py-6 text-[22px] text-[#FF8201] font-bold shadow-2xl">
            ПИКАПСЕРВИС
          </motion.div>
          <motion.div style={{ y: secondBlockY }} className="absolute right-[8%] glass-header max-w-[400px] p-10 text-[18px] shadow-2xl leading-relaxed text-black/70">
            Бескомпромиссная подготовка к экспедициям и трофи-рейдам. Ваша уверенность в каждом километре пути.
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: PROJECTS */}
      <section className="bg-[#f3f3f1] py-32 flex justify-center">
        <div className="flex items-end gap-5 h-[550px] w-full px-[5%]" onMouseLeave={() => setActiveProjectIndex(0)}>
          {projectsData.map((p, i) => (
            <motion.div
              key={i} layout
              onMouseEnter={() => setActiveProjectIndex(i)}
              animate={{ width: activeProjectIndex === i ? 450 : 280, height: activeProjectIndex === i ? 550 : 400 }}
              className="relative overflow-hidden cursor-pointer bg-black shadow-2xl"
            >
              {p.type === 'info' ? (
                <div className="w-full h-full p-[30px] flex flex-col relative">
                  <motion.h2 className="font-serif leading-tight mb-4" animate={{ fontSize: activeProjectIndex === i ? '42px' : '32px' }}>
                    {p.title}
                  </motion.h2>
                  <AnimatePresence>
                    {activeProjectIndex === i && (
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[#a0a0a0] text-[15px] leading-relaxed">
                        {p.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <div className="absolute bottom-[15px] left-[15px] right-[15px]">
                    <button className="w-full cursor-pointer h-[100px] bg-[#1c1c1c] hover:bg-[#FF8201] transition-all flex items-center justify-center gap-3 border border-white/5 uppercase tracking-widest text-[11px] font-bold">
                      ВСЕ РАБОТЫ <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <img src={p.image || ''} className="w-full h-full object-cover opacity-80" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4: ABOUT */}
      <section ref={aboutRef} className="relative h-[300vh] bg-[#f3f3f1] text-black">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center px-[5%] overflow-hidden">
          
          <div className="absolute left-[5%] z-0">
            <div className="text-[12vw] font-black leading-[0.75] tracking-tighter uppercase">
              <div>КТО</div>
              <div className="text-[#FF8201]">МЫ?</div>
            </div>
          </div>

          <motion.div style={{ y: aboutCardY }} className="relative z-10 ml-auto w-[1100px]">
            <div className="relative w-[1100px] h-[600px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-neutral-200">
              {aboutImages.map((img, i) => (
                <motion.img
                  key={i} src={img}
                  className="absolute inset-0 w-full h-full object-cover"
                  animate={{ opacity: aboutImageIndex === i ? 1 : 0, scale: aboutImageIndex === i ? 1 : 1.1 }}
                  transition={{ duration: 0.8 }}
                />
              ))}
            </div>
            
            <div className="mt-12 flex flex-col gap-4">
              <div className="max-w-[500px]">
                <h3 className="text-4xl font-bold tracking-tight uppercase mb-4">Инженерная эстетика оффроуда</h3>
                <p className="text-black/60 text-lg leading-relaxed">
                  Мы создаем не просто машины, а надежных компаньонов для самых смелых маршрутов. 
                  Опыт, надежность и японское качество в каждой детали.
                </p>
              </div>
              <div className="w-[300px]">
                 <button className="w-full h-[100px] cursor-pointer bg-black text-white hover:bg-[#FF8201] transition-all flex items-center justify-center gap-3 border border-black/5 uppercase tracking-widest text-[11px] font-bold">
                    УЗНАТЬ БОЛЬШЕ <Plus className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      <section className="h-screen w-full bg-black flex items-center justify-center text-xs tracking-[2em] text-white/10 uppercase">
        Pickup Service 2026
      </section>
    </div>
  )
}

export default MainPage