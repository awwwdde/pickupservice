import { useCallback, useEffect, useState, useRef } from 'react'
import type { FC, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InputField } from '../components/inputfields/InputField'
import { submitBookingRequest } from '../api/backend'
import { FormToast, type FormToastPayload } from '../components/utils/FormToast'
import image5 from '../assets/img/image5.png'
import image6 from '../assets/img/image6.png'
import image7 from '../assets/img/image7.png'
import image8 from '../assets/img/image8.png'
import image9 from '../assets/img/image9.png'
import { isPrerenderEnv } from '../utils/isPrerender'

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]



// Список фото для эффекта
const trailImages = [
  image5,
  image6,
  image7,
  image8,
  image9
]

interface TrailItem {
  id: number;
  x: number;
  y: number;
  imgIndex: number;
}

const BookingPage: FC = () => {
  const isPrerender = isPrerenderEnv()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    brand: '',
    model: '',
    service: '',
    message: '',
    website: '',
  })
  const [isFocused, setIsFocused] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formToast, setFormToast] = useState<FormToastPayload>(null)

  const dismissFormToast = useCallback(() => setFormToast(null), [])

  const [enableTrail, setEnableTrail] = useState(false)

  // СОСТОЯНИЕ ДЛЯ ЭФФЕКТА МЫШИ
  const [trail, setTrail] = useState<TrailItem[]>([])
  const lastMousePos = useRef({ x: 0, y: 0 })
  const imageIndex = useRef(0)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPrerender) return
    const mq = window.matchMedia('(pointer: coarse)')
    const apply = () => {
      // На телефонах/планшетах трейл отключаем, чтобы не было дерганий и лишней нагрузки.
      const nextEnable = !mq.matches
      setEnableTrail(nextEnable)
      if (!nextEnable) setTrail([])
    }

    apply()

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }

    mq.addListener(apply)
    return () => mq.removeListener(apply)
  }, [isPrerender])

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
    setFormToast(null)
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setFormToast(null)
    setSubmitting(true)
    try {
      await submitBookingRequest({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        service: form.service.trim(),
        message: form.message.trim(),
        website: form.website,
      })
      setFormToast({
        variant: 'success',
        message: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.',
      })
      setForm({
        name: '',
        phone: '',
        email: '',
        brand: '',
        model: '',
        service: '',
        message: '',
        website: '',
      })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Не удалось отправить заявку. Проверьте соединение и попробуйте снова.'
      setFormToast({ variant: 'error', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bg-[#020202] text-white min-h-screen selection:bg-[#FF8201] selection:text-black">
      
      {/* HEADER SECTION С ЭФФЕКТОМ ТРЕЙЛА */}
      <section 
        ref={headerRef}
        onMouseMove={enableTrail ? handleMouseMove : undefined}
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
                  // Делаем трей адаптивным: на больших экранах сохраняем прежний размер,
                  // на телефонах/телевизорах ограничиваем по viewport.
                  width: 'min(200px, 40vw)',
                  height: 'min(250px, 45vh)',
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
          className="relative grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={form.website}
            onChange={e => handleChange('website', e.target.value)}
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />
          {/* Левая колонка */}
          <div className="flex flex-col gap-12">
            <InputField
              label="Имя"
              value={form.name}
              disabled={submitting}
              required
              onChange={e => handleChange('name', e.target.value)}
            />
            <InputField
              label="Номер телефона"
              value={form.phone}
              disabled={submitting}
              required
              onChange={e => handleChange('phone', e.target.value)}
            />
            <InputField
              label="Почта"
              type="email"
              value={form.email}
              disabled={submitting}
              required
              onChange={e => handleChange('email', e.target.value)}
            />
            <InputField
              label="Марка автомобиля"
              value={form.brand}
              disabled={submitting}
              required
              onChange={e => handleChange('brand', e.target.value)}
            />
            <InputField
              label="Модель и год"
              value={form.model}
              disabled={submitting}
              required
              onChange={e => handleChange('model', e.target.value)}
            />
          </div>

          {/* Правая колонка */}
          <div className="flex flex-col gap-12">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="relative cursor-pointer">
              <textarea
                value={form.message}
                onChange={e => handleChange('message', e.target.value)}
                rows={5}
                disabled={submitting}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="peer w-full border-b border-white/20 bg-transparent py-4 text-lg text-white placeholder-transparent focus:border-[#FF8201] focus:outline-none resize-none transition-colors disabled:opacity-50"
                placeholder="Сообщение"
              />
              <label className={`absolute left-0 transition-all pointer-events-none ${isFocused || form.message ? '-top-4 text-xs text-[#FF8201]' : 'top-4 text-lg text-white/40'}`}>
                Краткое техническое задание
              </label>
            </motion.div>

            <motion.button
              whileHover={submitting ? undefined : { backgroundColor: '#fff', color: '#000' }}
              whileTap={submitting ? undefined : { scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="mt-10 w-full bg-[#FF8201] text-black py-5 text-lg font-bold uppercase tracking-widest transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Отправка…' : 'Отправить заявку'}
            </motion.button>
          </div>
        </motion.form>
      </section>

      <FormToast toast={formToast} onDismiss={dismissFormToast} durationMs={5000} />
    </main>
  )
}

export default BookingPage