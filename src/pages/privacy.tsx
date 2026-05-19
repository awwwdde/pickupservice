import { useEffect, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import { fetchPrivacyPolicy } from '../api/backend'
import { isPrerenderEnv } from '../utils/isPrerender'

const FALLBACK_TITLE = 'Политика конфиденциальности'
const FALLBACK_CONTENT =
  'Текст политики конфиденциальности пока не опубликован. Обратитесь к администратору сайта.'

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

const PrivacyPage: FC = () => {
  const isPrerender = isPrerenderEnv()
  const [title, setTitle] = useState(FALLBACK_TITLE)
  const [paragraphs, setParagraphs] = useState<string[]>(splitParagraphs(FALLBACK_CONTENT))
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    if (isPrerender) return
    let cancelled = false

    fetchPrivacyPolicy()
      .then((data) => {
        if (cancelled || !data) return
        setTitle(data.title || FALLBACK_TITLE)
        setParagraphs(
          splitParagraphs(data.content || '').length
            ? splitParagraphs(data.content)
            : splitParagraphs(FALLBACK_CONTENT)
        )
        setUpdatedAt(data.updated_at ?? null)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [isPrerender])

  return (
    <section className="min-h-screen bg-[#f3f3f1] text-black pt-[clamp(6rem,14vh,8rem)] pb-20 px-[6%] md:px-[5%]">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-8 inline-block text-[12px] font-bold uppercase tracking-[0.14em] text-black/45 transition-colors hover:text-[#FF8201]"
        >
          ← На главную
        </Link>

        <h1 className="text-3xl font-black uppercase tracking-tighter leading-[1.05] text-[#FF8201] sm:text-4xl md:text-[clamp(1.85rem,3.2vw,2.85rem)]">
          {title}
        </h1>

        {updatedAt && (
          <p className="mt-3 text-[12px] uppercase tracking-[0.12em] text-black/40">
            Обновлено:{' '}
            {new Date(updatedAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        <div className="mt-10 space-y-6 border-t border-black/10 pt-10">
          {paragraphs.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph.slice(0, 24)}`}
              className="whitespace-pre-line text-[clamp(0.98rem,1.45vw,1.1rem)] leading-relaxed text-black/70"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PrivacyPage
