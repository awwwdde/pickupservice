import type { FC } from 'react'

interface TestimonialCardProps {
  quote: string
  name: string
  car: string
}

export const TestimonialCard: FC<TestimonialCardProps> = ({ quote, name, car }) => {
  return (
    <div className="
      /* snap-center — магия, которая центрирует блок при остановке скролла */
      snap-center shrink-0
      
      /* Адаптивная ширина */
      w-[min(85vw,380px)] md:w-[min(60vw,760px)] md:max-w-[min(760px,92vw)] min-[1440px]:w-[1000px] min-[1440px]:max-w-none
      tablet-portrait:w-[min(82vw,520px)] tablet-portrait:md:max-w-[min(520px,82vw)] tablet-landscape:w-[min(68vw,560px)] tablet-landscape:md:max-w-[min(560px,68vw)]
      
      /* Высота и внутренние отступы */
      min-h-[380px] md:min-h-[420px] min-[1440px]:min-h-[450px]
      tablet-portrait:md:min-h-[min(360px,48vh)] tablet-landscape:md:min-h-[min(320px,42vh)]
      p-8 md:p-10 min-[1440px]:md:p-16 tablet-portrait:md:p-8 tablet-landscape:md:p-7
      
      
      /* Дизайн */
      flex flex-col items-center justify-center text-center
      bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl
      transition-transform duration-300
    ">
      <span className="mb-4 text-4xl font-serif text-[#FF8201] md:text-[clamp(2.25rem,5vw,3.75rem)] min-[1440px]:md:text-6xl tablet-portrait:md:mb-3 tablet-portrait:md:text-[clamp(1.85rem,4.5vw,2.75rem)] tablet-landscape:md:mb-2 tablet-landscape:md:text-[clamp(1.65rem,3.5vw,2.35rem)]">&ldquo;</span>
      
      <p className="font-serif italic text-lg text-white leading-tight sm:text-xl md:text-[clamp(1.15rem,2.4vw,1.85rem)] min-[1440px]:md:text-4xl tablet-portrait:md:text-[clamp(1.05rem,2.5vw,1.45rem)] tablet-landscape:md:text-[clamp(1rem,2vw,1.3rem)] tablet-landscape:md:leading-snug">
        {quote}
      </p>

      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-sm md:text-lg font-bold uppercase tracking-[0.2em] text-[#FF8201]">
          {name}
        </span>
        <span className="text-[10px] md:text-sm font-medium uppercase tracking-[0.3em] text-white/40">
          {car}
        </span>
      </div>
    </div>
  )
}