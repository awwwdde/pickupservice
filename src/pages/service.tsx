import { type FC, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useMotionValueEvent, useTransform, cubicBezier } from 'framer-motion'
import Lenis from 'lenis'
import { ArrowRight } from 'lucide-react'

import { ServiceCard } from '../components/accordeoncard/ServiceCard' 
import {
  fetchAccordionItems,
  fetchServiceGalleryImages,
  type ApiAccordionItem
} from '../api/backend'

const customEase = cubicBezier(0.19, 1, 0.22, 1)

import image1 from '../assets/img/image1.png'
import image2 from '../assets/img/image2.png'
import image3 from '../assets/img/image3.png'
import image5 from '../assets/img/image5.png'
import image6 from '../assets/img/image6.png'
import image7 from '../assets/img/image7.png'
import image8 from '../assets/img/image8.png'
import image9 from '../assets/img/image9.png'

const servicesData = [
  {
    title: 'Модифицируем внедорожники',
    subtitle: 'Индивидуальные проекты, переоборудование салона, установка дополнительного света, спальников и экспедиционных багажников.',
    image: image1
  },
  {
    title: 'Техническое обслуживание',
    subtitle: 'Комплексное ТО, глубокая диагностика ходовой части и двигателя, замена масел и фильтров для японских внедорожников.',
    image: image2
  },
  {
    title: 'Ремонт внедорожников',
    subtitle: 'Усиление подвески, установка лебедок, шноркелей и силовых бамперов для самых экстремальных и суровых условий эксплуатации.',
    image: image3
  }
]

const FALLBACK_TRACK_ROW1 = [image5, image6, image7, image8, image9]

const titleLineVariants = {
  hidden: { y: '110%', rotate: 2, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    rotate: 0,
    opacity: 1,
    transition: {
      delay: 0.2 + i * 0.1,
      duration: 1.4,
      ease: customEase
    }
  })
}

