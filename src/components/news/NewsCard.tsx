import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Calendar, MessageSquare } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
}

const MOCK_NEWS: NewsItem = {
  id: '1',
  title: 'Экспедиция в Арктику: Подготовка внедорожников',
  date: '12 апреля, 2026',
  excerpt: 'Узнайте, как мы готовим технику к экстремальным температурам и полной автономии.',
  content: 'Здесь располагается полный текст статьи. В рамках подготовки мы модернизировали подвеску, установили дополнительные системы обогрева и протестировали электронику при -45°C. Наш подход к инженерии позволяет достигать результатов, которые ранее казались невозможными. Мы используем только проверенные компоненты и кастомные решения для каждого конкретного случая.',
  image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&q=80&w=800'
};

const NewsHeroBlock: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-header absolute right-4 top-24 z-[100] w-[300px] overflow-hidden border border-white/10 p-3 shadow-2xl sm:w-[340px] md:bottom-8 md:right-8 md:top-auto"
          >
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center cursor-pointer justify-center rounded-full bg-black/20 text-white/50 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
              title="Закрыть"
            >
              <X size={14} />
            </button>

            <div className="relative mb-3 h-28 w-full overflow-hidden rounded-lg sm:h-32">
              <img 
                src={MOCK_NEWS.image} 
                alt={MOCK_NEWS.title} 
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-sm bg-orange-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tighter text-white backdrop-blur-sm">
                <MessageSquare size={10} />
                Актуально
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
                <Calendar size={10} />
                {MOCK_NEWS.date}
              </div>
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white sm:text-base">
                {MOCK_NEWS.title}
              </h3>
              
              <div className="pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group flex w-full items-center justify-center gap-2 cursor-pointer rounded-lg border border-white/5 bg-white/5 py-2 text-xs font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 sm:text-sm"
                >
                  Читать полностью
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
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
                  <img src={MOCK_NEWS.image} className="h-full w-full object-cover" alt="Detail" />
                </div>
                
                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">
                    Новинки компании
                  </div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">
                    {MOCK_NEWS.title}
                  </h2>
                  <div className="h-0.5 w-12 bg-orange-500" />
                </div>

                <div className="space-y-4 text-base leading-relaxed text-white/70 sm:text-lg">
                  <p>{MOCK_NEWS.content}</p>
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