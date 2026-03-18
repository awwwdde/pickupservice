import { useState } from 'react'
import type { FC } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { InputField } from '../components/inputfields/InputField'

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const services = [
  'Внешние модификации',
  'Техническое обслуживание',
  'Диагностика',
  'Детейлинг',
  'Другое',
]

const BookingPage: FC = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    brand: '',
    model: '',
    service: '',
    message: '',
  })

  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }
  const { scrollY } = useScroll()
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
  const img1Y = useTransform(scrollY, v => clamp((v * -60) / 500, -120, 120))
  const img2Y = useTransform(scrollY, v => clamp((v * 80) / 500, -120, 120))
  const img3Y = useTransform(scrollY, v => clamp((v * -100) / 500, -120, 120))

  return (
    <main className="bg-[#020202] text-white min-h-screen">
      
      <section className="relative w-[90%] mx-auto pt-40 pb-32">
        
        {/* FLOATING IMAGES */}
        <motion.img
          src="https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=600"
          style={{ y: img1Y }}
          className="absolute top-10 left-[10%] w-[160px] object-cover"
        />

        <motion.img
          src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=600"
          style={{ y: img2Y }}
          className="absolute top-0 right-[12%] w-[180px] object-cover"
        />

        <motion.img
          src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=600"
          style={{ y: img3Y }}
          className="absolute bottom-0 right-[25%] w-[160px] object-cover"
        />

        {/* TEXT */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          className="text-center text-[7vw] leading-[1.1] uppercase tracking-tight"
        >
          <span className="italic text-white/80">
            Здесь вы можете удобно
          </span>
          <br />
          <span className="text-[#FF8201]">
            записаться к нам
          </span>
        </motion.h1>
      </section>

      {/* FORM */}
      <section className="w-[90%] mx-auto pb-40 pt-20">
        <motion.form
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12"
        >
          
          {/* LEFT */}
          <div className="flex flex-col gap-12">
            <InputField
              label="Имя"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
            />

            <InputField
              label="Номер телефона"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
            />

            <InputField
              label="Почта"
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
            />

            <InputField
              label="Марка автомобиля"
              value={form.brand}
              onChange={e => handleChange('brand', e.target.value)}
            />

            <InputField
              label="Модель + год"
              value={form.model}
              onChange={e => handleChange('model', e.target.value)}
            />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="relative"
            >
              <select
                value={form.service}
                onChange={e => handleChange('service', e.target.value)}
                className="w-full border-b border-white/20 bg-transparent py-4 text-lg text-white focus:border-white focus:outline-none appearance-none"
              >
                <option value="" disabled hidden>
                  Выберите услугу
                </option>
                {services.map(s => (
                  <option key={s} value={s} className="bg-black">
                    {s}
                  </option>
                ))}
              </select>

              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40">
                ↓
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="relative cursor-pointer"
            >
              <textarea
                value={form.message}
                onChange={e => handleChange('message', e.target.value)}
                rows={5}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="peer w-full border-b border-white/20 bg-transparent py-4 text-lg text-white placeholder-transparent focus:border-white focus:outline-none resize-none"
                placeholder="Сообщение"
              />

              <label
                className={`absolute left-0 transition-all pointer-events-none
                ${
                  isFocused || form.message
                    ? '-top-4 text-xs text-[#FF8201]'
                    : 'top-4 text-lg text-white/40'
                }`}
              >
                Сообщение
              </label>
            </motion.div>

            {/* SUBMIT */}
            <motion.button
              whileHover={{ scale: 1 }}
              whileTap={{ scale: 1 }}
              type="button"
              className="mt-10 w-full bg-[#FF8201] text-black py-5 text-lg font-semibold uppercase tracking-wide cursor-pointer"
            >
              Отправить заявку
            </motion.button>
            <p className="text-sm text-white/40 mt-4">
              Мы ответим вам в течение 15–30 минут
            </p>
          </div>
        </motion.form>
      </section>
    </main>
  )
}

export default BookingPage