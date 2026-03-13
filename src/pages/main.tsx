import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Mouse } from 'lucide-react'
import herovid from '../assets/vid/hero.webm'

const words = ['СОЗДАЕМ', 'РЕМОНТИРУЕМ', 'ОБСЛУЖИВАЕМ']

const MainPage: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const parallaxRef = useRef<HTMLDivElement | null>(null)

  const [isVideoReady, setIsVideoReady] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150, // Меньше жесткость — плавнее движение
    damping: 35,    // Оптимальное затухание, чтобы не было скольжения
    restDelta: 0.001
  })

  const textY = useTransform(smoothProgress, [0, 0.35], [80, 0])
  const textOpacity = useTransform(smoothProgress, [0.05, 0.2, 0.8, 0.95], [0, 1, 1, 0])
  const firstBlockY = useTransform(smoothProgress, [0, 1], [400, -400])
  const secondBlockY = useTransform(smoothProgress, [0, 1], [500, -500])
  
  const firstBlockOpacity = useTransform(smoothProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])
  const secondBlockOpacity = useTransform(smoothProgress, [0.3, 0.5, 0.6, 0.8], [0, 1, 1, 0])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    if (videoRef.current) {
      videoRef.current.loop = false
      videoRef.current.play()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleVideoEnd = () => {
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
      <section className="relative h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={herovid}
          autoPlay
          muted
          playsInline
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
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop 
          </motion.div>
        </div>
      </section>

      <section className="h-screen bg-[#f3f3f1] flex items-center justify-center border-t border-white/5 text-[#272727]">
          <h2 className="text-[80px] font-bold tracking-tighter uppercase " >ПРОЕКТЫ</h2>
      </section>
    </div>
  )
}

export default MainPage