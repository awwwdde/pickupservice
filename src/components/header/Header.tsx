import type { FC, Dispatch, SetStateAction, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import PickupLogo from './PickupLogo.tsx'

const navLinks = [
  { to: '/service', label: 'Сервис' },
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

  useEffect(() => {
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
  }, [location.pathname])

  // Определяем, светлый или тёмный фон под хедером, и анимируем цвет текста
  useEffect(() => {
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
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <motion.header
      className="fixed inset-x-0 top-3 z-[999] flex justify-center px-3 sm:top-5"
      animate={{
        color: isDarkBackground ? '#ffffff' : '#0a0a0a',
        opacity: pastHero ? 0.95 : 1,
      }}
      transition={colorTransition}
    >
      <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-1 sm:gap-6 md:flex-col md:items-center md:gap-3">
        {/* LOGO без блока, просто ссылка */}
        <Link
          to="/"
          className="flex shrink-0 items-center justify-center text-inherit leading-none"
          aria-label="PickupService"
        >
          <PickupLogo className="h-[3rem] w-auto sm:h-[3.5rem]" />
        </Link>

        {/* ДЕСКТОПНЫЕ ССЫЛКИ (под логотипом на больших экранах) */}
        <div className="hidden items-center justify-center md:flex">
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

        {/* БУРГЕР (справа на мобиле) — компактный блок */}
        <div className="flex shrink-0 items-center justify-end md:hidden">
          <div className="glass-header flex h-11 w-11 items-center justify-center rounded-[0.2rem] border border-white/15 px-0.5 shadow-xl">
          <BurgerMenuButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          </div>
        </div>
      </nav>

      {/* FULLSCREEN MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: easeSwap }}
            className="fixed inset-0 z-[2000] flex flex-col justify-between bg-[#02020202] p-6 md:hidden"
          >
            {/* TOP */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: easeSwap }}
              className="flex justify-between text-white"
            >
              <div>EU</div>

              <div className="flex gap-4 items-center">
                <div>
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>

                <button onClick={() => setIsMenuOpen(false)}>
                  <X />
                </button>
              </div>
            </motion.div>

            {/* LINKS */}
            <motion.div
              className="flex flex-col items-center gap-8 text-2xl text-white"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.15,
                  },
                },
              }}
            >
              {navLinks.map(link => (
                <motion.div
                  key={link.to}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.45, ease: easeSwap }}
                >
                  <SimpleNavLink to={link.to} onClick={closeMenu}>
                    {link.label}
                  </SimpleNavLink>
                </motion.div>
              ))}
            </motion.div>

            <div />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ================= SIMPLE NAV LINK (без магнита) ================= */

const SimpleNavLink: FC<{
  to: string
  children: ReactNode
  onClick?: () => void
}> = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="whitespace-nowrap text-inherit transition-opacity duration-200 hover:opacity-80"
  >
    {children}
  </Link>
)

/* ================= BURGER ================= */

const BurgerMenuButton: FC<{
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
}> = ({ isMenuOpen, setIsMenuOpen }) => (
  <button onClick={() => setIsMenuOpen(prev => !prev)}>
    {isMenuOpen ? <X /> : <Menu />}
  </button>
)

export default Header