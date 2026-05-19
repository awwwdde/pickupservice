import { useEffect, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { isPrerenderEnv } from '../../utils/isPrerender'

const STORAGE_KEY = 'pickupservice_cookie_consent'

const CookieConsent: FC = () => {
  const isPrerender = isPrerenderEnv()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isPrerender) return
    try {
      const accepted = localStorage.getItem(STORAGE_KEY) === '1'
      if (!accepted) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [isPrerender])

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Уведомление о cookie"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 left-5 z-[1100] w-[min(22rem,calc(100vw-2.5rem))] rounded-[0.35rem] border border-white/10 bg-[#0a0a0a]/95 p-4 text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md sm:bottom-7 sm:left-7 sm:p-5"
        >
          <p className="text-[13px] leading-relaxed text-white/75 sm:text-[14px]">
            Мы используем cookie для корректной работы сайта и улучшения сервиса. Продолжая
            пользоваться сайтом, вы соглашаетесь с{' '}
            <Link
              to="/privacy"
              className="font-medium text-[#FF8201] underline-offset-2 hover:underline"
            >
              политикой конфиденциальности
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={accept}
            className="mt-4 w-full rounded-[0.2rem] bg-[#FF8201] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-85 sm:text-[13px]"
          >
            Принять
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CookieConsent
