import type { FC } from 'react'
import type { Dispatch, SetStateAction } from 'react'
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

const panelClassName =
  'glass-header flex h-16 w-[12.5rem] shrink-0 items-center justify-center rounded-[0.2rem] border border-white/10 px-2 shadow-xl sm:h-[4.25rem] sm:w-[13.25rem] sm:px-3'

const linksPanelClassName =
  'glass-header flex h-16 shrink-0 items-center gap-4 rounded-[0.2rem] border border-white/10 px-4 shadow-xl sm:h-[4.25rem] sm:gap-5 sm:px-6'

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
    const getBackgroundColor = (el: HTMLElement | null): string | null => {
      while (el) {
        const style = window.getComputedStyle(el)
        const bg = style.backgroundColor
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          return bg
        }
        el = el.parentElement
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
      { threshold: 0, rootMargin: '0px' }
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [location.pathname])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && !pastHero) setIsMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [pastHero])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <motion.header
      className="fixed inset-x-0 top-3 z-[999] flex justify-center px-3 sm:top-5 "
      initial={false}
      animate={{ color: isDarkBackground ? '#ffffff' : '#0a0a0a' }}
      transition={colorTransition}
    >
      <nav
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 md:justify-center md:gap-5"
        aria-label="Основная навигация"
      >
        <div className={panelClassName}>
          <Link
            to="/"
            className="flex max-h-full w-full items-center justify-center text-inherit leading-none"
            aria-label="PickupService"
          >
            <PickupLogo className="h-[3rem] w-auto max-w-[min(11.5rem,calc(100%-4px))] sm:h-[3.5rem] sm:max-w-[min(12rem,calc(100%-8px))]" />
          </Link>
        </div>

        <AnimatePresence mode="wait">
          !showBurger ? (
            <motion.ul
              key="desktop-links"
              role="list"
              className={`${linksPanelClassName} hidden text-[13px] sm:text-[15px] md:flex`}
              variants={desktopLinksVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={swapTransition}
            >
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="whitespace-nowrap text-inherit transition-opacity duration-300 hover:opacity-75">
                    {label}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )
        </AnimatePresence>

        <motion.div
          className={`relative z-[1] flex shrink-0 md:hidden ${panelClassName}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: easeSwap }}
        >
          <BurgerMenuButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <Dropdown isOpen={isMenuOpen} onNavigate={closeMenu} layout="mobile" />
        </motion.div>
      </nav>
    </motion.header>
  )
}

type BurgerMenuButtonProps = {
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
}

const BurgerMenuButton: FC<BurgerMenuButtonProps> = ({ isMenuOpen, setIsMenuOpen }) => (
  <button
    type="button"
    className="flex size-11 items-center justify-center rounded-sm text-inherit transition-opacity duration-300 hover:opacity-75 cursor-pointer"
    aria-expanded={isMenuOpen}
    aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
    onClick={() => setIsMenuOpen((open) => !open)}
  >
    {isMenuOpen ? <X className="size-6" strokeWidth={2} aria-hidden /> : <Menu className="size-6" strokeWidth={2} aria-hidden />}
  </button>
)

type DropdownProps = {
  isOpen: boolean
  onNavigate: () => void
  layout: 'desktop' | 'mobile'
}

const Dropdown: FC<DropdownProps> = ({ isOpen, onNavigate, layout }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.99 }}
        transition={{ duration: 0.34, ease: easeSwap }}
        className={
          layout === 'desktop'
            ? 'absolute left-1/2 top-full z-[1000] mt-3 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2'
            : 'absolute right-0 top-full z-[1000] mt-3 w-[min(20rem,calc(100vw-1.5rem))]'
        }
      >
        <div className="glass-header rounded-sm border border-white/10 shadow-xl backdrop-blur">
          <ul className="flex flex-col gap-0.5 px-4 py-3 text-[14px] sm:text-[15px]">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="block py-2 text-inherit transition-opacity duration-300 hover:opacity-75" onClick={onNavigate}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default Header
