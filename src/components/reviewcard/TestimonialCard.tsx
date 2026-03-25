import type { FC } from 'react'

interface TestimonialCardProps {
  quote: string
  name: string
  car: string
}

export const TestimonialCard: FC<TestimonialCardProps> = ({ quote, name, car }) => {
  return (
    <div className="flex h-[min(340px,55vh)] w-[85vw] max-w-[380px] flex-shrink-0 flex-col items-center justify-center bg-white/10 px-[min(28px,6vw)] text-center transition-colors hover:bg-white/15 md:px-20 md:w-[90vw] md:max-w-[1100px] md:h-[min(380px,60vh)]">
      <p className="w-full font-serif text-lg sm:text-xl md:text-4xl italic leading-relaxed text-white break-words">
        "{quote}"
      </p>
      <div className="mt-6 sm:mt-10 flex flex-col items-center gap-1">
        <span className="text-base sm:text-lg font-bold uppercase tracking-widest text-[#FF8201]">
          {name}
        </span>
        <span className="text-sm font-medium uppercase tracking-widest text-white/50">
          {car}
        </span>
      </div>
    </div>
  )
}