import type { FC, FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent
} from 'framer-motion'
import { Mouse, Plus, ArrowRight } from 'lucide-react'
import Lenis from 'lenis'

import herovid from '../assets/vid/hero.webm'
import image1 from '../assets/img/image1.png'
import image2 from '../assets/img/image2.png'
import image3 from '../assets/img/image3.png'
import image4 from '../assets/img/images4.png'



import { ServiceCard } from '../components/accordeoncard/ServiceCard'
import { TestimonialCard } from '../components/reviewcard/TestimonialCard'
import { InputField } from '../components/inputfields/InputField'
import { fetchAccordionItems, fetchProjects, submitCallbackRequest } from '../api/backend'
import { Link } from 'react-router-dom'

const words = ['СОЗДАЕМ', 'РЕМОНТИРУЕМ', 'ОБСЛУЖИВАЕМ']
const aboutImages = [image1, image2, image3, image4]

let isHeroVideoPlayed = typeof window !== 'undefined' && window.location.pathname !== '/'

const projectsData = [
  {
    id: 0,
    title: 'Наши Проекты',
    description: 'Бескомпромиссный подход к делу. Изучите наше портфолио по подготовке и ремонту внедорожников.',
    type: 'info',
    image: null
  },
  { id: 1, image: image1 },
  { id: 2, image: image2 },
  { id: 3, image: image3 },
  { id: 4, image: image4 }
]

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

