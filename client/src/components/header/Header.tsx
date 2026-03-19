import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Header: FC = () => {
  // 1. Устанавливаем true по умолчанию, чтобы хедер был виден сразу
  const [visible, setVisible] = useState(true)
  const [isDarkBackground, setIsDarkBackground] = useState(true)

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

  return (
    <motion.header
      className={`fixed inset-x-0 top-5 z-[999] flex justify-center ${
        isDarkBackground ? 'text-white' : 'text-black'
      }`}
      initial={{ opacity: 1, y: 0 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-center gap-[10px]">
        
        <div className="glass-header header-block text-[16px] font-semibold uppercase tracking-widest">
          <Link to="/">PickupService</Link>
        </div>

        <ul className="glass-header header-block flex items-center gap-[10px] text-[16px]">
          <li>
            <Link to="/service">Сервис</Link>
          </li>
          <li>
            <Link to="/portfolio">Портфолио</Link>
          </li>
          <li>
            <Link to="/contact">Контакты</Link>
          </li>
          <li>
            <Link to="/booking">Записаться</Link>
          </li>
        </ul>

      </nav>
    </motion.header>
  )
}

export default Header