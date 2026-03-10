import type { FC } from 'react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import herovid from '../assets/vid/hero.webm'

const words = ['СОЗДАЕМ', 'РЕМОНТИРУЕМ', 'ОБСЛУЖИВАЕМ']

const MainPage: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const wordRef = useRef<HTMLSpanElement | null>(null)
  const textWrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    void video.play()
  }, [])

  useLayoutEffect(() => {
    const wordEl = wordRef.current
    const textWrapper = textWrapperRef.current
    if (!wordEl || !textWrapper) return
    gsap.fromTo(
      textWrapper,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' },
    )
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 })

    words.forEach((word, index) => {
      tl.to(wordEl, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          wordEl.textContent = word
        },
      }).to(wordEl, {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
      })
      if (index !== words.length - 1) {
        tl.to(wordEl, { duration: 1 })
      }
    })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div className="bg-black text-white">
      <section className="relative h-[100vh] w-full overflow-hidden">
        <video
          ref={videoRef}
          src={herovid}
          autoPlay
          muted
          playsInline
          controls={false}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div
            ref={textWrapperRef}
            className="relative flex items-center justify-center text-center text-2xl font-semibold md:text-4xl"
          >
            <span className="mr-[30px]">
              МЫ{' '}
              <span ref={wordRef} className="inline-block opacity-100">
                СОЗДАЕМ
              </span>
            </span>
            <span className="ml-[30px]">ВНЕДОРОЖНИКИ</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MainPage