const testimonialsData = [
  {
    quote: "Ребята из Пикапсервис превратили мой обычный крузак в настоящего монстра бездорожья. Качество сварных швов и внимание к деталям просто поражают. Прошел Кольский полуостров без единой поломки.",
    name: "Алексей Смирнов",
    car: "Toyota Land Cruiser 200"
  },
  {
    quote: "Идеальная работа с подвеской. Машина перестала 'козлить' на грейдере, а энергоемкость теперь позволяет не сбрасывать газ там, где остальные ползут. Лучший сервис для подготовки.",
    name: "Дмитрий Волков",
    car: "Nissan Patrol Y61"
  },
  {
    quote: "Делали полный ребилд салона и устанавливали спальник с органайзером. Теперь в экспедициях сплю как дома, все вещи на своих местах. Очень грамотный инженерный подход.",
    name: "Михаил Захаров",
    car: "Toyota Hilux"
  }
]

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MainPage: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const parallaxRef = useRef<HTMLDivElement | null>(null)
  const aboutRef = useRef<HTMLDivElement | null>(null)
  const servicesStickyRef = useRef<HTMLDivElement | null>(null)
  const testimonialsRef = useRef<HTMLDivElement | null>(null)
  const aboutCarouselRef = useRef<HTMLDivElement | null>(null)
  const testimonialsCarouselRef = useRef<HTMLDivElement | null>(null)

  // Контент виден всегда
  const [isVideoFinished, setIsVideoFinished] = useState(isHeroVideoPlayed)
  
  const [isMobile, setIsMobile] = useState(false)
  const isMobileRef = useRef(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [aboutImageIndex, setAboutImageIndex] = useState(0)
  const [activeServiceIndex, setActiveServiceIndex] = useState(0)
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0)
  const [dynamicProjects, setDynamicProjects] = useState(projectsData)
  const [dynamicServices, setDynamicServices] = useState(servicesData)

  const [callbackForm, setCallbackForm] = useState({
    name: '',
    phone: '',
    website: '',
  })
  const [callbackSubmitting, setCallbackSubmitting] = useState(false)
  const [callbackSuccess, setCallbackSuccess] = useState(false)
  const [callbackError, setCallbackError] = useState('')

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.05, smoothWheel: true })
    let rafId: number
    const raf = (time: number) => { 
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
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => {
      isMobileRef.current = mq.matches
      setIsMobile(mq.matches)
    }

    apply()

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }

    // Для старых реализаций
    mq.addListener(apply)
    return () => mq.removeListener(apply)
  }, [])

  const handleCallbackChange = (key: 'name' | 'phone' | 'website', value: string) => {
    setCallbackSuccess(false)
    setCallbackError('')
    setCallbackForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCallbackSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (callbackSubmitting) return
    setCallbackError('')
    setCallbackSuccess(false)
    setCallbackSubmitting(true)
    try {
      await submitCallbackRequest({
        name: callbackForm.name.trim(),
        phone: callbackForm.phone.trim(),
        website: callbackForm.website,
      })
      setCallbackSuccess(true)
      setCallbackForm({ name: '', phone: '', website: '' })
    } catch (err) {
      setCallbackError(err instanceof Error ? err.message : 'Ошибка отправки.')
    } finally {
      setCallbackSubmitting(false)
    }
  }

  // Скролл-анимации
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: aboutProgress } = useScroll({ target: aboutRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: servicesStickyProgress } = useScroll({
    target: servicesStickyRef,
    offset: ['start start', 'end end'],
  })
  const { scrollYProgress: testimonialsProgress } = useScroll({ target: testimonialsRef })

  const springConfig = { stiffness: 50, damping: 20, mass: 1 }
  const smoothScroll = useSpring(scrollYProgress, springConfig)
  const smoothAbout = useSpring(aboutProgress, springConfig)
  
  const testimonialsX = useTransform(testimonialsProgress, [0, 1], ["5%", "-65%"])
  const firstBlockY = useTransform(smoothScroll, [0, 1], ['60vh', '-60vh'])
  const secondBlockY = useTransform(smoothScroll, [0, 1], ['80vh', '-80vh'])
  const aboutCardY = useTransform(smoothAbout, [0, 1], ['100vh', '-120vh'])
  const aboutIndexRaw = useTransform(smoothAbout, [0.2, 0.8], [0, aboutImages.length - 1])

  useMotionValueEvent(aboutIndexRaw, 'change', (latest) => {
    if (isMobileRef.current) return
    setAboutImageIndex(Math.round(latest))
  })

  useMotionValueEvent(servicesStickyProgress, 'change', (latest) => {
    if (isMobileRef.current) return
    if (!dynamicServices.length) return
    const index = Math.min(Math.floor(latest * dynamicServices.length), dynamicServices.length - 1)
    setActiveServiceIndex(index)
  })

  // На mobile индексация задается скроллом swipe-галереи, а не scroll-driven анимациями.
  useEffect(() => {
    if (!isMobile) return
    const container = aboutCarouselRef.current
    if (!container) return

    let rafId: number | null = null
    const updateIndex = () => {
      rafId = null
      const slides = Array.from(container.querySelectorAll<HTMLElement>('[data-about-slide]'))
      if (!slides.length) return

      const containerLeft = container.getBoundingClientRect().left
      let bestIndex = 0
      let bestDist = Number.POSITIVE_INFINITY
      slides.forEach((el, idx) => {
        const dist = Math.abs(el.getBoundingClientRect().left - containerLeft)
        if (dist < bestDist) {
          bestDist = dist
          bestIndex = idx
        }
      })
      setAboutImageIndex(bestIndex)
    }

    const onScroll = () => {
      if (rafId != null) return
      rafId = requestAnimationFrame(updateIndex)
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    updateIndex()

    return () => {
      container.removeEventListener('scroll', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  useEffect(() => {
    if (!isMobile) return
    const container = testimonialsCarouselRef.current
    if (!container) return

    let rafId: number | null = null
    const updateIndex = () => {
      rafId = null
      const slides = Array.from(container.querySelectorAll<HTMLElement>('[data-testimonial-slide]'))
      if (!slides.length) return

      const containerLeft = container.getBoundingClientRect().left
      let bestIndex = 0
      let bestDist = Number.POSITIVE_INFINITY
      slides.forEach((el, idx) => {
        const dist = Math.abs(el.getBoundingClientRect().left - containerLeft)
        if (dist < bestDist) {
          bestDist = dist
          bestIndex = idx
        }
      })
      setActiveTestimonialIndex(bestIndex)
    }

    const onScroll = () => {
      if (rafId != null) return
      rafId = requestAnimationFrame(updateIndex)
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    updateIndex()

    return () => {
      container.removeEventListener('scroll', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  // Управление видео
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!isHeroVideoPlayed) {
      // Прямая загрузка главной: играем видео
      video.play().catch(console.error)
    } else {
      const setToLastFrame = () => {
        video.currentTime = video.duration
        video.pause()
      }

      if (video.readyState >= 1) {
        setToLastFrame()
      } else {
        video.addEventListener('loadedmetadata', setToLastFrame, { once: true })
      }
    }
  }, [])

  const handleVideoEnd = () => {
    isHeroVideoPlayed = true
    setIsVideoFinished(true)
  }

  // Смена слов
  useEffect(() => {
    const id = setInterval(() => setCurrentWordIndex(p => (p + 1) % words.length), 2600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchProjects()
      .then((items) => {
        if (cancelled || !items.length) return
        const mapped = items.slice(0, 4).map((item, idx) => ({
          id: idx + 1,
          image: item.image
        }))
        setDynamicProjects([projectsData[0], ...mapped])
      })
      .catch(() => {
        // Фолбэк — локальные картинки.
      })

    fetchAccordionItems()
      .then((items) => {
        if (cancelled || !items.length) return
        setDynamicServices(
          items.map((item) => ({
            title: item.title,
            subtitle: item.description,
            image: item.image
          }))
        )
      })
      .catch(() => {
        // Фолбэк — локальные карточки.
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-black text-white selection:bg-[#FF8201]">
      
      {/* SECTION 1: HERO */}
      <section id="site-hero" className="relative h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={herovid}
          muted
          playsInline
          onEnded={handleVideoEnd}
          // Чтобы видео замерло на последнем кадре, убираем loop (его и не было)
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000`}
        />
        
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center px-[min(35px,6vw)]">
          <motion.div
            className="flex w-full flex-col items-center justify-center gap-3 text-center text-[clamp(26px,7vw,64px)] font-semibold tracking-tighter uppercase md:flex-row md:items-center md:justify-between md:gap-4 md:text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4">
              <span className="leading-none">МЫ</span>
              <div className="inline-flex h-[1.1em] w-[15ch] max-w-full items-center justify-center overflow-hidden whitespace-nowrap leading-none md:justify-start">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWordIndex}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.6, ease }}
                    className="inline-block whitespace-nowrap"
                  >
                    {words[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <span className="leading-none">ВНЕДОРОЖНИКИ</span>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <motion.div
            className="glass-header flex items-center gap-2 px-4 py-2 text-[14px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
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
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden px-6 text-black sm:px-10">
          <div className="text-center text-[clamp(44px,8vw,96px)] font-bold italic uppercase leading-[0.9] tracking-tighter">
            Собираем и обслуживаем <span className="block text-[#FF8201] md:inline">внедорожники</span>
          </div>
          <motion.div
            style={{ y: firstBlockY }}
            className="absolute left-[8%] glass-header px-6 py-4 text-[min(22px,4vw)] font-bold text-[#FF8201] shadow-2xl sm:px-10 sm:py-6"
          >
            ПИКАПСЕРВИС
          </motion.div>
          <motion.div
            style={{ y: secondBlockY }}
            className="absolute right-[8%] glass-header max-w-[min(400px,90vw)] p-6 text-[min(18px,3.8vw)] leading-relaxed text-black/70 shadow-2xl sm:p-10"
          >
            Бескомпромиссная подготовка к экспедициям и трофи-рейдам. Ваша уверенность в каждом километре пути.
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: PROJECTS */}
      <section className="flex justify-center bg-[#f3f3f1] py-24 md:py-32">
        {/* Desktop/tablet */}
        <div
          className="hidden h-[min(620px,72vh)] w-full items-end gap-5 px-[5%] md:flex"
          onMouseLeave={() => setActiveProjectIndex(0)}
        >
          {dynamicProjects.map((p, i) => (
            <motion.div
              key={i}
              layout
              onMouseEnter={() => setActiveProjectIndex(i)}
              animate={{
                width: activeProjectIndex === i ? 540 : 300,
                height: activeProjectIndex === i ? 620 : 440,
              }}
              className="relative cursor-pointer overflow-hidden bg-black shadow-2xl"
            >
              {p.type === 'info' ? (
                <div className="relative flex h-full w-full flex-col p-[30px]">
                  <motion.h2
                    className="mb-4 font-serif leading-tight"
                    animate={{ fontSize: activeProjectIndex === i ? '46px' : '34px' }}
                  >
                    {p.title}
                  </motion.h2>
                  <AnimatePresence>
                    {activeProjectIndex === i && (
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[#a0a0a0] text-[15px] leading-relaxed">
                        {p.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <Link to='/portfolio'>
                  <div className="absolute bottom-[15px] left-[15px] right-[15px]">
                    <button className="flex h-[min(108px,12vh)] w-full cursor-pointer items-center justify-center gap-3 border border-white/5 bg-[#1c1c1c] text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-[#FF8201]">
                     ВСЕ РАБОТЫ   <Plus className="h-4 w-4" /> 
                    </button>
                  </div>
                  </Link>
                </div>
              ) : (
                <img src={p.image || ''} className="h-full w-full object-cover opacity-80" alt="" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile: все блоки раскрыты, колонка */}
        <div className="flex w-[90%] flex-col gap-8 md:hidden">
          {dynamicProjects.map((p, i) => (
            <div
              key={i}
              className={`overflow-hidden shadow-2xl ${p.type === 'info' ? 'border border-black/10 bg-white' : 'relative min-h-[220px] border border-black/10'}`}
            >
              {p.type === 'info' ? (
                <div className="flex flex-col gap-4 p-6">
                  <h2 className="font-serif text-[32px] leading-tight text-black">{p.title}</h2>
                  <p className="text-[15px] leading-relaxed text-[#a0a0a0]">{p.description}</p>
                  <button className="mt-2 flex h-14 w-full cursor-pointer items-center justify-center gap-3 border border-black/10 bg-[#1c1c1c] text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#FF8201]">
                    ВСЕ РАБОТЫ <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative min-h-[280px] w-full">
                  <img src={p.image || ''} className="absolute inset-0 h-full w-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-5xl font-black text-[#FF8201]">0{i + 1}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: ABOUT */}
      <section ref={aboutRef} className="relative bg-[#f3f3f1] text-black md:h-[300vh]">
        <div className="hidden md:flex sticky top-0 h-screen w-full items-center justify-center overflow-hidden px-[5%]">
          <div className="pointer-events-none absolute left-[5%] z-0">
            <div className="text-[12vw] font-black uppercase leading-[0.75] tracking-tighter">
              <div>КТО</div>
              <div className="text-[#FF8201]">МЫ?</div>
            </div>
          </div>

          <motion.div style={{ y: aboutCardY }} className="relative z-10 ml-auto w-full max-w-[1100px]">
            <div className="relative h-[60vh] max-h-[600px] w-full overflow-hidden bg-black/5">
              {aboutImages.map((img, i) => (
                <motion.img
                  key={i}
                  src={img}
                  alt={`Оффроуд проект ${i + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  animate={{
                    opacity: aboutImageIndex === i ? 1 : 0,
                    scale: aboutImageIndex === i ? 1 : 1.1,
                    zIndex: aboutImageIndex === i ? 10 : 0,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              ))}
            </div>

            <div className="mt-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div className="max-w-[500px]">
                <h3 className="mb-4 text-4xl font-bold uppercase tracking-tight">Инженерная эстетика оффроуда</h3>
                <p className="text-lg leading-relaxed text-black/60">
                  Мы создаем не просто машины, а надежных компаньонов для самых смелых маршрутов. Опыт, надежность и
                  японское качество в каждой детали.
                </p>
              </div>

              <button className="flex h-[80px] w-full max-w-[300px] cursor-pointer items-center justify-center gap-3 bg-black text-[11px] font-bold uppercase tracking-widest text-white transition-colors duration-300 hover:bg-[#FF8201]">
                УЗНАТЬ БОЛЬШЕ <Plus className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="w-full md:hidden">
          <div className="sticky top-0 z-30 border-b border-black/[0.06] bg-[#f3f3f1] px-[6%] pb-5 pt-14">
            <div className="text-[14vw] font-black uppercase leading-[0.75] tracking-tighter">
              <div>КТО</div>
              <div className="text-[#FF8201]">МЫ?</div>
            </div>
          </div>
          <div className="space-y-5 px-[6%] pb-6 pt-8">
            {aboutImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.2 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.25, margin: '0px 0px -18% 0px' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative aspect-[4/5] w-full overflow-hidden bg-black/5 sm:aspect-square"
              >
                <img src={img} alt={`Оффроуд проект ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 px-[6%] pb-16"
          >
            <h3 className="mb-1 text-2xl font-bold uppercase tracking-tight">Инженерная эстетика оффроуда</h3>
            <p className="text-base leading-relaxed text-black/60">
              Мы создаем не просто машины, а надежных компаньонов для самых смелых маршрутов. Опыт, надежность и
              японское качество в каждой детали.
            </p>
              <button className="mt-4 flex h-[70px] w-full cursor-pointer items-center justify-center gap-3 bg-black text-[11px] font-bold uppercase tracking-widest text-white transition-colors active:bg-[#FF8201]">
              <Link to="/service"> УЗНАТЬ БОЛЬШЕ <Plus className="h-4 w-4" /> </Link>
            </button>
            

          </motion.div>
        </div>
      </section>
      {/* SECTION 5: SERVICES */}
      <section ref={servicesStickyRef} className="relative w-full bg-[#f3f3f1] text-black md:h-[300vh]">
        <div className="sticky top-0 hidden h-screen w-full flex-col items-center justify-center overflow-hidden py-8 md:flex">
          <div className="mb-8 flex w-[90%] flex-col gap-2 sm:mb-10">
            <h2 className="text-4xl uppercase tracking-tighter text-[#FF8201] sm:text-5xl md:text-[clamp(2.5rem,4.5vw,4rem)]">
              Чем мы занимаемся
            </h2>
          </div>
          <div className="flex w-[90%] flex-col border-t border-black/10">
            {dynamicServices.map((service, index) => (
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

        <div className="w-full px-[6%] py-20 md:hidden">
          <h2 className="text-3xl uppercase tracking-tighter text-[#FF8201] sm:text-4xl">Чем мы занимаемся</h2>
          <div className="mt-10 flex flex-col border-t border-black/10">
            {dynamicServices.map((service, index) => (
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

      {/* SECTION 6: TESTIMONIALS */}
      <section ref={testimonialsRef} className="relative bg-[#020202] md:h-[300vh]">
        {/* Desktop */}
        <div className="hidden md:flex sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden">
          <div className="mb-16 px-[5%]">
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-6xl text-white">
              Несколько слов <br /><span className="text-[#FF8201]">от наших клиентов</span>
            </h2>
          </div>
          <motion.div style={{ x: testimonialsX }} className="flex gap-10 px-[5%] w-max">
            {testimonialsData.map((testimonial, i) => (
              <TestimonialCard
                key={i}
                quote={testimonial.quote}
                name={testimonial.name}
                car={testimonial.car}
              />
            ))}
            <a href="maps.yandex.ru" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors text-[6vh]">
              {' '}
              все отзывы{' '}
            </a>
          </motion.div>
        </div>

        {/* Mobile */}
        <div className="md:hidden w-full px-[6%] py-20">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
            Несколько слов <br />
            <span className="text-[#FF8201]">от наших клиентов</span>
          </h2>

          <div
            ref={testimonialsCarouselRef}
            className="mt-10 overflow-x-auto snap-x snap-mandatory pb-4 -mx-[6%] px-[6%]"
          >
            <div className="flex gap-4 w-max">
              {testimonialsData.map((testimonial, i) => (
                <div
                  key={i}
                  data-testimonial-slide
                  className="snap-start flex-none"
                  style={{ width: 'min(85vw, 380px)' }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: activeTestimonialIndex === i ? 1 : 0.98,
                      opacity: activeTestimonialIndex === i ? 1 : 0.75
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    <TestimonialCard
                      quote={testimonial.quote}
                      name={testimonial.name}
                      car={testimonial.car}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <a
            href="maps.yandex.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 block text-white hover:text-gray-300 transition-colors text-base font-semibold"
          >
            все отзывы
          </a>
        </div>
      </section>

      {/* SECTION 7: CONTACT FORM */}
      <section className="relative flex w-full flex-col items-center bg-[#020202] py-32 border-t border-white/10">
        <div className="flex w-[90%] flex-col">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-3xl font-bold uppercase tracking-tighter text-[#FF8201] md:text-5xl"
          >
            Оставьте заявку и мы вам позвоним
          </motion.h3>
          <form
            className="flex w-full flex-col items-end gap-10 md:flex-row md:items-center"
            onSubmit={handleCallbackSubmit}
          >
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={callbackForm.website}
              onChange={(e) => handleCallbackChange('website', e.target.value)}
              className="absolute -left-[9999px] h-px w-px opacity-0"
            />
            <div className="flex w-full flex-1 gap-10 flex-col md:flex-row">
              <InputField
                label="Ваше Имя"
                type="text"
                required
                disabled={callbackSubmitting}
                value={callbackForm.name}
                onChange={(e) => handleCallbackChange('name', e.target.value)}
              />
              <InputField
                label="Телефон"
                type="tel"
                required
                disabled={callbackSubmitting}
                value={callbackForm.phone}
                onChange={(e) => handleCallbackChange('phone', e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={callbackSubmitting}
              className="group flex h-[min(80px,10vh)] w-[min(300px,90vw)] flex-shrink-0 cursor-pointer items-center justify-center gap-4 bg-[#FF8201] text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white"
            >
              {callbackSubmitting ? 'Отправка…' : 'Отправить заявку'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
            </motion.button>
            {callbackSuccess && (
              <p className="w-full text-sm text-emerald-400/90 mt-4 md:mt-0 md:ml-auto" role="status">
                Заявка отправлена. Мы свяжемся с вами в ближайшее время.
              </p>
            )}
            {callbackError && (
              <p className="w-full text-sm text-red-400/90 mt-4 md:mt-0 md:ml-auto" role="alert">
                {callbackError}
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  )
}

export default MainPage