import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Mouse, Plus } from 'lucide-react'

import herovid from '../assets/vid/hero.webm'
import image1 from '../assets/img/image1.png'
import image2 from '../assets/img/image2.png'
import image3 from '../assets/img/image3.png'
import image4 from '../assets/img/images4.png'

const words = ['СОЗДАЕМ', 'РЕМОНТИРУЕМ', 'ОБСЛУЖИВАЕМ']

let isHeroVideoPlayed = false

const aboutImages = [image1, image2, image3, image4]

const projectsData = [
  {
    id: 0,
    title: 'Наши Проекты',
    description:
      'Бескомпромиссный подход к делу. Изучите наше портфолио по подготовке и ремонту японских внедорожников.',
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

  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start start', 'end end']
  })

  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ['start start', 'end end']
  })

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.6
  })

  const smoothAbout = useSpring(aboutProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.6
  })

  const textY = useTransform(smoothScroll, [0, 0.35], [80, 0])
  const textOpacity = useTransform(smoothScroll, [0.05, 0.2, 0.8, 0.95], [0, 1, 1, 0])

  const firstBlockY = useTransform(smoothScroll, [0, 1], [220, -220])
  const secondBlockY = useTransform(smoothScroll, [0, 1], [260, -260])

  const firstBlockOpacity = useTransform(smoothScroll, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])
  const secondBlockOpacity = useTransform(smoothScroll, [0.3, 0.5, 0.6, 0.8], [0, 1, 1, 0])

  const aboutTitleY = useTransform(smoothAbout, [0, 0.3], [80, 0])
  const aboutTitleOpacity = useTransform(smoothAbout, [0.05, 0.3], [0, 1])

  const aboutCardY = useTransform(smoothAbout, [0, 0.25, 0.75, 1], [900, 900, -900, -900])
  const aboutIndexRaw = useTransform(smoothAbout, [0, 1], [0, aboutImages.length - 1])
  const roundedIndex = Math.round(aboutIndexRaw.get())

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.loop = false
    if (!isHeroVideoPlayed) {
      document.body.style.overflow = 'hidden'
      video.play().catch(console.error)
    } else {
      document.body.style.overflow = ''
      setShowContent(true)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (isHeroVideoPlayed) {
      e.currentTarget.currentTime = e.currentTarget.duration || 9999
    }
  }

  const handleVideoEnd = () => {
    isHeroVideoPlayed = true
    setShowContent(true)
    document.body.style.overflow = ''
    window.dispatchEvent(new Event('hero-ready'))
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
      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={herovid}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
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
                transition={{ duration: 1.1, ease }}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <motion.span
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease }}
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
                        transition={{ duration: 0.6, ease }}
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
                    transition={{ duration: 0.8, delay: 0.1, ease }}
                  >
                    ВНЕДОРОЖНИКИ
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Блок с подсказкой прокрутки вниз в стиле glass-header */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <motion.div
            className="glass-header flex items-center gap-2 px-4 py-2 text-[14px]"
            initial={{ opacity: 0, y: 10 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Mouse className="h-4 w-4" />
            </motion.span>
            <span>прокрутите вниз, чтобы узнать больше</span>
          </motion.div>
        </div>
      </section>
      {/* PARALLAX */}
      <section ref={parallaxRef} className="relative h-[400vh] w-full bg-[#f3f3f1]">
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-10 text-black">
          <motion.div
            style={{ y: textY, opacity: textOpacity }}
            className="relative z-5 w-full max-w-[1200px] text-center text-[96px] font-medium italic tracking-tighter leading-[0.9] transform-gpu"
          >
            <span>Собираем и обслуживаем </span>
            <span className="text-[#FF8201]">японские </span>
            <span>внедорожники</span>
          </motion.div>
          <motion.div
            style={{ y: firstBlockY, opacity: firstBlockOpacity }}
            className="absolute z-10 left-[10%] top-1/2 -translate-y-1/2 glass-header px-8 py-5 text-[20px] text-[#FF8201] shadow-xl transform-gpu"
          >
            ПИКАПСЕРВИС
          </motion.div>
          <motion.div
            style={{ y: secondBlockY, opacity: secondBlockOpacity }}
            className="absolute z-10 right-[10%] top-1/2 -translate-y-1/2 glass-header max-w-[400px] px-10 py-10 text-[18px] shadow-xl leading-relaxed transform-gpu"
          >
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
          </motion.div>
        </div>
      </section>
      {/* PROJECTS */}
      <section className="w-full bg-[#f3f3f1] min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="flex items-start justify-center gap-4 h-[510px] w-full px-[5%]"
          onMouseLeave={() => setActiveProjectIndex(0)}
        >
          {projectsData.map((project, index) => {
            const isActive = activeProjectIndex === index
            return (
              <motion.div
                key={project.id}
                layout
                onMouseEnter={() => setActiveProjectIndex(index)}
                animate={{
                  width: isActive ? 400 : 300,
                  height: isActive ? 510 : 400
                }}
                transition={{
                  layout: { duration: 0.6, ease }
                }}
                className="relative flex-none overflow-hidden cursor-pointer transform-gpu"
              >
                {project.type === 'info' ? (
                  <div className="w-full h-full bg-black text-white p-[30px] flex flex-col relative">
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

                    <div className="absolute bottom-[15px] left-[15px] right-[15px] flex justify-center">
                      <button className="w-[370px] max-w-full h-[160px] bg-[#1c1c1c] hover:bg-[#252525] transition-colors flex items-center justify-center gap-3 rounded-none border border-white/5 uppercase tracking-widest text-[11px] font-bold">
                        ВСЕ РАБОТЫ
                        <Plus className="w-4 h-4 text-[#FF8201]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <motion.img
                      src={project.image || ''}
                      className="w-full h-full object-cover"
                      animate={{ scale: isActive ? 1.05 : 1 }}
                      transition={{ duration: 0.9, ease }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>
      {/* ABOUT */}
      <section
        ref={aboutRef}
        className="relative h-[350vh] w-full bg-[#f3f3f1] text-black"
      >
        <div className="sticky top-0 flex h-screen items-center justify-center px-[5%]">
          <div className="flex w-full items-center gap-16">
            <motion.div
              style={{ y: aboutTitleY, opacity: aboutTitleOpacity }}
              className="flex-1 text-[90px] leading-[0.85] font-semibold tracking-tight uppercase transform-gpu"
            >
              <div>КТО</div>
              <div>МЫ?</div>
            </motion.div>
            <motion.div
              style={{ y: aboutCardY }}
              className="flex-1 flex justify-end transform-gpu"
            >
              <div className="w-full max-w-[1200px]">
                <div className="relative w-full h-[500px] overflow-hidden mb-[50px]">
                  {aboutImages.map((img, i) => (
                    <motion.img
                      key={i}
                      src={img}
                      className="absolute inset-0 w-full h-full object-cover"
                      animate={{
                        opacity: roundedIndex === i ? 1 : 0,
                        scale: roundedIndex === i ? 1 : 1.05
                      }}
                      transition={{ duration: 0.8, ease }}
                    />
                  ))}
                </div>
                <div className="bg-black/90 text-black  glass-header">
                  <h3 className="font-serif text-[26px] mb-3 leading-tight">
                    Команда, которая живёт внедорожниками
                  </h3>
                  <p className="text-[#a0a0a0] text-[14px] leading-relaxed mb-5">
                  It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop 
                  </p>
                  <button className="w-[300px] h-[60px] bg-[#272727] hover:bg-[#252525] transition-colors flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] font-bold text-white cursor-pointer">
                    Узнать о нас больше
                    <Plus className="w-4 h-4 text-[#FF8201]" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="h-screen w-full bg-black text-white flex items-center justify-center text-4xl tracking-tight">
        Секция 5
      </section>
    </div>
  )
}

export default MainPage
