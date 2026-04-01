import { useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import image5 from '../assets/img/image5.png'
import image6 from '../assets/img/image6.png'
import image7 from '../assets/img/image7.png'
import image8 from '../assets/img/image8.png'
import image9 from '../assets/img/image9.png'

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const trailImages = [image5, image6, image7, image8, image9]

interface TrailItem {
  id: number
  x: number
  y: number
  imgIndex: number
}

const NotFoundPage: FC = () => {
  const [trail, setTrail] = useState<TrailItem[]>([])
  const [enableTrail, setEnableTrail] = useState(false)

  const lastMousePos = useRef({ x: 0, y: 0 })
  const imageIndex = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = '404 — ПикапСервис'

    const mq = window.matchMedia('(pointer: coarse)')
    const apply = () => {
      const enabled = !mq.matches
      setEnableTrail(enabled)
      if (!enabled) setTrail([])
    }

    apply()

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }

    mq.addListener(apply)
    return () => mq.removeListener(apply)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const distance = Math.hypot(
      x - lastMousePos.current.x,
      y - lastMousePos.current.y
    )

    if (distance > 80) {
      const id = Date.now()
      const imgIndex = imageIndex.current % trailImages.length

      setTrail(prev => [...prev, { id, x, y, imgIndex }])

      lastMousePos.current = { x, y }
      imageIndex.current++

      setTimeout(() => {
        setTrail(prev => prev.filter(item => item.id !== id))
      }, 600)
    }
  }

  return (
    <main
      ref={containerRef}
      onMouseMove={enableTrail ? handleMouseMove : undefined}
      className="relative min-h-screen bg-[#020202] text-white overflow-hidden selection:bg-[#FF8201]"
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        <AnimatePresence>
          {trail.map(item => (
            <motion.img
              key={item.id}
              src={trailImages[item.imgIndex]}
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 0.6, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.2, filter: 'blur(12px)' }}
              transition={{ duration: 0.7, ease }}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: 'min(180px, 40vw)',
                height: 'min(220px, 45vh)',
                objectFit: 'cover',
                transform: 'translate(-50%, -50%)',
              }}
              className="border border-white/10 shadow-2xl grayscale"
            />
          ))}
        </AnimatePresence>
      </div>
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, rgba(255,130,1,0.08), transparent 60%)',
            'radial-gradient(circle at 70% 60%, rgba(255,130,1,0.08), transparent 60%)',
            'radial-gradient(circle at 40% 70%, rgba(255,130,1,0.08), transparent 60%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-[clamp(20px,5vw,60px)] py-[clamp(120px,20vh,200px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute text-[30vw] font-black tracking-tighter text-white pointer-events-none select-none"
        >
          404
        </motion.div>

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          className="relative text-[clamp(36px,7vw,90px)] uppercase leading-[0.9] tracking-tighter"
        >
          <span className="text-white/40 font-light italic">
            Вы ушли с маршрута
          </span>
          <br />
          <span className="text-[#FF8201] font-bold">
            страница не найдена
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-8 max-w-xl text-white/50 text-lg leading-relaxed"
        >
          Похоже, вы свернули не туда. Но это не проблема — вернитесь
          на основной маршрут или выберите нужный раздел.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="mt-14 flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/"
            className="group flex items-center justify-center gap-3 px-8 h-14 border border-white/10 glass-header text-[11px] uppercase tracking-widest hover:border-[#FF8201]/40 hover:text-[#FF8201] transition"
          >
            На главную
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/portfolio"
            className="group flex items-center justify-center gap-3 px-8 h-14 bg-[#FF8201] text-black text-[11px] uppercase tracking-widest hover:bg-white transition"
          >
            Портфолио
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </main>
  )
}

export default NotFoundPage