const ServicePage: FC = () => {
  const [activeServiceIndex, setActiveServiceIndex] = useState(0)
  const [serviceItems, setServiceItems] = useState(servicesData)
  const [trackRow1, setTrackRow1] = useState<string[]>(() => [...FALLBACK_TRACK_ROW1])
  const [trackRow2, setTrackRow2] = useState<string[]>(() => [...FALLBACK_TRACK_ROW1].reverse())
  const stickySectionRef = useRef<HTMLDivElement>(null)
  const imageTrackRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const isMobileRef = useRef(false)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
    })
    
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
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAccordionItems()
      .then((items: ApiAccordionItem[]) => {
        if (cancelled || !items.length) return
        setServiceItems(
          items.map((item) => ({
            title: item.title,
            subtitle: item.description,
            image: item.image
          }))
        )
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchServiceGalleryImages()
      .then((items) => {
        if (cancelled || !items.length) return
        const sorted = [...items].sort((a, b) => a.order - b.order)
        const urls = sorted.map((i) => i.image).filter(Boolean)
        if (!urls.length) return
        setTrackRow1(urls)
        setTrackRow2([...urls].reverse())
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => {
      isMobileRef.current = mq.matches
    }

    apply()

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }

    mq.addListener(apply)
    return () => mq.removeListener(apply)
  }, [])

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const heroBgY = useTransform(heroScrollProgress, [0, 1], ["0%", "25%"])
  const heroContentY = useTransform(heroScrollProgress, [0, 1], ["0px", "200px"])
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.7], [1, 0])

  const { scrollYProgress: imageScrollProgress } = useScroll({
    target: imageTrackRef,
    offset: ["start end", "end start"]
  })
  
  const row1X = useTransform(imageScrollProgress, [0, 1], ["0%", "-20%"])
  const row2X = useTransform(imageScrollProgress, [0, 1], ["-20%", "0%"])

  const { scrollYProgress: stickyProgress } = useScroll({
    target: stickySectionRef,
    offset: ["start start", "end end"]
  })

  useMotionValueEvent(stickyProgress, "change", (latest) => {
    if (isMobileRef.current) return
    if (!serviceItems.length) return
    const index = Math.min(
      Math.floor(latest * serviceItems.length),
      serviceItems.length - 1
    )
    setActiveServiceIndex(index)
  })

  const headline = "Мастерская внедорожников, которая любит свое дело";

  return (
    <div className="bg-[#fcfcfc] selection:bg-[#FF8201] selection:text-white font-sans text-black antialiased">
      
      {/* SECTION 1: HERO */}
      <section id="site-hero" ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-black">
        <motion.div 
          style={{ y: heroBgY }}
          className="absolute inset-0 z-0 bg-black"
        >
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 2, ease: customEase }}
            src={trackRow1[0] ?? image5}
            className="h-full w-full object-cover"
            alt="Offroad workshop hero"
          />
        </motion.div>

        <motion.div 
          style={{ y: heroContentY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-[clamp(1rem,5vw,4rem)] mix-blend-difference pointer-events-none"
        >
          <h1 className="text-[clamp(2.5rem,8.5vw,7.5rem)] uppercase font-black tracking-[-0.04em] text-white leading-[0.88] flex flex-col items-center justify-center">
            <span className="sr-only">{headline}</span>
            
            <div className="flex flex-wrap justify-center overflow-hidden py-2 gap-x-[0.2em]">
              {["Мастерская", "внедорожников,"].map((word, i) => (
                <div key={i} className="overflow-hidden flex items-center">
                  <motion.span
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={titleLineVariants}
                    className="inline-block origin-bottom"
                  >
                    {word}
                  </motion.span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap justify-center overflow-hidden py-2 gap-x-[0.2em]">
              {["которая", "любит", "свое"].map((word, i) => (
                <div key={i + 2} className="overflow-hidden flex items-center">
                  <motion.span
                    custom={i + 2}
                    initial="hidden"
                    animate="visible"
                    variants={titleLineVariants}
                    className="inline-block origin-bottom"
                  >
                    {word}
                  </motion.span>
                </div>
              ))}
               <div className="overflow-hidden flex items-center italic pr-2">
                  <motion.span
                    custom={5}
                    initial="hidden"
                    animate="visible"
                    variants={titleLineVariants}
                    className="inline-block origin-bottom"
                  >
                    дело
                  </motion.span>
                </div>
            </div>
          </h1>
        </motion.div>
      </section>

      {/* SECTION 2: INTRO */}
      <section className="py-[clamp(5rem,12vw,13rem)] bg-[#fcfcfc]">
        <div className="w-[90%] mx-auto grid grid-cols-1 sm:grid-cols-[1.2fr,0.8fr] gap-[clamp(1.5rem,5vw,5rem)] items-end">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, ease: customEase }}
            className="text-[clamp(2rem,6vw,5rem)] font-black uppercase tracking-[-0.04em] text-black leading-[0.88]"
          >
            Мы знаем, что <br /> <span className="text-black italic">нужно</span> <br /> внедорожнику
            <span className="text-[#FF8201]">.</span> 
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 1.2, ease: customEase }}
            className="flex flex-col justify-end"
          >
            <p className="text-[clamp(1rem,2.4vw,1.5rem)] text-neutral-500 leading-snug font-medium max-w-lg tracking-tight">
              ПикапСервис — это место, где техническая экспертиза встречается с фанатичным отношением к оффроуду. Мы специализируемся на японских внедорожниках и готовим их к любым испытаниям.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: IMAGE TRACK */}
      <section ref={imageTrackRef} className="bg-[#fcfcfc] pb-[clamp(3rem,8vw,13rem)] overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:flex flex-col gap-8 md:gap-12">
          <motion.div style={{ x: row1X }} className="flex gap-8 md:gap-12 whitespace-nowrap">
            {trackRow1.map((src, i) => (
              <div key={i} className="w-[clamp(260px,40vw,720px)] h-[clamp(180px,35vw,560px)] flex-shrink-0 overflow-hidden bg-neutral-200">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: customEase }}
                  src={src}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            ))}
          </motion.div>
          <motion.div style={{ x: row2X }} className="flex gap-8 md:gap-12 whitespace-nowrap">
            {trackRow2.map((src, i) => (
              <div key={i} className="w-[clamp(260px,40vw,720px)] h-[clamp(180px,35vw,560px)] flex-shrink-0 overflow-hidden bg-neutral-200">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: customEase }}
                  src={src}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="overflow-x-auto snap-x snap-mandatory">
            <div className="flex gap-4 w-max px-[6%] pb-4">
              {trackRow1.map((src, i) => (
                <div
                  key={i}
                  className="snap-start flex-none w-[80vw] max-w-[360px] h-[42vh] overflow-hidden bg-neutral-200"
                >
                  <motion.img
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.4, ease: customEase }}
                    src={src}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: STICKY BLOCKS */}
      <section ref={stickySectionRef} className="relative bg-[#fcfcfc] text-black border-t border-neutral-200 md:h-[300vh]">
        {/* Desktop */}
        <div className="hidden md:flex sticky top-0 h-screen w-full flex-col items-center justify-center overflow-hidden">
          <div className="w-[90%] mb-[clamp(1.5rem,4vw,4rem)] grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-end">
            <h2 className="text-[clamp(2rem,5vw,5rem)] font-black uppercase tracking-[-0.04em] text-black leading-[0.88]">
              Направления <br /> <span className="text-[#FF8201]">сервиса</span>
            </h2>
            <div className="font-mono text-[clamp(0.6rem,1.2vw,0.875rem)] uppercase tracking-[0.2em] text-neutral-400 mb-2">
              [ 0{activeServiceIndex + 1} / 0{serviceItems.length} ]
            </div>
          </div>

          <div className="w-[90%] flex flex-col border-t border-black/10">
            {serviceItems.map((service, index) => (
              <ServiceCard
                key={index}
                index={index}
                title={service.title}
                subtitle={service.subtitle}
                image={service.image}
                isActive={activeServiceIndex === index}
                onClick={() => setActiveServiceIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden w-full px-[6%] py-[clamp(3rem,8vw,8rem)]">
          <div className="mb-[clamp(1.5rem,4vw,2.5rem)]">
            <h2 className="text-[clamp(2rem,8vw,4rem)] font-black uppercase tracking-[-0.04em] text-black leading-[0.95]">
              Направления <br /> <span className="text-[#FF8201]">сервиса</span>
            </h2>
          </div>

          <div className="flex flex-col border-t border-black/10">
            {serviceItems.map((service, index) => (
              <ServiceCard
                key={index}
                index={index}
                title={service.title}
                subtitle={service.subtitle}
                image={service.image}
                isActive={activeServiceIndex === index}
                onClick={() => setActiveServiceIndex(index)}
                alwaysExpanded
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA */}
      <section className="py-[clamp(5rem,12vw,13rem)] bg-[#fcfcfc] border-t border-neutral-200">
        <div className="w-[90%] mx-auto flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: customEase }}
                className="text-center mb-[clamp(2rem,6vw,6rem)]"
            >
                <h3 className="text-[clamp(2rem,5vw,5rem)] font-black uppercase tracking-[-0.04em] text-black mb-[clamp(0.75rem,2vw,1.5rem)] leading-[0.88]">Готовы к проектам?</h3>
                <p className="text-[clamp(1rem,2.4vw,1.5rem)] text-neutral-500 max-w-2xl mx-auto font-medium tracking-tight">Оставьте заявку, и мы свяжемся с вами, чтобы обсудить подготовку вашего внедорожника.</p>
            </motion.div>
          <motion.button
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="group relative flex h-[clamp(72px,14vw,140px)] w-full max-w-5xl cursor-pointer items-center justify-between overflow-hidden bg-black px-[clamp(1.25rem,4vw,3rem)]"
          >
            <motion.div 
              variants={{
                rest: { scaleY: 0 },
                hover: { scaleY: 1 }
              }}
              transition={{ duration: 0.6, ease: customEase }}
              className="absolute inset-0 bg-[#FF8201] origin-bottom"
            />
            
            <span className="relative z-10 text-[clamp(1.5rem,3vw,3rem)] font-black uppercase tracking-[-0.04em] text-white whitespace-nowrap">
              Записаться
            </span>
            
            <motion.div
                variants={{
                    rest: { x: 0 },
                    hover: { x: 20 }
                }}
                transition={{ duration: 0.6, ease: customEase }}
                className="relative z-10 flex items-center justify-center rounded-full p-4 flex-shrink-0"
            >
                <ArrowRight className="h-[clamp(1.5rem,4vw,3rem)] w-[clamp(1.5rem,4vw,3rem)] text-white" strokeWidth={1.5} />
            </motion.div>
          </motion.button>
        </div>
      </section>
    </div>
  )
}

export default ServicePage