import type { FC, FormEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import {
  fetchAccordionItems,
  fetchProjects,
  fetchServiceGalleryImages,
  fetchTestimonials,
  submitCallbackRequest
} from '../api/backend'
import { Link } from 'react-router-dom'
import NewsHeroBlock from '../components/news/NewsCard'
import { FormToast, type FormToastPayload } from '../components/utils/FormToast'
import { useTabletLayoutMode } from '../hooks/useTabletLayoutMode'
import { isPrerenderEnv } from '../utils/isPrerender'
import '../styles/tablet-adaptive.css'

const words = ['СОЗДАЕМ', 'РЕМОНТИРУЕМ', 'ОБСЛУЖИВАЕМ']
const fallbackAboutImages = [image1, image2, image3, image4]

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
    title: 'Техническое обслуживание',
    subtitle: 'Индивидуальные проекты, переоборудование салона, установка дополнительного света, спальников и экспедиционных багажников.',
    image: image1
  },
  {
    title: 'Полный цикл обслуживания и ремонта',
    subtitle: 'Комплексное ТО, глубокая диагностика ходовой части и двигателя, замена масел и фильтров для японских внедорожников.',
    image: image2
  },
  {
      title: 'Молярные, жестяные и сварочные работы',
      subtitle: 'Усиление подвески, установка лебедок, шноркелей и силовых бамперов для самых экстремальных и суровых условий эксплуатации.',
      image: image3
  },
  {    
    title: 'Подготовка к экспедициям и трофи-рейдам',
    subtitle: 'Усиление подвески, установка лебедок, шноркелей и силовых бамперов для самых экстремальных и суровых условий эксплуатации.',
    image: image3
  }
] as const

type AccordionServiceRow = {
  accordionKey: string
  title: string
  subtitle: string
  image: string
}

function staticServiceRows(): AccordionServiceRow[] {
  return servicesData.map((s, i) => ({
    accordionKey: `static-${i}`,
    title: s.title,
    subtitle: s.subtitle,
    image: s.image as string
  }))
}

type HomeTestimonial = { id: string | number; quote: string; name: string; car: string }

