import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'


const Header: FC = () => {
  const [isDarkBackground, setIsDarkBackground] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <motion.header
      className={`fixed inset-x-0 top-3 sm:top-5 z-[999] flex justify-center px-3 ${
        isDarkBackground ? 'text-white' : 'text-black'
      }`}
    >
      <nav className="mx-auto relative flex w-full max-w-6xl items-center justify-between md:justify-center gap-2 sm:gap-[10px]">

        <div className="glass-header header-block text-[12px] sm:text-[16px] font-semibold uppercase tracking-widest whitespace-nowrap">
          <Link to="/">PickupService</Link>
        </div>

        {/* Desktop nav */}
        <ul className="hidden md:flex glass-header header-block items-center gap-3 sm:gap-[10px] text-[12px] sm:text-[16px]">
          <li><Link to="/service">Сервис</Link></li>
          <li><Link to="/portfolio">Портфолио</Link></li>
          <li><Link to="/contact">Контакты</Link></li>
          <li><Link to="/booking">Записаться</Link></li>
        </ul>

        {/* Mobile burger */}
        

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="md:hidden absolute left-0 top-full w-full mt-3 px-3"
            >
              <div className="glass-header w-full rounded-sm border border-white/10 backdrop-blur">
                <ul className="flex flex-col px-3 py-4 gap-3 text-[14px]">
                  <li>
                    <Link to="/service" onClick={() => setIsMenuOpen(false)}>
                      Сервис
                    </Link>
                  </li>
                  <li>
                    <Link to="/portfolio" onClick={() => setIsMenuOpen(false)}>
                      Портфолио
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                      Контакты
                    </Link>
                  </li>
                  <li>
                    <Link to="/booking" onClick={() => setIsMenuOpen(false)}>
                      Записаться
                    </Link>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </motion.header>
  )
}

export default Header