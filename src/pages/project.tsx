import { type FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Lenis from 'lenis'
import { useParams } from 'react-router-dom'
import { fetchProjectById } from '../api/backend'
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

  useEffect(() => {
    if (isPrerender) return
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.75,
      touchMultiplier: 1,
      prevent: (node) => !!(node as HTMLElement).closest?.('[data-lenis-prevent]')
    })
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
      <section className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] tablet-portrait:h-[72vh] tablet-landscape:h-[85vh] flex items-end pb-12 md:pb-20 tablet-portrait:pb-14 tablet-landscape:pb-16 px-[5%] bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-50 ">
           <img src={projectData.gallery[0].url} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="relative z-10 w-full">
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[#FF8201] tracking-[0.5em] text-xs uppercase mb-6 tablet-portrait:mb-4 tablet-landscape:mb-5">
             {projectData.subtitle}
           </motion.p>
           <h1 className="text-[12vw] font-black text-white leading-[0.8] tracking-tighter uppercase tablet-portrait:text-[13vw] tablet-landscape:text-[11vw]">
             {projectData.id}
           </h1>
        </div>
      </section>

      {/* 2. DESCRIPTION SECTION */}
      <section className="py-20 sm:py-24 md:py-32 tablet-portrait:py-24 tablet-landscape:py-28 px-[5%] border-b border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 tablet-landscape:grid-cols-12 gap-10 tablet-portrait:gap-8 tablet-landscape:gap-10">
          <div className="lg:col-span-4 tablet-landscape:col-span-4">
             <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">Подробнее // 01</span>
          </div>
          <div className="lg:col-span-8 tablet-landscape:col-span-8">
             <p className="text-3xl md:text-5xl tablet-portrait:text-[clamp(1.6rem,3.6vw,2.5rem)] tablet-landscape:text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium leading-tight tracking-tight">
               {projectData.description}
             </p>

             <p className="mt-6 text-base leading-relaxed text-black/60 tablet-portrait:mt-5 tablet-landscape:mt-5">
               Комплексный ремонт и тюнинг внедорожников: диагностика, ТО, усиление подвески, электрика и подготовка под экспедиции.
             </p>
          </div>
        </div>
      </section>

      {/* 3. WORK STAGES — ОТДЕЛЬНАЯ СЕКЦИЯ (СПОКОЙНАЯ) */}
      <section className="py-20 sm:py-24 md:py-32 tablet-portrait:py-24 tablet-landscape:py-28 px-[5%] bg-white">
        <div className="mb-20 tablet-portrait:mb-14 tablet-landscape:mb-16">
           <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter tablet-portrait:text-[clamp(2rem,5.4vw,3.5rem)] tablet-landscape:text-[clamp(2.25rem,4.4vw,3.75rem)]">Этапы <span className="text-[#FF8201]">подготовки</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 tablet-portrait:grid-cols-2 tablet-landscape:grid-cols-4 border-t border-black/10">
          {projectData.workStages.map((stage, i) => (
            <div
              key={i}
              className={`p-8 sm:p-10 tablet-portrait:p-7 tablet-landscape:p-7 border-b lg:border-b-0 lg:border-r border-black/10 tablet-portrait:border-b tablet-portrait:border-r-0 tablet-landscape:border-b-0 tablet-landscape:border-r flex flex-col justify-between h-[280px] sm:h-[320px] md:h-[350px] tablet-portrait:h-[300px] tablet-landscape:h-[320px] ${i % 2 === 1 ? 'tablet-portrait:border-l tablet-portrait:border-l-black/10' : ''}`}
            >
               <span className="font-mono text-xs text-[#FF8201]">0{i + 1} //</span>
               <div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase mb-4 tracking-tight tablet-portrait:text-[1.25rem] tablet-landscape:text-[1.3rem] tablet-portrait:mb-3 tablet-landscape:mb-3">{stage.title}</h3>
                  <p className="text-black/50 text-sm leading-relaxed uppercase font-medium tablet-portrait:text-[13px] tablet-landscape:text-[12.5px]">{stage.detail}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FINAL GALLERY — В КОНЦЕ СТРАНИЦЫ */}
      <section className="py-20 sm:py-24 md:py-32 tablet-portrait:py-24 tablet-landscape:py-28 px-[5%] bg-[#f3f3f1]">
        <div className="mb-20 tablet-portrait:mb-14 tablet-landscape:mb-16 flex justify-between items-end">
           <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none tablet-portrait:text-[clamp(2rem,5.4vw,3.5rem)] tablet-landscape:text-[clamp(2.25rem,4.4vw,3.75rem)]">Результат <br /> <span className="text-black/20">в деталях</span></h2>
           <span className="font-mono text-xs text-black/40 uppercase tracking-widest hidden md:block">Прокрутите // 04</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 tablet-portrait:gap-4 tablet-landscape:gap-4">
           {projectData.gallery.map((img, i) => (
             <div key={i} className={`overflow-hidden bg-neutral-200 ${img.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'}`}>
                <img
                  src={img.url}
                  className="w-full h-full object-cover aspect-video md:aspect-auto md:h-[70vh] tablet-portrait:h-[48vh] tablet-landscape:h-[62vh]"
                  alt=""
                />
             </div>
           ))}
        </div>
      </section>

      {/* 5. CONTACT CTA — СТИЛЬ ГЛАВНОЙ */}
      <section className="py-28 sm:py-32 md:py-40 tablet-portrait:py-28 tablet-landscape:py-32 bg-black text-white flex flex-col items-center border-t border-white/5">
        <div className="w-[90%] tablet-portrait:w-[92%] tablet-landscape:w-[92%] flex flex-col items-center text-center">
           <h3 className="text-[8vw] font-black uppercase tracking-tighter mb-16 tablet-portrait:mb-12 tablet-landscape:mb-14 leading-none tablet-portrait:text-[clamp(2rem,7vw,4.5rem)] tablet-landscape:text-[clamp(2.5rem,6vw,5.5rem)]">
             Ваш джип готов <br /> <span className="text-[#FF8201]">обновиться?</span>
           </h3>
          <p className="max-w-3xl text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-white/70">
            Свяжитесь с нами по телефону или в Telegram/MAX, чтобы обсудить детали проекта и график работ.
          </p>
        </div>
      </section>
    </div>
  )
}

export default ProjectPage
