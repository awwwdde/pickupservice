import type { FC, Dispatch, SetStateAction, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Send } from 'lucide-react'
import { createPortal } from 'react-dom'
import PickupLogo from './PickupLogo.tsx'
import { isPrerenderEnv } from '../../utils/isPrerender'
import { fetchContactSettings } from '../../api/backend'

const navLinks = [
  // { to: '/service', label: 'Сервис' },
  { to: '/portfolio', label: 'Проекты' },
  { to: '/contact', label: 'Контакты' },
  { to: '/booking', label: 'Записаться' },
] as const

const linksPanelClassName =
  'glass-header inline-flex items-center gap-4 rounded-[0.2rem] border border-white/10 px-5 py-2 shadow-xl sm:gap-5 sm:px-6 sm:py-2.5 tablet-portrait:gap-3.5 tablet-portrait:px-4 tablet-portrait:py-2 tablet-landscape:gap-4 tablet-landscape:px-5 tablet-landscape:py-2'
const desktopPanelTypographyClassName =
  'text-[15px] sm:text-[17px] md:text-[18px] min-[1000px]:max-[1279px]:text-[16px] tablet-portrait:text-[15px] tablet-landscape:text-[16px]'
const compactContactPanelClassName =
  'glass-header inline-flex items-center gap-3 rounded-[0.2rem] border border-white/10 px-3.5 py-1.5 text-[12px] shadow-xl sm:gap-3.5 sm:px-4 sm:py-2 sm:text-[13px] md:text-[14px] min-[1000px]:max-[1279px]:gap-2.5 min-[1000px]:max-[1279px]:px-3 min-[1000px]:max-[1279px]:py-1.5 min-[1000px]:max-[1279px]:text-[12px] tablet-portrait:gap-2 tablet-portrait:px-3 tablet-portrait:py-1.5 tablet-portrait:text-[12px] tablet-landscape:gap-2.5 tablet-landscape:px-3.5 tablet-landscape:py-1.5 tablet-landscape:text-[12px]'
const topContactPanelClassName =
  'glass-header inline-flex items-center gap-3 rounded-[0.2rem] border border-white/10 px-3 py-1.5 text-[12px] shadow-xl'

const easeSwap = [0.33, 1, 0.68, 1] as const

const desktopLinksVariants = {
  initial: { opacity: 0, x: 14, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -10, filter: 'blur(3px)' },
}

const swapTransition = { duration: 0.58, ease: easeSwap }
const colorTransition = { duration: 0.55, ease: easeSwap }

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
      // CRITICAL: If menu is open, do not recalculate. Keep the last known "good" color.
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
  }, [isMenuOpen, isPrerender]) // Re-run when menu state changes to lock/unlock detection

  const closeMenu = () => setIsMenuOpen(false)

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
        <nav className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-[clamp(14px,3vw,28px)] tablet-portrait:px-[clamp(12px,3.5vw,20px)] tablet-landscape:px-[clamp(16px,2.8vw,26px)]">
        {/* LEFT: LOGO */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex shrink-0 items-center justify-center text-inherit leading-none"
          aria-label="PickupService"
        >
          <PickupLogo className="h-[2.75rem] w-auto sm:h-[3.2rem] tablet-portrait:h-[2.6rem] tablet-landscape:h-[2.75rem]" />
        </Link>

        {/* CENTER: NAVIGATION LINKS (DESKTOP) - Absolutely centered */}
        <div className="hidden items-center justify-center min-[1100px]:flex">
          <AnimatePresence mode="wait">
            <motion.ul
              className={`${linksPanelClassName} ${desktopPanelTypographyClassName} justify-center`}
              variants={desktopLinksVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={swapTransition}
            >
              {navLinks.map((link) => (
                <li key={link.to}>
                  <SimpleNavLink to={link.to}>{link.label}</SimpleNavLink>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>

        {/* RIGHT: CONTACT INFO (DESKTOP) - ROW LAYOUT */}
        <div className="hidden justify-end min-[1360px]:flex flex-shrink-0">
          <div
            className={compactContactPanelClassName}
          >
            <a
              href={`tel:${contact.phoneTel}`}
              className="font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
              title="Позвоните нам"
            >
              {contact.phoneDisplay}
            </a>
            <span className="whitespace-nowrap">
              {contact.address}
            </span>
            {contact.telegramUrl && (
              <a
                href={contact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-inherit transition-opacity hover:opacity-70"
                title="Telegram"
              >
                <Send size={14} />
              </a>
            )}
            <Link
              to="/booking"
              className="font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
            >
              Записаться
            </Link>
          </div>
        </div>

        {/* BURGER BUTTON (MOBILE) */}
        <div className="flex shrink-0 items-center justify-end min-[1100px]:hidden">
          <div className="glass-header flex h-11 w-11 items-center justify-center rounded-[0.2rem] border border-white/15 px-0.5 shadow-xl tablet-portrait:h-10 tablet-portrait:w-10">
            <BurgerMenuButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          </div>
        </div>
      </nav>
      </motion.header>

      {/* Мобильное полноэкранное меню — в портале, чтобы не ломалось z-index на iPad */}
      <div className="min-[1100px]:hidden">
        <MobileMenuPortal isOpen={isMenuOpen} onClose={closeMenu} contact={contact} />
      </div>
      <div className="pointer-events-none fixed inset-x-0 top-[4.8rem] z-[998] hidden justify-center px-4 min-[1100px]:flex min-[1360px]:hidden">
        <div className={topContactPanelClassName}>
          <a
            href={`tel:${contact.phoneTel}`}
            className="pointer-events-auto font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
            title="Позвоните нам"
          >
            {contact.phoneDisplay}
          </a>
          {contact.telegramUrl && (
            <a
              href={contact.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto flex h-5 w-5 flex-shrink-0 items-center justify-center text-inherit transition-opacity hover:opacity-70"
              title="Telegram"
            >
              <Send size={14} />
            </a>
          )}
          <Link
            to="/booking"
            className="pointer-events-auto font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
          >
            Записаться
          </Link>
        </div>
      </div>
    </>
  )
}

const MobileMenuPortal: FC<{
  isOpen: boolean
  onClose: () => void
  contact: {
    phoneDisplay: string
    phoneTel: string
    telegramUrl: string
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
          {/* TOP BAR */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: easeSwap }}
            className="flex justify-between items-center text-white/80"
          >
            <div className="text-sm tracking-widest font-medium">EU</div>

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

          {/* LINKS */}
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

          {/* CONTACT INFO */}
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
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: easeSwap }}
              className="text-white/70"
            >
              {contact.address}
            </motion.span>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: easeSwap }}
              className="flex items-center gap-4 pt-2"
            >
              {contact.telegramUrl && (
                <a
                  href={contact.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-[0.2rem] bg-[#FF8201] border border-white/15 transition-opacity hover:opacity-70"
                >
                  <Send size={18} className="text-white" />
                </a>
              )}
              <Link to="/booking" className="font-medium hover:opacity-70 transition-opacity" onClick={onClose}>
                Записаться
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ================= SIMPLE NAV LINK ================= */

const SimpleNavLink: FC<{
  to: string
  children: ReactNode
  onClick?: () => void
}> = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="whitespace-nowrap text-inherit transition-opacity duration-200 hover:opacity-70"
  >
    {children}
  </Link>
)

/* ================= BURGER BUTTON ================= */

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