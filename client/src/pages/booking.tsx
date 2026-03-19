import { useState, useRef } from 'react'
import type { FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InputField } from '../components/inputfields/InputField'

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const services = [
  'Внешние модификации',
  'Техническое обслуживание',
  'Диагностика',
  'Детейлинг',
  'Другое',
]

// Список фото для эффекта
const trailImages = [
  "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=600",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=600",
  "https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=600",
  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=600",
  "https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=600"
]

interface TrailItem {
  id: number;
  x: number;
  y: number;
  imgIndex: number;
}

const BookingPage: FC = () => {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', brand: '', model: '', service: '', message: '',
  })
  const [isFocused, setIsFocused] = useState(false)

  // СОСТОЯНИЕ ДЛЯ ЭФФЕКТА МЫШИ
  const [trail, setTrail] = useState<TrailItem[]>([])
  const lastMousePos = useRef({ x: 0, y: 0 })
  const imageIndex = useRef(0)
  const headerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!headerRef.current) return

    // Получаем координаты относительно хедера
    const rect = headerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Считаем расстояние от последнего созданного фото
    const distance = Math.hypot(x - lastMousePos.current.x, y - lastMousePos.current.y)

    // Если мышь прошла больше 100px — создаем новое фото
    if (distance > 100) {
      const newId = Date.now()
      const newImgIndex = imageIndex.current % trailImages.length
      
      setTrail(prev => [...prev, { id: newId, x, y, imgIndex: newImgIndex }])
      
      lastMousePos.current = { x, y }
      imageIndex.current++

      setTimeout(() => {
        setTrail(prev => prev.filter(item => item.id !== newId))
      }, 500)
    }
  }

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <main className="bg-[#020202] text-white min-h-screen selection:bg-[#FF8201] selection:text-black">
      
      {/* HEADER SECTION С ЭФФЕКТОМ ТРЕЙЛА */}
      <section 
        ref={headerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden border-b border-white/5"
      >
        {/* АНИМИРОВАННЫЙ СЛЕД ИЗ ФОТО */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <AnimatePresence>
            {trail.map((item) => (
              <motion.img
                key={item.id}
                src={trailImages[item.imgIndex]}
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 0.7, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease }}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  width: '200px',
                  height: '250px',
                  objectFit: 'cover',
                  transform: 'translate(-50%, -50%)', // Центрируем по мышке
                }}
                className="grayscale-[0.5] shadow-2xl border border-white/10"
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ТЕКСТ (теперь поверх фото за счет z-10) */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease }}
          className="relative z-10 text-center text-[7vw] leading-[1.0] uppercase tracking-tighter pointer-events-none"
        >
          <span className="italic font-light text-neutral-400">Здесь вы можете</span>
          <br />
          <span className="text-[#FF8201] font-bold">записаться к нам</span>
        </motion.h1>
      </section>

      {/* ФОРМА */}
      <section className="w-[90%] mx-auto pb-40 pt-20">
        <motion.form
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12"
        >
          {/* Левая колонка */}
          <div className="flex flex-col gap-12">
            <InputField label="Имя" value={form.name} onChange={e => handleChange('name', e.target.value)} />
            <InputField label="Номер телефона" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
            <InputField label="Почта" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
            <InputField label="Марка автомобиля" value={form.brand} onChange={e => handleChange('brand', e.target.value)} />
            <InputField label="Модель + год" value={form.model} onChange={e => handleChange('model', e.target.value)} />
          </div>

          {/* Правая колонка */}
          <div className="flex flex-col gap-12">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="relative">
              <select
                value={form.service}
                onChange={e => handleChange('service', e.target.value)}
                className="w-full border-b border-white/20 bg-transparent py-4 text-lg text-white focus:border-[#FF8201] focus:outline-none appearance-none transition-colors"
              >
                <option value="" disabled hidden>Выберите услугу</option>
                {services.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">↓</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="relative cursor-pointer">
              <textarea
                value={form.message}
                onChange={e => handleChange('message', e.target.value)}
                rows={5}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="peer w-full border-b border-white/20 bg-transparent py-4 text-lg text-white placeholder-transparent focus:border-[#FF8201] focus:outline-none resize-none transition-colors"
                placeholder="Сообщение"
              />
              <label className={`absolute left-0 transition-all pointer-events-none ${isFocused || form.message ? '-top-4 text-xs text-[#FF8201]' : 'top-4 text-lg text-white/40'}`}>
                Сообщение
              </label>
            </motion.div>

            <motion.button
              whileHover={{ backgroundColor: '#fff', color: '#000' }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="mt-10 w-full bg-[#FF8201] text-black py-5 text-lg font-bold uppercase tracking-widest transition-colors"
            >
              Отправить заявку
            </motion.button>
          </div>
        </motion.form>
      </section>
    </main>
  )
}

export default BookingPage