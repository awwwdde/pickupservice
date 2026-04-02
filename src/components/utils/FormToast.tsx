import { useEffect } from 'react'
import type { FC } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check } from 'lucide-react'

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export type FormToastPayload = {
  variant: 'success' | 'error'
  message: string
} | null

type FormToastProps = {
  toast: FormToastPayload
  onDismiss: () => void
  durationMs?: number
}

export const FormToast: FC<FormToastProps> = ({ toast, onDismiss, durationMs = 5000 }) => {
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => onDismiss(), durationMs)
    return () => window.clearTimeout(id)
  }, [toast, onDismiss, durationMs])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role={toast.variant === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          initial={{ opacity: 0, y: 24, x: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, x: 8 }}
          transition={{ duration: 0.35, ease }}
          className="glass-header fixed bottom-6 right-4 z-[10050] flex max-w-[min(340px,calc(100vw-2rem))] items-start gap-3 rounded-[0.2rem] border border-white/15 px-4 py-3.5 pr-5 text-sm text-white shadow-2xl sm:bottom-8 sm:right-6 md:right-8"
        >
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              toast.variant === 'success'
                ? 'bg-emerald-500/25 text-emerald-300'
                : 'bg-red-500/25 text-red-300'
            }`}
          >
            {toast.variant === 'success' ? (
              <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            ) : (
              <AlertCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
            )}
          </span>
          <span className="text-left font-medium leading-snug text-white/95">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
