import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'

const Header: FC = () => {
  const [visible, setVisible] = useState(false)
  const { scrollY } = useScroll()

  // Изменяем цвет текста: 
  // от 0 до 80vh — белый
  // от 100vh до 480vh (конец второй секции) — темный #272727
  // после 500vh (третья черная секция) — снова белый
  const textColor = useTransform(
    scrollY,
    [0, window.innerHeight * 0.8, window.innerHeight, window.innerHeight * 4.8, window.innerHeight * 5],
    ["#ffffff", "#ffffff", "#272727", "#272727", "#ffffff"]
  )

  useEffect(() => {
    const handler = () => setVisible(true)
    window.addEventListener('hero-ready', handler)

    return () => {
      window.removeEventListener('hero-ready', handler)
    }
  }, [])

  return (
    <motion.header
      className="fixed inset-x-0 top-5 z-[999] flex justify-center"
      initial={{ opacity: 0, y: -10 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ color: textColor }}
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