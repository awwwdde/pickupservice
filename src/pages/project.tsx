import { type FC, type FormEvent, useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Lenis from 'lenis'
import { InputField } from '../components/inputfields/InputField'
import { useParams } from 'react-router-dom'
import { fetchProjectById, submitCallbackRequest } from '../api/backend'
import { FormToast, type FormToastPayload } from '../components/utils/FormToast'
import { isPrerenderEnv } from '../utils/isPrerender'

import image1 from '../assets/img/image1.png'
import image2 from '../assets/img/image2.png'
import image5 from '../assets/img/image5.png'
import image6 from '../assets/img/image6.png'


// --- КОНФИГУРАЦИЯ ПРОЕКТА (ДЛЯ БЭКЕНДА) ---
const PROJECT_CONTENT = {
  id: "chimera",
  title: "PROJECT CHIMERA",
  subtitle: "TOYOTA HILUX ADVENTURE / 2026",
  description: "Комплексная подготовка экспедиционного автомобиля. Основная задача — создание надежной платформы для длительных автономных поездок по пересеченной местности с сохранением заводского комфорта.",
  
  // Секция 2: Технические этапы 
  workStages: [
    { title: "Проектирование", detail: "Разработка 3D-модели силового каркаса и расчет развесовки по осям." },
    { title: "Подвеска", detail: "Установка усиленных рычагов и амортизаторов с выносными бачками." },
    { title: "Защита", detail: "Монтаж алюминиевой защиты днища и силовых порогов." },
    { title: "Электрика", detail: "Инсталляция системы двух АКБ и дополнительного освещения." }
  ],

  // Секция 3: Фотографии проекта 
  gallery: [
    { url: image5, size: 'large' },
    { url: image1, size: 'small' },
    { url: image2, size: 'small' },
    { url: image6, size: 'large' }
  ]
}

const ProjectPage: FC = () => {
  const { id } = useParams()
  const isPrerender = isPrerenderEnv()
  const [projectData, setProjectData] = useState(PROJECT_CONTENT)
  const [callbackForm, setCallbackForm] = useState({
    name: '',
    phone: '',
    website: '',
  })
  const [callbackSubmitting, setCallbackSubmitting] = useState(false)
  const [formToast, setFormToast] = useState<FormToastPayload>(null)

  const dismissFormToast = useCallback(() => setFormToast(null), [])

  useEffect(() => {
    if (isPrerender) return
    const lenis = new Lenis({ lerp: 0.05, smoothWheel: true })
    let rafId: number
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [isPrerender])

  const handleCallbackChange = (key: 'name' | 'phone' | 'website', value: string) => {
    setFormToast(null)
    setCallbackForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCallbackSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (callbackSubmitting) return
    setFormToast(null)
    setCallbackSubmitting(true)
    try {
      await submitCallbackRequest({
        name: callbackForm.name.trim(),
        phone: callbackForm.phone.trim(),
        website: callbackForm.website,
      })
      setFormToast({
        variant: 'success',
        message: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.',
      })
      setCallbackForm({ name: '', phone: '', website: '' })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Не удалось отправить заявку. Проверьте соединение и попробуйте снова.'
      setFormToast({ variant: 'error', message: msg })
    } finally {
      setCallbackSubmitting(false)
    }
  }

  useEffect(() => {
    if (isPrerender) return
    if (!id) return
    let cancelled = false
    fetchProjectById(id)
      .then((data) => {
        if (cancelled) return
        setProjectData({
          id: data.title || `project-${data.id}`,
          title: data.title || 'PROJECT',
          subtitle: `${data.vehicle || 'OFFROAD'} / ${new Date(data.updated_at || Date.now()).getFullYear()}`,
          description: data.description || PROJECT_CONTENT.description,
          workStages:
            data.preparation_stages?.length
              ? data.preparation_stages.map((s) => ({
                  title: s.title,
                  detail: s.text
                }))
              : PROJECT_CONTENT.workStages,
          gallery:
            data.gallery?.length
              ? data.gallery.map((g, index) => ({
                  url: g.image,
                  size: index % 3 === 0 ? 'large' : 'small'
                }))
              : [
                  { url: data.image, size: 'large' },
                  ...PROJECT_CONTENT.gallery.slice(1)
                ]
        })
      })
      .catch(() => {
        // Оставляем локальный контент как фолбэк.
      })
    return () => {
      cancelled = true
    }
  }, [id, isPrerender])

  return (
    <div className="bg-[#f3f3f1] text-black selection:bg-[#FF8201] selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] flex items-end pb-12 md:pb-20 px-[5%] bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-50 ">
           <img src={projectData.gallery[0].url} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="relative z-10 w-full">
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[#FF8201] tracking-[0.5em] text-xs uppercase mb-6">
             {projectData.subtitle}
           </motion.p>
           <h1 className="text-[12vw] font-black text-white leading-[0.8] tracking-tighter uppercase">
             {projectData.id}
           </h1>
        </div>
      </section>

      {/* 2. DESCRIPTION SECTION */}
      <section className="py-20 sm:py-24 md:py-32 px-[5%] border-b border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
             <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">Подробнее // 01</span>
          </div>
          <div className="lg:col-span-8">
             <p className="text-3xl md:text-5xl font-medium leading-tight tracking-tight">
               {projectData.description}
             </p>

             <p className="mt-6 text-base leading-relaxed text-black/60">
               Комплексный ремонт и тюнинг внедорожников: диагностика, ТО, усиление подвески, электрика и подготовка под экспедиции.
             </p>
          </div>
        </div>
      </section>

      {/* 3. WORK STAGES — ОТДЕЛЬНАЯ СЕКЦИЯ (СПОКОЙНАЯ) */}
      <section className="py-20 sm:py-24 md:py-32 px-[5%] bg-white">
        <div className="mb-20">
           <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter">Этапы <span className="text-[#FF8201]">подготовки</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-black/10">
          {projectData.workStages.map((stage, i) => (
            <div key={i} className="p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-black/10 flex flex-col justify-between h-[280px] sm:h-[320px] md:h-[350px]">
               <span className="font-mono text-xs text-[#FF8201]">0{i + 1} //</span>
               <div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase mb-4 tracking-tight">{stage.title}</h3>
                  <p className="text-black/50 text-sm leading-relaxed uppercase font-medium">{stage.detail}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FINAL GALLERY — В КОНЦЕ СТРАНИЦЫ */}
      <section className="py-20 sm:py-24 md:py-32 px-[5%] bg-[#f3f3f1]">
        <div className="mb-20 flex justify-between items-end">
           <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">Результат <br /> <span className="text-black/20">в деталях</span></h2>
           <span className="font-mono text-xs text-black/40 uppercase tracking-widest hidden md:block">Прокрутите // 04</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           {projectData.gallery.map((img, i) => (
             <div key={i} className={`overflow-hidden bg-neutral-200 ${img.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'}`}>
                <img 
                  src={img.url} 
                  className="w-full h-full object-cover aspect-video md:aspect-auto md:h-[70vh]" 
                  alt="" 
                />
             </div>
           ))}
        </div>
      </section>

      {/* 5. CONTACT CTA — СТИЛЬ ГЛАВНОЙ */}
      <section className="py-28 sm:py-32 md:py-40 bg-black text-white flex flex-col items-center border-t border-white/5">
        <div className="w-[90%] flex flex-col items-center text-center">
           <h3 className="text-[8vw] font-black uppercase tracking-tighter mb-16 leading-none">
             Ваш джип готов <br /> к <span className="text-[#FF8201]">превращению?</span>
           </h3>
          <form
            className="flex w-full flex-col items-end gap-10 md:flex-row md:items-center"
            onSubmit={handleCallbackSubmit}
          >
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={callbackForm.website}
              onChange={(e) => handleCallbackChange('website', e.target.value)}
              className="absolute -left-[9999px] h-px w-px opacity-0"
            />
            <div className="flex w-full flex-1 gap-10 flex-col md:flex-row">
              <InputField
                label="Ваше Имя"
                type="text"
                required
                disabled={callbackSubmitting}
                value={callbackForm.name}
                onChange={(e) => handleCallbackChange('name', e.target.value)}
              />
              <InputField
                label="Телефон"
                type="tel"
                required
                disabled={callbackSubmitting}
                value={callbackForm.phone}
                onChange={(e) => handleCallbackChange('phone', e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={callbackSubmitting}
              className="group flex h-[80px] w-full max-w-[300px] flex-shrink-0 cursor-pointer items-center justify-center gap-4 bg-[#FF8201] text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white"
            >
              {callbackSubmitting ? 'Отправка…' : 'Отправить заявку'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
            </motion.button>
          </form>
        </div>
      </section>

      <FormToast toast={formToast} onDismiss={dismissFormToast} durationMs={5000} />
    </div>
  )
}

export default ProjectPage