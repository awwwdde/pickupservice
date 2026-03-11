import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, type MotionStyle } from 'framer-motion'
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

  const textY = useTransform(scrollYProgress, [0, 0.35], [80, 0])
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1])
  const firstBlockY = useTransform(scrollYProgress, [0, 1], [300, -300])
  const secondBlockY = useTransform(scrollYProgress, [0, 1], [380, -380])
  const firstBlockOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.25, 0.75, 0.9],
    [0, 1, 1, 0],
  )

  const secondBlockOpacity = useTransform(
    scrollYProgress,
    [0.25, 0.45, 0.65, 0.85],
    [0, 1, 1, 0],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    void video.play()
  }, [])

  useEffect(() => {
    if (!isVideoReady) return

    const timeout = window.setTimeout(() => {
      setShowContent(true)
      window.dispatchEvent(new Event('hero-ready'))
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [isVideoReady])

  useEffect(() => {
    if (!showContent) return

    const id = window.setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, 2600)

    return () => window.clearInterval(id)
  }, [showContent])

  return (
    <div className="bg-black text-white">
      <section className="relative h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={herovid}
          autoPlay
          muted
          playsInline
          controls={false}
          onLoadedData={() => setIsVideoReady(true)}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
          <motion.div
            className="relative flex w-full items-center justify-between px-[35px] text-[64px] font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="leading-none">
              МЫ{' '}
              <span className="inline-flex h-[1em] items-center overflow-hidden align-baseline">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWordIndex}
                    initial={{ y: '-100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '100%' }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 0.61, 0.36, 1],
                    }}
                    className="inline-block whitespace-nowrap"
                  >
                    {words[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
            <span>ВНЕДОРОЖНИКИ</span>
          </motion.div>
        </div>
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
      <section
        ref={parallaxRef}
        className="relative h-[220vh] w-full bg-[#f3f3f1]"
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6 text-black">
          <motion.div
            style={{
              y: textY,
              opacity: textOpacity,
              leadingTrim: 'both',
              textEdge: 'cap',
            } as MotionStyle & { leadingTrim: string; textEdge: string }}
            className="relative z-10 w-[80%] max-w-full text-center text-[96px] font-medium italic tracking-wide leading-[100px]"
          >
            <span>Собираем и обслуживаем </span>
            <span className="text-[#FF8201]">японские </span>
            <span>внедорожники</span>
          </motion.div>
          <motion.div
            style={{ y: firstBlockY, opacity: firstBlockOpacity }}
            className="absolute left-[280px] top-1/2 z-20 max-w-xs -translate-y-1/2 glass-header text-[20px] font-normal not-italic leading-normal text-[#FF8201]"
          >
            ПИКАПСЕРВИС
          </motion.div>
          <motion.div
            style={{ y: secondBlockY, opacity: secondBlockOpacity }}
            className="absolute right-[280px] top-1/2 z-20 max-w-sm -translate-y-1/2 glass-header text-[20px] font-normal not-italic leading-normal"
          >
            It is a long established fact that a reader will be distracted by the
            readable content of a page when looking at its layout.
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default MainPage