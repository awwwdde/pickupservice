import type { FC, Dispatch, SetStateAction, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Send } from 'lucide-react'
import PickupLogo from './PickupLogo.tsx'
import { isPrerenderEnv } from '../../utils/isPrerender'
import { fetchContactSettings } from '../../api/backend'

const navLinks = [
  // { to: '/service', label: 'Сервис' },
  { to: '/portfolio', label: 'Портфолио' },
  { to: '/contact', label: 'Контакты' },
  { to: '/booking', label: 'Записаться' },
] as const

const linksPanelClassName =
  'glass-header inline-flex items-center gap-4 rounded-[0.2rem] border border-white/10 px-5 py-2 shadow-xl sm:gap-5 sm:px-6 sm:py-2.5'

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

  return (
    <motion.header
      className="fixed inset-x-0 top-3 z-[999] flex justify-center sm:top-5"
      animate={{
        color: isDarkBackground ? '#ffffff' : '#0a0a0a',
        opacity: pastHero ? 0.95 : 1,
      }}
      transition={colorTransition}
    >
      <nav className="relative w-full flex items-center justify-between" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
        {/* LEFT: LOGO */}
        <Link
          to="/"
          className="flex shrink-0 items-center justify-center text-inherit leading-none"
          aria-label="PickupService"
        >
          <PickupLogo className="h-[3rem] w-auto sm:h-[3.5rem]" />
        </Link>

        {/* CENTER: NAVIGATION LINKS (DESKTOP) - Absolutely centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.ul
              className={`${linksPanelClassName} justify-center text-[15px] sm:text-[17px] md:text-[18px]`}
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
        <div className="hidden md:flex flex-shrink-0">
          <div className={`${linksPanelClassName} flex-row items-center gap-4 text-[15px] sm:text-[17px] md:text-[18px]`}>
            <a
              href={`tel:${contact.phoneTel}`}
              className="font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
              title="Позвоните нам"
            >
              {contact.phoneDisplay}
            </a>
            <span className="text-white/70 whitespace-nowrap">
              {contact.address}
            </span>
            {contact.telegramUrl && (
              <a
                href={contact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-[0.2rem] bg-[#FF8201] border border-white/15 transition-opacity hover:opacity-70 shadow-xl"
                title="Telegram"
              >
                <Send size={14} className="text-white" />
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
        <div className="flex shrink-0 items-center justify-end md:hidden">
          <div className="glass-header flex h-11 w-11 items-center justify-center rounded-[0.2rem] border border-white/15 px-0.5 shadow-xl">
            <BurgerMenuButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          </div>
        </div>
      </nav>

      {/* FULLSCREEN MENU PANEL */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: easeSwap }}
            className="fixed inset-0 z-[10000] flex flex-col justify-between bg-black/95 p-6 backdrop-blur-2xl md:hidden"
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

                <button
                  onClick={closeMenu}
                  className="p-1 hover:opacity-70 transition-opacity"
                >
                  <X size={32} strokeWidth={1.5} className="text-white" />
                </button>
              </div>
            </motion.div>

            {/* LINKS - Forced White Text for dark overlay */}
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
                  <SimpleNavLink to={link.to} onClick={closeMenu}>
                    {link.label}
                  </SimpleNavLink>
                </motion.div>
              ))}
            </motion.div>

            {/* CONTACT INFO - Mobile - PINNED TO BOTTOM */}
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
                <Link
                  to="/booking"
                  className="font-medium hover:opacity-70 transition-opacity"
                  onClick={closeMenu}
                >
                  Записаться
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
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