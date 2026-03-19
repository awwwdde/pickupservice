import type { FC } from 'react'

interface TestimonialCardProps {
  quote: string
  name: string
  car: string
}

export const TestimonialCard: FC<TestimonialCardProps> = ({ quote, name, car }) => {
  return (
    <div className="flex h-[min(380px,60vh)] w-[90vw] max-w-[1100px] flex-shrink-0 flex-col items-center justify-center bg-white/10 px-[min(40px,6vw)] text-center md:px-20 transition-colors hover:bg-white/15">
      <p className="font-serif text-2xl md:text-4xl italic leading-relaxed text-white">
        "{quote}"
      </p>
      <div className="mt-10 flex flex-col items-center gap-1">
        <span className="text-lg font-bold uppercase tracking-widest text-[#FF8201]">
          {name}
        </span>
        <span className="text-sm font-medium uppercase tracking-widest text-white/50">
          {car}
        </span>
      </div>
    </div>
  )
}