import type { FC, Dispatch, SetStateAction, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, MapPin } from 'lucide-react'
import { createPortal } from 'react-dom'
import PickupLogo from './PickupLogo.tsx'
import { isPrerenderEnv } from '../../utils/isPrerender'
import { fetchContactSettings } from '../../api/backend'

const navLinks = [
  { to: '/portfolio', label: 'Проекты' },
  { to: '/contact', label: 'Контакты' },
] as const

const addressPanelClassName =
  'inline-flex items-center gap-2 py-2.5 text-[12px] sm:text-[13px] tablet-landscape:text-[14px] lg:text-[14px]'
const centerPanelClassName =
  'inline-flex items-center gap-4 rounded-[0.2rem] px-5 py-2 text-[13px] font-medium tablet-portrait:px-6 tablet-portrait:py-2.5 tablet-landscape:px-6 tablet-landscape:py-2.5 tablet-landscape:text-[14px] lg:px-6 lg:py-2.5 lg:text-[14px]'
const rightPanelClassName =
  'inline-flex items-center gap-2 rounded-[0.2rem] px-4 py-2 text-[13px] font-medium tablet-portrait:py-2.5 tablet-landscape:py-2.5 tablet-landscape:text-[14px] lg:py-2.5 lg:text-[14px]'

const easeSwap = [0.33, 1, 0.68, 1] as const

const colorTransition = { duration: 0.55, ease: easeSwap }
const yandexMapUrl = 'https://yandex.ru/maps/?text=Москва%2C%20улица%20Самокатная%203%2F8%2C%20с1А'
const telegramIconUrl = 'https://icons.getbootstrap.com/assets/icons/telegram.svg'
const maxIconUrl = 'https://upload.wikimedia.org/wikipedia/commons/1/12/%D0%9B%D0%BE%D0%B3%D0%BE%D1%82%D0%B8%D0%BF_MAX.svg'

