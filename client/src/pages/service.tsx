import { type FC, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useMotionValueEvent, useTransform, cubicBezier, AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import { ArrowRight } from 'lucide-react'

import { ServiceCard } from '../components/accordeoncard/ServiceCard' 

// Более "дорогой" easing — быстрый старт, ооочень плавный финиш
const customEase = cubicBezier(0.19, 1, 0.22, 1)

import image1 from '../assets/img/image1.png'
import image2 from '../assets/img/image2.png'
import image3 from '../assets/img/image3.png'

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

// Обновленные анимации для текста: более резкое появление
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
  const stickySectionRef = useRef<HTMLDivElement>(null)
  const imageTrackRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
    })
    
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    
    requestAnimationFrame(raf)
    
    return () => lenis.destroy()
  }, [])

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  // Более выраженный параллакс
  const heroBgY = useTransform(heroScrollProgress, [0, 1], ["0%", "25%"])
  const heroContentY = useTransform(heroScrollProgress, [0, 1], ["0px", "200px"])
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.7], [1, 0])

  const { scrollYProgress: imageScrollProgress } = useScroll({
    target: imageTrackRef,
    offset: ["start end", "end start"]
  })
  
  // Увеличили размах движения галереи
  const row1X = useTransform(imageScrollProgress, [0, 1], ["0%", "-20%"])
  const row2X = useTransform(imageScrollProgress, [0, 1], ["-20%", "0%"])

  const { scrollYProgress: stickyProgress } = useScroll({
    target: stickySectionRef,
    offset: ["start start", "end end"]
  })

  useMotionValueEvent(stickyProgress, "change", (latest) => {
    const index = Math.min(
      Math.floor(latest * servicesData.length),
      servicesData.length - 1
    )
    setActiveServiceIndex(index)
  })

  const headline = "Мастерская внедорожников, которая любит свое дело";

  return (
    <div className="bg-[#fcfcfc] selection:bg-[#FF8201] selection:text-white font-sans text-black antialiased">
      
      {/* SECTION 1: HERO */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-black">
        <motion.div 
          style={{ y: heroBgY }}
          className="absolute inset-0 z-0 bg-black"
        >
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }} // Слегка затемняем саму картинку для контраста без мыльного блюра
            transition={{ duration: 2, ease: customEase }}
            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2000" 
            className="h-full w-full object-cover"
            alt="Offroad workshop hero"
          />
        </motion.div>

        {/* Mix-blend-difference — делает белый текст инвертированным на фоне картинки */}
        <motion.div 
          style={{ y: heroContentY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 mix-blend-difference pointer-events-none"
        >
          <h1 className="text-[7.5vw] md:text-[6.5vw] uppercase font-black tracking-[-0.04em] text-white leading-[0.85] flex flex-col items-center justify-center">
            <span className="sr-only">{headline}</span>
            
            <div className="flex flex-wrap justify-center overflow-hidden py-2">
              {["Мастерская", "внедорожников,"].map((word, i) => (
                <div key={i} className="overflow-hidden mr-[0.2em] flex items-center">
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
            
            <div className="flex flex-wrap justify-center overflow-hidden py-2">
              {["которая", "любит", "свое"].map((word, i) => (
                <div key={i + 2} className="overflow-hidden mr-[0.2em] flex items-center">
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
      <section className="py-40 md:py-52 bg-[#fcfcfc]">
        <div className="w-[90%] mx-auto grid grid-cols-2 md:grid-cols-[1.2fr,0.8fr] gap-20 items-end">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, ease: customEase }}
            className="text-5xl md:text-[5vw] font-black uppercase tracking-[-0.04em] text-black leading-[0.85]"
          >
            Мы знаем, что <br /> <span className="text-black italic">нужно</span> <br /> внедорожнику
            {/* Оранжевый акцент сделан в виде точки, чтобы сохранить общую строгость */}
            <span className="text-[#FF8201]">.</span> 
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 1.2, ease: customEase }}
            className="flex flex-col justify-end"
          >
            <p className="text-xl md:text-2xl text-neutral-500 leading-snug font-medium max-w-lg tracking-tight">
              ПикапСервис — это место, где техническая экспертиза встречается с фанатичным отношением к оффроуду. Мы специализируемся на японских внедорожниках и готовим их к любым испытаниям.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: IMAGE TRACK */}
      <section ref={imageTrackRef} className="bg-[#fcfcfc] pb-40 md:pb-52 overflow-hidden">
        <div className="flex flex-col gap-8 md:gap-12">
          <motion.div style={{ x: row1X }} className="flex gap-8 md:gap-12 whitespace-nowrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-[60vw] md:w-[40vw] h-[40vh] md:h-[60vh] flex-shrink-0 overflow-hidden bg-neutral-200">
                <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: customEase }}
                    src={`https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&sig=${i}`} 
                    className="w-full h-full object-cover" 
                    alt="Offroad adventure colored 1"
                />
              </div>
            ))}
          </motion.div>
          <motion.div style={{ x: row2X }} className="flex gap-8 md:gap-12 whitespace-nowrap">
            {[5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="w-[60vw] md:w-[40vw] h-[40vh] md:h-[60vh] flex-shrink-0 overflow-hidden bg-neutral-200">
                <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: customEase }}
                    src={`https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1200&sig=${i}`} 
                    className="w-full h-full object-cover" 
                    alt="Offroad adventure colored 2"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: STICKY BLOCKS */}
      <section ref={stickySectionRef} className="relative h-[300vh] bg-[#fcfcfc] text-black border-t border-neutral-200">
        <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
          <div className="w-[90%] mb-12 md:mb-16 grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-end">
            <h2 className="text-6xl md:text-[5vw] font-black uppercase tracking-[-0.04em] text-black leading-[0.85]">
              Направления <br /> <span className="text-[#FF8201]">сервиса</span>
            </h2>
             <div className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-neutral-400 mb-2">
                [ 0{activeServiceIndex + 1} / 0{servicesData.length} ]
             </div>
          </div>

          <div className="w-[90%] flex flex-col border-t border-black/10">
            {servicesData.map((service, index) => (
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
      </section>

      {/* SECTION 5: CTA */}
      <section className="py-40 md:py-52 bg-[#fcfcfc] border-t border-neutral-200">
        <div className="w-[90%] mx-auto flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: customEase }}
                className="text-center mb-16 md:mb-24"
            >
                <h3 className="text-5xl md:text-[5vw] font-black uppercase tracking-[-0.04em] text-black mb-6 leading-[0.85]">Готовы к проектам?</h3>
                <p className="text-xl md:text-2xl text-neutral-500 max-w-2xl mx-auto font-medium tracking-tight">Оставьте заявку, и мы свяжемся с вами, чтобы обсудить подготовку вашего внедорожника.</p>
            </motion.div>
            
          <motion.button
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="group relative flex h-[100px] md:h-[140px] w-full max-w-5xl cursor-pointer items-center justify-between overflow-hidden bg-black px-8 md:px-12"
          >
            {/* Анимация заполнения кнопки при наведении */}
            <motion.div 

              transition={{ duration: 0.6, ease: customEase }}
              className="absolute inset-0 bg-[#FF8201] origin-bottom"
            />
            
            <span className="relative z-10 text-3xl md:text-[3vw] font-black uppercase tracking-[-0.04em] text-white">
              Записаться
            </span>
            
            <motion.div
                variants={{
                    rest: { x: 0 },
                    hover: { x: 20 }
                }}
                transition={{ duration: 0.6, ease: customEase }}
                className="relative z-10 flex items-center justify-center rounded-full p-4"
            >
                <ArrowRight className="h-10 w-10 md:h-12 md:w-12 text-white" strokeWidth={1.5} />
            </motion.div>
          </motion.button>
        </div>
      </section>
    </div>
  )
}

export default ServicePage