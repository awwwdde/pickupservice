import { useCallback, useState } from 'react'
import type { FC, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { InputField } from '../components/inputfields/InputField'
import { submitBookingRequest } from '../api/backend'
import { FormToast, type FormToastPayload } from '../components/utils/FormToast'
import image5 from '../assets/img/image5.png'
import image6 from '../assets/img/image6.png'

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]



const BookingPage: FC = () => {
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
  const bookingHeroImage = image6 || image5

  const dismissFormToast = useCallback(() => setFormToast(null), [])

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
      
      {/* HERO */}
      <section
        className="relative flex h-[80svh] w-full items-center justify-center overflow-hidden border-b border-white/5"
      >
        <img
          src={bookingHeroImage}
          alt="Фото сервиса PickupService"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-black/20 to-black/45" />

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease }}
          className="relative z-10 px-6 text-center text-[clamp(2.2rem,7vw,6.5rem)] leading-[1] uppercase tracking-tighter pointer-events-none"
        >
          <span className="italic font-light text-neutral-400">Здесь вы можете</span>
          <br />
          <span className="text-[#FF8201] font-bold">записаться к нам</span>
        </motion.h1>
      </section>

      {/* ФОРМА */}
      <section className="w-[90%] mx-auto pb-40 pt-20 tablet-portrait:w-[92%] tablet-landscape:w-[92%]">
        <motion.form
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative grid grid-cols-1 tablet-landscape:grid-cols-2 lg:grid-cols-2 gap-x-16 gap-y-12 tablet-portrait:gap-y-10 tablet-landscape:gap-x-12"
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