const Header: FC = () => {
  const location = useLocation()
  const [isDarkBackground, setIsDarkBackground] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const isPrerender = isPrerenderEnv()
  const [contact, setContact] = useState({
    phoneDisplay: '+7 985 923 47 77',
    phoneTel: '+79859234777',
    telegramUrl: 'https://t.me/Pickupservice_Moscow',
    maxUrl: 'https://max.ru/join/59jJOJzaZzcmPjaHHXVgMIzq9YUShK916qO09lWobWE',
    address: 'Москва, улица Самокатная 3/8, с1А'
  })

  // 1. Hero Visibility Observer
  useEffect(() => {
    if (isPrerender) return
    const hero = document.getElementById('site-hero')
    if (!hero) {
      setPastHero(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPastHero(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [location.pathname, isPrerender])

  // Fetch contact settings
  useEffect(() => {
    if (isPrerender) return
    let cancelled = false

    fetchContactSettings()
      .then((data) => {
        if (cancelled) return
        setContact({
          phoneDisplay: data.phone_display || '+7 985 923 47 77',
          phoneTel: data.phone_tel || '+79859234777',
          telegramUrl: data.telegram_url || 'https://t.me/Pickupservice_Moscow',
          maxUrl: 'https://max.ru/join/59jJOJzaZzcmPjaHHXVgMIzq9YUShK916qO09lWobWE',
          address: 'Москва, улица Самокатная 3/8, с1А'
        })
      })
      .catch(() => {
        // Keep default values
      })

    return () => {
      cancelled = true
    }
  }, [isPrerender])

  // 2. Dynamic Color Detection
  useEffect(() => {
    if (isPrerender) return
    const getBackgroundColor = (el: HTMLElement | null): string | null => {
      let current: HTMLElement | null = el
      while (current) {
        const style = window.getComputedStyle(current)
        const bg = style.backgroundColor
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          return bg
        }
        current = current.parentElement
      }
      return null
    }

    const isDarkColor = (color: string): boolean => {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!match) return true
      const r = parseInt(match[1], 10)
      const g = parseInt(match[2], 10)
      const b = parseInt(match[3], 10)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return luminance < 0.5
    }

    const updateBackground = () => {
      if (isMenuOpen) return

      const header = document.querySelector('header')
      if (!header) return
      const rect = header.getBoundingClientRect()
      const x = window.innerWidth / 2
      const y = rect.bottom + 1
      const target = document.elementFromPoint(x, y) as HTMLElement | null
      if (!target) return
      const bg = getBackgroundColor(target)
      if (!bg) return
      setIsDarkBackground(isDarkColor(bg))
    }

    updateBackground()
    window.addEventListener('scroll', updateBackground)
    window.addEventListener('resize', updateBackground)
    return () => {
      window.removeEventListener('scroll', updateBackground)
      window.removeEventListener('resize', updateBackground)
    }
  }, [isMenuOpen, isPrerender])

  const closeMenu = () => setIsMenuOpen(false)
  const circleBg = pastHero ? '#FF8201' : isDarkBackground ? 'rgba(255, 255, 255, 0.14)' : 'rgba(10, 10, 10, 0.14)'

  const handleLogoClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (isPrerender) return
    if (location.pathname === '/') {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-3 z-[999] flex justify-center sm:top-5"
        animate={{
          color: isDarkBackground ? '#ffffff' : '#0a0a0a',
          opacity: pastHero ? 0.95 : 1,
        }}
        transition={colorTransition}
      >
        <nav className="relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-[clamp(14px,3vw,28px)] tablet-portrait:px-[clamp(12px,3.5vw,20px)] tablet-landscape:px-[clamp(16px,2.8vw,26px)]">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex shrink-0 items-center justify-center text-inherit leading-none"
            aria-label="PickupService"
          >
            <PickupLogo className="h-[3rem] w-auto sm:h-[3.45rem] tablet-portrait:h-[3.2rem] tablet-landscape:h-[3.45rem] lg:h-[3.7rem]" />
          </Link>
          <a
            href={yandexMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${addressPanelClassName} hidden min-[1300px]:inline-flex`}
            title="Открыть адрес в Яндекс Картах"
          >
            <MapPin size={14} />
            <span className="whitespace-nowrap">{contact.address}</span>
          </a>
        </div>

        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 min-[1100px]:flex items-center justify-center">
          <div className={centerPanelClassName}>
            {navLinks.map((link) => (
              <SimpleNavLink key={link.to} to={link.to} className="font-medium uppercase tracking-[0.08em]">
                {link.label}
              </SimpleNavLink>
            ))}
          </div>
        </div>

        <div className="hidden shrink-0 items-center justify-end min-[1100px]:flex">
          <div className={rightPanelClassName}>
            <motion.a
              href={contact.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              animate={{ backgroundColor: circleBg }}
              transition={colorTransition}
              title="Telegram"
            >
              <img src={telegramIconUrl} alt="Telegram" className="h-4 w-4 grayscale contrast-200" />
            </motion.a>
            <motion.a
              href={contact.maxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              animate={{ backgroundColor: circleBg }}
              transition={colorTransition}
              title="MAX"
            >
              <img src={maxIconUrl} alt="MAX" className="h-4 w-4 grayscale contrast-200" />
            </motion.a>
            <a
              href={`tel:${contact.phoneTel}`}
              className="font-medium whitespace-nowrap transition-opacity hover:opacity-70"
              title="Позвоните нам"
            >
              {contact.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end min-[1100px]:hidden">
          <div className="glass-header flex h-11 w-11 items-center justify-center rounded-[0.2rem] px-0.5 shadow-xl tablet-portrait:h-11 tablet-portrait:w-11 tablet-landscape:h-12 tablet-landscape:w-12">
            <BurgerMenuButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          </div>
        </div>
      </nav>
      </motion.header>

      <div className="min-[1100px]:hidden">
        <MobileMenuPortal isOpen={isMenuOpen} onClose={closeMenu} contact={contact} />
      </div>
    </>
  )
}

/* ================= Вспомогательные компоненты ================= */

const MobileMenuPortal: FC<{
  isOpen: boolean
  onClose: () => void
  contact: {
    phoneDisplay: string
    phoneTel: string
    telegramUrl: string
    maxUrl: string
    address: string
  }
}> = ({ isOpen, onClose, contact }) => {
  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: easeSwap }}
          className="fixed inset-0 z-[20000] flex flex-col justify-between bg-black/95 p-6 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: easeSwap }}
            className="flex justify-between items-center text-white/80"
          >
            <div className="text-sm tracking-widest font-medium">PS</div>
            <div className="flex gap-6 items-center">
              <div className="text-sm tabular-nums">
                {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity" aria-label="Закрыть меню">
                <X size={32} strokeWidth={1.5} className="text-white" />
              </button>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-8 text-3xl font-light text-white"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
          >
            {navLinks.map((link) => (
              <motion.div
                key={link.to}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: easeSwap }}
              >
                <SimpleNavLink to={link.to} onClick={onClose}>
                  {link.label}
                </SimpleNavLink>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-4 text-white text-sm border-t border-white/10 pt-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.4,
                },
              },
            }}
          >
            <motion.a
              href={`tel:${contact.phoneTel}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: easeSwap }}
              className="font-medium hover:opacity-70 transition-opacity"
            >
              {contact.phoneDisplay}
            </motion.a>
            <motion.a
              href={yandexMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: easeSwap }}
              className="text-center text-white/70"
            >
              {contact.address}
            </motion.a>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: easeSwap }}
              className="flex items-center gap-4 pt-2"
            >
              <a
                href={contact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-70"
              >
                <img src={telegramIconUrl} alt="Telegram" className="h-5 w-5 grayscale contrast-200" />
              </a>
              <a
                href={contact.maxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-70"
              >
                <img src={maxIconUrl} alt="MAX" className="h-5 w-5 grayscale contrast-200" />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

const SimpleNavLink: FC<{
  to: string
  children: ReactNode
  onClick?: () => void
  className?: string
}> = ({ to, children, onClick, className }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`whitespace-nowrap text-inherit transition-opacity duration-200 hover:opacity-70 ${className ?? ''}`}
  >
    {children}
  </Link>
)

const BurgerMenuButton: FC<{
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
}> = ({ isMenuOpen, setIsMenuOpen }) => (
  <button 
    onClick={() => setIsMenuOpen((prev) => !prev)}
    className="flex items-center justify-center w-full h-full text-inherit"
  >
    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
  </button>
)

export default Header