const testimonialsData: HomeTestimonial[] = [
  {
    id: 'local-0',
    quote: "Ребята из Пикапсервис превратили мой обычный крузак в настоящего монстра бездорожья. Качество сварных швов и внимание к деталям просто поражают. Прошел Кольский полуостров без единой поломки.",
    name: "Алексей Смирнов",
    car: "Toyota Land Cruiser 200"
  },
  {
    id: 'local-1',
    quote: "Идеальная работа с подвеской. Машина перестала 'козлить' на грейдере, а энергоемкость теперь позволяет не сбрасывать газ там, где остальные ползут. Лучший сервис для подготовки.",
    name: "Дмитрий Волков",
    car: "Nissan Patrol Y61"
  },
  {
    id: 'local-2',
    quote: "Делали полный ребилд салона и устанавливали спальник с органайзером. Теперь в экспедициях сплю как дома, все вещи на своих местах. Очень грамотный инженерный подход.",
    name: "Михаил Захаров",
    car: "Toyota Hilux"
  }
]

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MainPage: FC = () => {
  const isPrerender = isPrerenderEnv()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const aboutRef = useRef<HTMLDivElement | null>(null)
  const servicesStickyRef = useRef<HTMLDivElement | null>(null)
  const testimonialsRef = useRef<HTMLDivElement | null>(null)
  const aboutCarouselRef = useRef<HTMLDivElement | null>(null)
  const testimonialsCarouselRef = useRef<HTMLDivElement | null>(null)
  const projectsTabletCarouselRef = useRef<HTMLDivElement | null>(null)
  const aboutTabletCarouselRef = useRef<HTMLDivElement | null>(null)
  const servicesTabletCarouselRef = useRef<HTMLDivElement | null>(null)

  const [isMobile, setIsMobile] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [aboutImageIndex, setAboutImageIndex] = useState(0)
  const [activeAboutSlideIndex, setActiveAboutSlideIndex] = useState(0)
  const [aboutImages, setAboutImages] = useState<string[]>(fallbackAboutImages)
  const [activeServiceIndex, setActiveServiceIndex] = useState(0)
  const [activeServiceSlideIndex, setActiveServiceSlideIndex] = useState(0)
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0)
  const [dynamicProjects, setDynamicProjects] = useState(projectsData)
  const [dynamicServices, setDynamicServices] = useState<AccordionServiceRow[]>(staticServiceRows)
  const [displayTestimonials, setDisplayTestimonials] = useState<HomeTestimonial[]>(testimonialsData)
  const [allReviewsUrl, setAllReviewsUrl] = useState('https://yandex.ru/maps/org/pikapservis_msk/121304824267/reviews/?ll=37.679951%2C55.758331&z=16')
  /** ≥1440px — исходная вёрстка проектов (540×620 / 300×440); иначе гибкий ряд без скролла */
  const [projectsLargeDesktop, setProjectsLargeDesktop] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1440px)').matches : false
  )

  const [callbackForm, setCallbackForm] = useState({
    name: '',
    phone: '',
    website: '',
  })
  const [callbackSubmitting, setCallbackSubmitting] = useState(false)
  const [formToast, setFormToast] = useState<FormToastPayload>(null)
  const tabletLayoutMode = useTabletLayoutMode()
  const isTablet = tabletLayoutMode !== 'none'
  const showMobileLikeSections = isMobile
  const showTabletProjects = isTablet
  const showDesktopProjects = !isMobile && !isTablet
  const showTabletSwipeSections = isTablet
  const showDesktopStickySections = !isMobile && !isTablet

  const dismissFormToast = useCallback(() => setFormToast(null), [])

  useEffect(() => {
    if (isPrerender) return
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.75,
      touchMultiplier: 1,
      prevent: (node) => !!(node as HTMLElement).closest?.('[data-lenis-prevent]')
    })
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
  }, [isPrerender])

  useEffect(() => {
    if (isPrerender) return
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => {
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
  }, [isPrerender])

  useEffect(() => {
    if (isPrerender) return
    const mq = window.matchMedia('(min-width: 1440px)')
    const sync = () => setProjectsLargeDesktop(mq.matches)
    sync()
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', sync)
      return () => mq.removeEventListener('change', sync)
    }
    mq.addListener(sync)
    return () => mq.removeListener(sync)
  }, [isPrerender])

  const handleCallbackChange = (key: 'name' | 'phone' | 'website', value: string) => {
    setFormToast(null)
    setCallbackForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCallbackSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (callbackSubmitting) return
    setFormToast(null)
    setCallbackSubmitting(true)
    try {
      await submitCallbackRequest({
        name: callbackForm.name.trim(),
        phone: callbackForm.phone.trim(),
        website: callbackForm.website,
      })
      setFormToast({
        variant: 'success',
        message: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.',
      })
      setCallbackForm({ name: '', phone: '', website: '' })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Не удалось отправить заявку. Проверьте соединение и попробуйте снова.'
      setFormToast({ variant: 'error', message: msg })
    } finally {
      setCallbackSubmitting(false)
    }
  }

  // Скролл-анимации
 
  const { scrollYProgress: aboutProgress } = useScroll({ target: aboutRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: servicesStickyProgress } = useScroll({
    target: servicesStickyRef,
    offset: ['start start', 'end end'],
  })
  const { scrollYProgress: testimonialsProgress } = useScroll({ target: testimonialsRef })

  const springConfig = { stiffness: 50, damping: 20, mass: 1 }
  const smoothAbout = useSpring(aboutProgress, springConfig)
  
  /** Узкий десктоп и планшеты — меньший горизонтальный ход отзывов */
  const testimonialsXRange: [string, string] =
    tabletLayoutMode === 'portrait'
      ? ['3%', '-42%']
      : tabletLayoutMode === 'landscape'
        ? ['4%', '-50%']
        : ['5%', '-56%']
  const testimonialsX = useTransform(testimonialsProgress, [0, 1], testimonialsXRange)
  const aboutCardYRange: [string, string] =
    tabletLayoutMode === 'portrait'
      ? ['55svh', '-90svh']
      : tabletLayoutMode === 'landscape'
        ? ['45svh', '-95svh']
        : ['100svh', '-120svh']
  const aboutCardY = useTransform(smoothAbout, [0, 1], aboutCardYRange)
  const aboutIndexRaw = useTransform(smoothAbout, [0.2, 0.8], [0, aboutImages.length - 1])

  // iPad/планшеты без hover: делаем "сжатую" высоту карточек менее агрессивной,
  // иначе ряд выглядит криво (особенно при align-items:end).
  const projectsCollapsedHeight =
    tabletLayoutMode === 'portrait' ? '90%' : tabletLayoutMode === 'landscape' ? '86%' : '70.97%'
  const tabletFeatureSlideWidth = tabletLayoutMode === 'portrait' ? '82vw' : 'min(68vw, 560px)'
  const tabletFeatureCardHeight = tabletLayoutMode === 'portrait' ? 'min(500px,56vh)' : 'min(460px,54vh)'
  const testimonialSlideWidth = isTablet
    ? tabletLayoutMode === 'portrait'
      ? '82vw'
      : 'min(68vw, 560px)'
    : 'min(85vw, 380px)'

  // iPad/планшеты: активный слайд определяется свайпом как на моб. отзывах
  useEffect(() => {
    if (!showTabletProjects) return
    const container = projectsTabletCarouselRef.current
    if (!container) return

    let rafId: number | null = null
    const updateIndex = () => {
      rafId = null
      const slides = Array.from(container.querySelectorAll<HTMLElement>('[data-project-slide]'))
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
      setActiveProjectIndex(bestIndex)
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
  }, [showTabletProjects])

  useEffect(() => {
    if (!showTabletSwipeSections) return
    const container = aboutTabletCarouselRef.current
    if (!container) return

    let rafId: number | null = null
    const updateIndex = () => {
      rafId = null
      const slides = Array.from(container.querySelectorAll<HTMLElement>('[data-about-tablet-slide]'))
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
      setActiveAboutSlideIndex(bestIndex)
      // 0 — это инфо-слайд, дальше фото
      setAboutImageIndex(Math.max(0, bestIndex - 1))
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
  }, [showTabletSwipeSections])

  useEffect(() => {
    if (!showTabletSwipeSections) return
    const container = servicesTabletCarouselRef.current
    if (!container) return

    let rafId: number | null = null
    const updateIndex = () => {
      rafId = null
      const slides = Array.from(container.querySelectorAll<HTMLElement>('[data-service-tablet-slide]'))
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
      setActiveServiceSlideIndex(bestIndex)
      // 0 — интро-слайд, дальше услуги
      setActiveServiceIndex(Math.max(0, bestIndex - 1))
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
  }, [showTabletSwipeSections])

  useMotionValueEvent(aboutIndexRaw, 'change', (latest) => {
    if (!showDesktopStickySections) return
    setAboutImageIndex(Math.round(latest))
  })

  useMotionValueEvent(servicesStickyProgress, 'change', (latest) => {
    if (!showDesktopStickySections) return
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
    if (aboutImageIndex < aboutImages.length) return
    setAboutImageIndex(0)
  }, [aboutImageIndex, aboutImages.length])

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
    if (isPrerender) return
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
  }, [isPrerender])

  const handleVideoEnd = () => {
    isHeroVideoPlayed = true
  }

  // Смена слов
  useEffect(() => {
    const id = setInterval(() => setCurrentWordIndex(p => (p + 1) % words.length), 2600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (isPrerender) return
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
        if (cancelled) return
        if (!items.length) return
        const sorted = [...items].sort((a, b) => a.order - b.order || a.id - b.id)
        const fromApi: AccordionServiceRow[] = sorted.map((item) => {
          const url = (item.image && String(item.image).trim()) || ''
          return {
            accordionKey: `api-${item.id}`,
            title: item.title,
            subtitle: item.description ?? '',
            image: url || (image1 as string)
          }
        })
        setDynamicServices([...staticServiceRows(), ...fromApi])
      })
      .catch(() => {
        // Фолбэк — локальные карточки.
      })

    fetchServiceGalleryImages()
      .then((items) => {
        if (cancelled || !items.length) return
        const urls = [...items]
          .sort((a, b) => a.order - b.order)
          .map((item) => item.image)
          .filter(Boolean)
        if (!urls.length) return
        setAboutImages(urls)
      })
      .catch(() => {
        // Фолбэк — локальные about-изображения.
      })

    fetchTestimonials()
      .then((data) => {
        if (cancelled || !data?.results?.length) return

        const latestThree = [...data.results]
          .sort((a, b) => {
            const timeA = a.created_at ? Date.parse(a.created_at) : NaN
            const timeB = b.created_at ? Date.parse(b.created_at) : NaN

            // Приоритет: дата создания (если есть), затем id как прокси "последнего добавленного".
            if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) return timeB - timeA
            if (!Number.isNaN(timeA)) return -1
            if (!Number.isNaN(timeB)) return 1
            return b.id - a.id
          })
          .slice(0, 3)

        setDisplayTestimonials(
          latestThree.map((t) => ({
            id: t.id,
            quote: t.quote,
            name: t.name,
            car: t.car || ''
          }))
        )
        const url = data.settings?.yandex_widget_url?.trim()
        if (url) setAllReviewsUrl(url)
      })
      .catch(() => {
        // Фолбэк — testimonialsData из константы.
      })

    return () => {
      cancelled = true
    }
  }, [isPrerender])

  return (
    <div className="tablet-adaptive-main bg-black text-white selection:bg-[#FF8201]">
      
      {/* SECTION 1: HERO */}
      <section id="site-hero" className="relative min-h-[100svh] w-full overflow-hidden">
        <video
          ref={videoRef}
          src={herovid}
          muted
          playsInline
          onEnded={handleVideoEnd}
          // Чтобы видео замерло на последнем кадре, убираем loop (его и не было)
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000`}
        />
        
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center px-[clamp(20px,4vw,48px)] pb-[8.5rem] pt-20 md:pb-[12rem] md:pt-28">
          <motion.h1
            className="flex w-full flex-col items-center justify-center gap-3 text-center text-[clamp(1.45rem,5.5vw,4rem)] font-semibold tracking-tighter uppercase min-[1000px]:max-[1439px]:text-[clamp(1.35rem,4.2vw,3.25rem)] md:flex-row md:items-center md:justify-between md:gap-[clamp(0.75rem,2vw,1.75rem)] md:text-left"
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
                    initial={{ y: '115%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-115%', opacity: 0 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block whitespace-nowrap"
                  >
                    {words[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <span className="leading-none md:ml-auto md:flex-shrink-0 md:text-right">ВНЕДОРОЖНИКИ</span>
          </motion.h1>
        </div>

        <NewsHeroBlock/>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4 md:bottom-6">
          <motion.div
            className="glass-header flex items-center gap-2 px-3 py-1.5 text-[13px] sm:px-4 sm:py-2 sm:text-[14px]"
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

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-18 z-10 px-6 sm:bottom-20 md:bottom-[clamp(7rem,16vh,10rem)] md:px-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col items-start gap-2">
            <span className="pointer-events-none text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 md:text-xs">
              Запишитесь на обслуживание
            </span>
            <Link
              to="/booking"
              className="pointer-events-auto inline-flex items-center gap-2 bg-[#FF8201] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:bg-white md:gap-4 md:px-8 md:py-4 md:text-base md:tracking-[0.12em] lg:px-10 lg:py-5 lg:text-lg"
            >
              Записаться
              <ArrowRight className="h-4 w-4 md:h-6 md:w-6" strokeWidth={2} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: "МЫ ДЕЛАЕМ ВЕЩИ" без блокировки скролла */}
      <section className="relative border-0 border-b-0 bg-[#f3f3f1] py-24 md:py-32 tablet-portrait:py-16 tablet-landscape:py-20">
        <div className="flex min-h-[60svh] w-full items-center justify-center px-[clamp(16px,3.5vw,40px)] text-black sm:px-10 min-[1000px]:max-[1439px]:px-[clamp(16px,3vw,32px)] tablet-portrait:px-[clamp(14px,3.5vw,28px)] tablet-landscape:px-[clamp(16px,3vw,36px)]">
          <div className="max-w-[min(920px,92vw)] text-center text-[clamp(34px,6.5vw,96px)] font-bold italic uppercase leading-[0.9] tracking-tighter min-[1000px]:max-[1439px]:max-w-[min(720px,90vw)] min-[1000px]:max-[1439px]:text-[clamp(28px,calc(4.8vw + 0.5rem),72px)] min-[1440px]:max-w-[min(980px,94vw)] min-[1440px]:text-[clamp(40px,7vw,104px)] tablet-portrait:max-w-[min(640px,88vw)] tablet-portrait:text-[clamp(26px,5.2vw,52px)] tablet-portrait:leading-[0.95] tablet-landscape:max-w-[min(780px,78vw)] tablet-landscape:text-[clamp(28px,4.2vw,64px)]">
            МЫ ДЕЛАЕМ <span className="block text-[#FF8201] md:inline">ВЕЩИ</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: ≥1440px — как изначально (540/300 × 620/440); 768–1439 — flex, чёрный блок уже */}
      <section className="-mt-px flex justify-center overflow-hidden border-0 bg-[#f3f3f1] py-24 md:py-32">
        {/* Desktop (не планшет): hover-ряд */}
        {showDesktopProjects && (
          <div
            className={`hidden h-[min(620px,72vh)] w-full items-end md:flex ${projectsLargeDesktop ? 'justify-center gap-5 px-[5%]' : 'gap-[clamp(8px,1vw,16px)] px-[clamp(18px,3.5vw,4.5rem)]'}`}
            onMouseLeave={() => setActiveProjectIndex(0)}
          >
            {dynamicProjects.map((p, i) => {
              const isInfo = p.type === 'info'
              return (
              <motion.div
                key={i}
                onMouseEnter={() => setActiveProjectIndex(i)}
                onClick={() => setActiveProjectIndex(i)}
                layout={projectsLargeDesktop}
                animate={
                  projectsLargeDesktop
                    ? {
                        width: activeProjectIndex === i ? 540 : 300,
                        height: activeProjectIndex === i ? 620 : 440,
                      }
                    : isInfo
                      ? {
                          flexGrow: 0,
                          flexShrink: 0,
                          flexBasis: 'clamp(200px, 18.5vw, 360px)',
                          height: activeProjectIndex === i ? '100%' : projectsCollapsedHeight,
                        }
                      : {
                          flexGrow: activeProjectIndex === i ? 1.8 : 1,
                          flexBasis: 0,
                          flexShrink: 1,
                          height: activeProjectIndex === i ? '100%' : projectsCollapsedHeight,
                        }
                }
                transition={{ duration: 0.45, ease }}
                className={`relative cursor-pointer overflow-hidden bg-black shadow-[0_18px_50px_-14px_rgba(0,0,0,0.22)] ${projectsLargeDesktop || isInfo ? 'shrink-0' : 'min-w-0'}`}
              >
                {p.type === 'info' ? (
                  <div
                    className={`relative flex h-full w-full flex-col ${projectsLargeDesktop ? 'p-[30px]' : 'px-[clamp(18px,3.2vw,30px)] pb-[clamp(18px,3.2vw,30px)] pt-[clamp(18px,3.2vw,30px)]'}`}
                  >
                    <motion.h2
                      className="mb-4 font-serif leading-[1.1]"
                      animate={{
                        fontSize: projectsLargeDesktop
                          ? activeProjectIndex === i
                            ? '46px'
                            : '34px'
                          : activeProjectIndex === i
                            ? 'clamp(26px, calc(2.1vw + 1rem), 46px)'
                            : 'clamp(20px, calc(1.5vw + 0.75rem), 34px)',
                      }}
                      transition={{ duration: 0.45, ease }}
                    >
                      {p.title}
                    </motion.h2>
                    <AnimatePresence>
                      {activeProjectIndex === i && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-pretty text-[clamp(13px,calc(1.1vw + 0.65rem),15px)] leading-relaxed text-[#a0a0a0]"
                        >
                          {p.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <Link
                      to="/portfolio"
                      className={`absolute flex h-[min(108px,12vh)] cursor-pointer items-center justify-center gap-3 border border-white/5 bg-[#1c1c1c] text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-[#FF8201] ${projectsLargeDesktop ? 'bottom-[15px] left-[15px] right-[15px]' : 'bottom-[clamp(18px,3.2vw,30px)] left-[clamp(18px,3.2vw,30px)] right-[clamp(18px,3.2vw,30px)]'}`}
                    >
                      ВСЕ РАБОТЫ <Plus className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <img src={p.image || ''} className="h-full w-full object-cover opacity-80" alt="" />
                )}
              </motion.div>
              )
            })}
          </div>
        )}

        {/* Tablet: свайп вправо (snap), первый блок по центру */}
        {showTabletProjects && (
          <div
            ref={projectsTabletCarouselRef}
            className="w-full overflow-x-auto snap-x snap-mandatory pb-4 px-[6%]"
            style={{ scrollPaddingLeft: '6%', scrollPaddingRight: '6%' }}
            data-lenis-prevent
          >
            <div className="flex gap-3 w-max">
              {dynamicProjects.map((p, i) => (
                <div
                  key={i}
                  data-project-slide
                  className="snap-start flex-none"
                  style={{ width: tabletFeatureSlideWidth }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: activeProjectIndex === i ? 1 : 0.98,
                      opacity: activeProjectIndex === i ? 1 : 0.78
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    {p.type === 'info' ? (
                      <div className="relative w-full overflow-hidden bg-black shadow-[0_18px_50px_-14px_rgba(0,0,0,0.22)]" style={{ height: tabletFeatureCardHeight }}>
                        <div className="relative flex h-full w-full flex-col px-6 pb-6 pt-6 tablet-portrait:px-7 tablet-portrait:pb-7 tablet-landscape:px-7 tablet-landscape:pb-7">
                          <div className="mb-4 font-serif text-[clamp(30px,4.6vw,44px)] leading-[1.05] text-white">
                            {p.title}
                          </div>
                          <div className="text-[15px] leading-relaxed text-[#a0a0a0]">
                            {p.description}
                          </div>
                          <Link
                            to="/portfolio"
                            className="mt-auto flex h-16 items-center justify-center gap-3 border border-white/5 bg-[#1c1c1c] text-[12px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#FF8201]"
                          >
                            ВСЕ РАБОТЫ <Plus className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full overflow-hidden bg-black shadow-[0_18px_50px_-14px_rgba(0,0,0,0.22)]" style={{ height: tabletFeatureCardHeight }}>
                        <img
                          src={p.image || ''}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0" />
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile: все блоки раскрыты, колонка */}
        <div className={`${showMobileLikeSections ? 'flex' : 'hidden'} w-[90%] flex-col gap-8`}>
          {dynamicProjects.map((p, i) => (
            <div
              key={i}
              className={`overflow-hidden shadow-2xl ${p.type === 'info' ? 'border border-black/10 bg-white' : 'relative min-h-[220px] border border-black/10'}`}
            >
              {p.type === 'info' ? (
                <div className="flex flex-col gap-4 p-6">
                  <h2 className="font-serif text-[32px] leading-tight text-black">{p.title}</h2>
                  <p className="text-[15px] leading-relaxed text-[#a0a0a0]">{p.description}</p>
                  <Link
                    to="/portfolio"
                    className="mt-2 flex h-14 w-full cursor-pointer items-center justify-center gap-3 border border-black/10 bg-[#1c1c1c] text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#FF8201]"
                  >
                    ВСЕ РАБОТЫ <Plus className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="relative min-h-[280px] w-full">
                  <img src={p.image || ''} className="absolute inset-0 h-full w-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: ABOUT */}
      <section
        ref={aboutRef}
        className={`relative bg-[#f3f3f1] text-black ${showDesktopStickySections ? 'md:h-[300vh]' : ''}`}
      >
        {/* Desktop sticky */}
        {showDesktopStickySections && (
        <div className="sticky top-0 hidden h-[100svh] w-full items-center justify-center overflow-hidden px-[5%] md:flex">
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
                <h3 className="mb-4 text-4xl font-bold uppercase tracking-tight">
                  Инженерная эстетика оффроуда
                </h3>
                <p className="text-lg leading-relaxed text-black/60">
                  Мы создаем не просто машины, а надежных компаньонов для самых смелых маршрутов. Опыт, надежность и
                  японское качество в каждой детали. Делаем ремонт и тюнинг внедорожников: от диагностики и ТО до усиления подвески и экспедиционной подготовки.
                </p>
              </div>

              {/* <Link
                to="/service"
                className="flex h-[80px] w-full max-w-[300px] cursor-pointer items-center justify-center gap-3 bg-black text-[11px] font-bold uppercase tracking-widest text-white transition-colors duration-300 hover:bg-[#FF8201] tablet-portrait:h-[72px] tablet-portrait:max-w-none tablet-landscape:h-[70px] tablet-landscape:max-w-[240px] tablet-landscape:flex-shrink-0"
              >
                УЗНАТЬ БОЛЬШЕ <Plus className="h-4 w-4" />
              </Link> */}
            </div>
          </motion.div>
        </div>
        )}

        {/* Tablet: свайп-карусель */}
        {showTabletSwipeSections && (
          <div className="w-full" data-lenis-prevent>
            <div
              ref={aboutTabletCarouselRef}
              className="overflow-x-auto snap-x snap-mandatory pb-4 px-[6%]"
              style={{ scrollPaddingLeft: '6%', scrollPaddingRight: '6%' }}
            >
              <div className="flex gap-3 w-max">
                {/* 0: инфо */}
                <div data-about-tablet-slide className="snap-start flex-none" style={{ width: tabletFeatureSlideWidth }}>
                  <motion.div
                    initial={false}
                    animate={{
                      scale: activeAboutSlideIndex === 0 ? 1 : 0.98,
                      opacity: activeAboutSlideIndex === 0 ? 1 : 0.78,
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative w-full overflow-hidden border border-black/10 bg-white shadow-[0_18px_50px_-14px_rgba(0,0,0,0.18)]" style={{ height: tabletFeatureCardHeight }}>
                      <div className="flex h-full w-full flex-col px-7 pb-7 pt-7">
                        <div className="text-[clamp(2.4rem,7vw,4.4rem)] font-black uppercase leading-[0.86] tracking-tighter text-black">
                          <div>КТО</div>
                          <div className="text-[#FF8201]">МЫ?</div>
                        </div>
                        <h3 className="mt-6 text-[clamp(1.35rem,3.6vw,2rem)] font-bold uppercase tracking-tight text-black">
                          Инженерная эстетика оффроуда
                        </h3>
                        <p className="mt-4 text-[clamp(0.98rem,2.2vw,1.1rem)] leading-relaxed text-black/60">
                          Мы создаем не просто машины, а надежных компаньонов для самых смелых маршрутов. Опыт, надежность и японское качество в каждой детали. Делаем ремонт и тюнинг внедорожников: от диагностики и ТО до усиления подвески и экспедиционной подготовки.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {aboutImages.map((img, i) => (
                  <div
                    key={img + i}
                    data-about-tablet-slide
                    className="snap-start flex-none"
                    style={{ width: tabletFeatureSlideWidth }}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        scale: activeAboutSlideIndex === i + 1 ? 1 : 0.98,
                        opacity: activeAboutSlideIndex === i + 1 ? 1 : 0.78,
                      }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="relative w-full overflow-hidden bg-black/5 shadow-[0_18px_50px_-14px_rgba(0,0,0,0.18)]" style={{ height: tabletFeatureCardHeight }}>
                        <img src={img} alt={`Оффроуд проект ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile */}
        <div className={`${showMobileLikeSections ? 'block' : 'hidden'} w-full`}>
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
              Мы создаем не просто машины, а надежных компаньонов для самых смелых маршрутов. Опыт, надежность и японское качество в каждой детали. Делаем ремонт и тюнинг внедорожников: диагностика, ТО и модернизация под бездорожье.
            </p>
              {/* <Link
                to="/service"
                className="mt-4 flex h-[70px] w-full cursor-pointer items-center justify-center gap-3 bg-black text-[11px] font-bold uppercase tracking-widest text-white transition-colors active:bg-[#FF8201]"
              >
                УЗНАТЬ БОЛЬШЕ <Plus className="h-4 w-4" />
              </Link> */}
            

          </motion.div>
        </div>
      </section>
      {/* SECTION 5: SERVICES */}
      <section
        ref={servicesStickyRef}
        className={`tablet-adaptive-sticky-section relative w-full bg-[#f3f3f1] text-black ${showDesktopStickySections ? 'md:h-[300vh]' : ''} tablet-portrait:py-12 tablet-landscape:py-14`}
      >
        {/* Desktop sticky */}
        {showDesktopStickySections && (
        <div className="tablet-adaptive-sticky-inner sticky top-0 hidden h-[100svh] w-full flex-col items-center justify-center overflow-hidden py-8 min-[1000px]:max-[1439px]:py-6 tablet-portrait:py-6 tablet-landscape:py-5 tablet-landscape:justify-start tablet-landscape:pt-[clamp(4.5rem,12vh,6rem)] md:flex">
          <div className="mb-8 flex w-[90%] flex-col gap-2 sm:mb-10 min-[1000px]:max-[1439px]:mb-6 tablet-portrait:mb-6 tablet-landscape:mb-4">
            <h2 className="text-4xl uppercase tracking-tighter text-[#FF8201] sm:text-5xl md:text-[clamp(1.85rem,3.2vw,2.85rem)] min-[1440px]:text-[clamp(2.5rem,4.5vw,4rem)] tablet-portrait:text-[clamp(1.65rem,4.2vw,2.35rem)] tablet-landscape:text-[clamp(1.55rem,3vw,2.15rem)]">
              Чем мы занимаемся
            </h2>
          </div>
          <div className="flex w-[90%] min-[1000px]:max-[1439px]:w-[92%] flex-col border-t border-black/10 tablet-portrait:w-[92%] tablet-landscape:w-[94%] tablet-landscape:max-h-[min(calc(100vh-12rem),560px)] tablet-landscape:overflow-y-auto">
            {dynamicServices.map((service, index) => (
              <ServiceCard
                key={service.accordionKey}
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
        )}

        {/* Tablet: свайп карточек */}
        {showTabletSwipeSections && (
          <div className="w-full" data-lenis-prevent>
            <div className="px-[6%]">
              <h2 className="text-[clamp(1.75rem,4.2vw,2.35rem)] uppercase tracking-tighter text-[#FF8201]">
                Чем мы занимаемся
              </h2>
            </div>
            <div
              ref={servicesTabletCarouselRef}
              className="mt-8 overflow-x-auto snap-x snap-mandatory pb-4 px-[6%]"
              style={{ scrollPaddingLeft: '6%', scrollPaddingRight: '6%' }}
            >
              <div className="flex gap-3 w-max">
                {/* 0: интро */}
                <div data-service-tablet-slide className="snap-start flex-none" style={{ width: tabletFeatureSlideWidth }}>
                  <motion.div
                    initial={false}
                    animate={{
                      scale: activeServiceSlideIndex === 0 ? 1 : 0.98,
                      opacity: activeServiceSlideIndex === 0 ? 1 : 0.78,
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative w-full overflow-hidden border border-black/10 bg-white shadow-[0_18px_50px_-14px_rgba(0,0,0,0.18)]" style={{ height: tabletFeatureCardHeight }}>
                      <div className="flex h-full w-full flex-col px-7 pb-7 pt-7">
                        <div className="text-[clamp(2.2rem,6.4vw,3.8rem)] font-black uppercase leading-[0.9] tracking-tighter text-black">
                          Чем мы
                          <span className="block text-[#FF8201]">занимаемся</span>
                        </div>
                        <p className="mt-5 text-[clamp(1rem,2.2vw,1.1rem)] leading-relaxed text-black/60">
                          Листайте вправо, чтобы посмотреть направления сервиса.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {dynamicServices.map((s, idx) => (
                  <div
                    key={s.accordionKey}
                    data-service-tablet-slide
                    className="snap-start flex-none"
                    style={{ width: tabletFeatureSlideWidth }}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        scale: activeServiceSlideIndex === idx + 1 ? 1 : 0.98,
                        opacity: activeServiceSlideIndex === idx + 1 ? 1 : 0.78,
                      }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="relative w-full overflow-hidden bg-black shadow-[0_18px_50px_-14px_rgba(0,0,0,0.22)]" style={{ height: tabletFeatureCardHeight }}>
                        <img src={s.image} alt={s.title} className="absolute inset-0 h-full w-full object-cover opacity-85" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        <div className="relative flex h-full w-full flex-col justify-end px-7 pb-7">
                          <div className="text-[clamp(18px,2.8vw,26px)] font-black uppercase tracking-tight text-white">
                            {s.title}
                          </div>
                          <div className="mt-3 text-[clamp(0.95rem,2vw,1.05rem)] leading-relaxed text-white/75">
                            {s.subtitle}
                          </div>
                          <div className="mt-5 text-sm font-bold uppercase tracking-widest text-[#FF8201]">
                            0{idx + 1}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile */}
        <div className={`${showMobileLikeSections ? 'block' : 'hidden'} w-full px-[6%] py-20`}>
          <h2 className="text-3xl uppercase tracking-tighter text-[#FF8201] sm:text-4xl">Чем мы занимаемся</h2>
          <div className="mt-10 flex flex-col border-t border-black/10">
            {dynamicServices.map((service, index) => (
              <ServiceCard
                key={service.accordionKey}
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
      <section
        ref={testimonialsRef}
        className={`tablet-adaptive-sticky-section relative bg-[#020202] ${showDesktopStickySections ? 'md:h-[300vh]' : ''} tablet-portrait:py-12 tablet-landscape:py-14`}
      >
        {/* Desktop sticky */}
        {showDesktopStickySections && (
        <div className="tablet-adaptive-sticky-inner sticky top-0 hidden h-[100svh] w-full flex-col justify-center overflow-hidden md:flex tablet-landscape:justify-start tablet-landscape:pt-[clamp(3.5rem,10vh,5rem)]">
          <div className="mb-16 px-[5%] min-[1000px]:max-[1439px]:mb-12 min-[1000px]:max-[1439px]:px-[4%] tablet-portrait:mb-10 tablet-portrait:px-[4%] tablet-landscape:mb-8 tablet-landscape:px-[4%]">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-tight md:text-[clamp(1.65rem,3.4vw,2.6rem)] min-[1440px]:text-6xl min-[1440px]:leading-none tablet-portrait:text-[clamp(1.45rem,4vw,2.1rem)] tablet-landscape:text-[clamp(1.4rem,2.6vw,1.95rem)] tablet-landscape:leading-tight">
              Несколько слов <br />
              <span className="text-[#FF8201]">от наших клиентов</span>
            </h2>
          </div>
          <motion.div style={{ x: testimonialsX }} className="flex w-max gap-10 px-[5%] min-[1000px]:max-[1439px]:gap-6 min-[1000px]:max-[1439px]:px-[4%] tablet-portrait:gap-7 tablet-portrait:px-[4%] tablet-landscape:gap-5 tablet-landscape:px-[4%]">
            {displayTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                quote={testimonial.quote}
                name={testimonial.name}
                car={testimonial.car}
              />
            ))}
            <a
              href={allReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[clamp(1.75rem,5.5vh,3.75rem)] text-white transition-colors hover:text-gray-300 min-[1000px]:max-[1439px]:text-[clamp(1.5rem,4.2vh,2.75rem)] tablet-portrait:text-[clamp(1.35rem,3.8vh,2.25rem)] tablet-landscape:self-center tablet-landscape:text-[clamp(1.25rem,3.2vh,2rem)]"
            >
              {' '}
              все отзывы{' '}
            </a>
          </motion.div>
        </div>
        )}

        {/* Tablet + Mobile: свайп */}
        {(showMobileLikeSections || showTabletSwipeSections) && (
        <div className="w-full px-[6%] py-20">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
            Несколько слов <br />
            <span className="text-[#FF8201]">от наших клиентов</span>
          </h2>

          <div
            ref={testimonialsCarouselRef}
            className="mt-10 overflow-x-auto snap-x snap-mandatory pb-4 -mx-[6%] px-[6%]"
            style={{ scrollPaddingLeft: '6%', scrollPaddingRight: '6%' }}
          >
            <div className="flex gap-4 w-max">
              {displayTestimonials.map((testimonial, slideIndex) => (
                <div
                  key={testimonial.id}
                  data-testimonial-slide
                  className="snap-start flex-none"
                  style={{ width: testimonialSlideWidth }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: activeTestimonialIndex === slideIndex ? 1 : 0.98,
                      opacity: activeTestimonialIndex === slideIndex ? 1 : 0.75
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
            href={allReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 block text-white hover:text-gray-300 transition-colors text-base font-semibold"
          >
            все отзывы
          </a>
        </div>
        )}
      </section>

      {/* SECTION 7: CONTACT FORM */}
      <section className="tablet-adaptive-contact-section relative flex w-full flex-col items-center bg-[#020202] py-32 border-t border-white/10 tablet-portrait:py-20 tablet-landscape:py-24">
        <div className="flex w-[90%] flex-col tablet-portrait:w-[92%] tablet-landscape:w-[92%]">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-3xl font-bold uppercase tracking-tighter text-[#FF8201] md:text-5xl tablet-portrait:mb-12 tablet-portrait:text-[clamp(1.5rem,4vw,2.75rem)] tablet-landscape:mb-10 tablet-landscape:text-[clamp(1.45rem,3.2vw,2.5rem)]"
          >
            Оставьте заявку
          </motion.h3>
          <form
            className="flex w-full flex-col items-end gap-10 md:flex-row md:items-center tablet-portrait:gap-8 tablet-landscape:gap-8 tablet-landscape:items-center"
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
          </form>
        </div>
      </section>

      <FormToast toast={formToast} onDismiss={dismissFormToast} durationMs={5000} />
    </div>
  )
}

export default MainPage