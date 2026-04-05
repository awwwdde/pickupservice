import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Calendar, MessageSquare, ImageIcon } from 'lucide-react';
import { fetchFeaturedNews, type ApiNewsFeatured } from '../../api/backend';
import { isPrerenderEnv } from '../../utils/isPrerender'

interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
}

function isValidFeaturedNews(api: ApiNewsFeatured | null): api is ApiNewsFeatured {
  if (!api) return false;
  if (!api.title?.trim()) return false;
  if (!(api.content?.trim() || api.excerpt?.trim())) return false;
  return true;
}

function mapApiToNews(api: ApiNewsFeatured): NewsItem {
  return {
    id: String(api.id),
    title: api.title.trim(),
    date: api.date_display,
    excerpt: api.excerpt,
    content: api.content,
    image: api.image?.trim() ?? ''
  };
}

function NewsImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/35 ${className ?? ''}`}
      role="img"
      aria-label="Фото новости пока недоступно"
    >
      <ImageIcon className="opacity-50" size={28} strokeWidth={1.5} aria-hidden />
      <span className="px-3 text-center text-[10px] font-medium uppercase tracking-widest sm:text-[11px]">
        Фото скоро
      </span>
    </div>
  );
}

function NewsMedia({
  src,
  alt,
  className,
  imgClassName
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showPlaceholder = !src?.trim() || broken;

  if (showPlaceholder) {
    return <NewsImagePlaceholder className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={imgClassName}
      onError={() => setBroken(true)}
    />
  );
}

const POLL_MS = 45_000;

const NewsHeroBlock: React.FC = () => {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPrerender = isPrerenderEnv();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (isPrerender) return;
    let cancelled = false;

    const tryApply = (api: ApiNewsFeatured | null) => {
      if (cancelled || !isValidFeaturedNews(api)) return;
      loadedRef.current = true;
      setNews(mapApiToNews(api));
    };

    (async () => {
      tryApply(await fetchFeaturedNews());
    })();

    const id = window.setInterval(async () => {
      if (cancelled || loadedRef.current) return;
      tryApply(await fetchFeaturedNews());
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isPrerender]);

  return (
    <>
      <AnimatePresence>
        {isVisible && news && (
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-header pointer-events-auto fixed z-[100] overflow-hidden border border-white/10 shadow-2xl max-md:right-3 max-md:bottom-[4.75rem] max-md:left-auto max-md:w-[min(248px,76vw)] max-md:translate-x-0 max-md:p-2.5 sm:max-md:bottom-[5.25rem] md:bottom-28 md:left-1/2 md:w-[min(340px,92vw)] md:-translate-x-1/2 md:p-3 lg:right-[min(35px,6vw)] lg:bottom-8 lg:left-auto lg:translate-x-0 lg:top-auto lg:w-[400px] lg:p-4 min-[1000px]:max-[1439px]:bottom-7 min-[1000px]:max-[1439px]:w-[min(320px,26vw)] min-[1000px]:max-[1439px]:max-w-[min(320px,26vw)] min-[1000px]:max-[1439px]:p-3 min-[1440px]:lg:w-[440px]"
          >
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center cursor-pointer justify-center rounded-full bg-black/20 text-white/50 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
              title="Закрыть"
            >
              <X size={14} />
            </button>

            <div className="relative mb-2 h-20 w-full overflow-hidden rounded-md md:mb-4 md:h-40 lg:h-44">
              <NewsMedia
                src={news.image}
                alt={news.title}
                className="h-full w-full"
                imgClassName="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-sm bg-orange-500/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-tighter text-white backdrop-blur-sm md:bottom-2 md:left-2 md:gap-2 md:px-2.5 md:py-1 md:text-[10px]">
                <MessageSquare className="shrink-0" size={10} strokeWidth={2.5} aria-hidden />
                <span className="leading-none">Актуально</span>
              </div>
            </div>

            <div className="space-y-1 max-md:space-y-1 md:space-y-2">
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-white/40 max-md:gap-1.5 md:gap-2.5 md:text-[11px]">
                <Calendar className="shrink-0 opacity-90" size={11} strokeWidth={2} aria-hidden />
                <span className="leading-none">{news.date}</span>
              </div>
              <h3 className="line-clamp-2 font-bold leading-snug text-white max-md:text-[13px] max-md:leading-tight md:text-lg min-[1000px]:max-[1399px]:md:text-base">
                {news.title}
              </h3>
              
              <div className="pt-1.5 md:pt-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-white/5 py-1.5 text-[11px] font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10 max-md:gap-1 sm:text-sm md:gap-2 md:py-2.5 md:text-[0.95rem]"
                >
                  Читать полностью
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1 md:h-[15px] md:w-[15px]" aria-hidden />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && news && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="glass-header relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:p-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 z-10 p-2 text-white/40 transition-colors hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="space-y-6">
                <div className="aspect-video w-full overflow-hidden rounded-xl">
                  <NewsMedia
                    src={news.image}
                    alt={news.title}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">
                    Новинки компании
                  </div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">
                    {news.title}
                  </h2>
                  <div className="h-0.5 w-12 bg-orange-500" />
                </div>

                <div className="space-y-4 text-base leading-relaxed text-white/70 sm:text-lg">
                  <p>{news.content}</p>
                  <p>Мы продолжаем тестировать новые решения, чтобы ваши путешествия были безопасными. Следите за обновлениями в наших соцсетях.</p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex w-full items-center justify-center cursor-pointer rounded-lg bg-white px-6 py-3 text-sm font-bold text-black transition-transform active:scale-95 sm:w-auto"
                  >
                    Вернуться на главную
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsHeroBlock;