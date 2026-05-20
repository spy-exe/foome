'use client';

import { motion, type Variants } from 'framer-motion';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const mockups = [
  { emoji: '🍔', label: 'Home', delay: 0.4 },
  { emoji: '🛵', label: 'Mapa', delay: 0.6 },
  { emoji: '📋', label: 'Pedidos', delay: 0.8 },
];

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-white to-[#F5F5FA] pb-16 pt-32 text-center dark:from-[#12121A] dark:to-[#0E0E14] md:pb-28 md:pt-40">
      <div className="container-page">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <span className="section-tag">📱 App de delivery</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="section-title !mx-auto !max-w-3xl !text-4xl md:!text-5xl lg:!text-6xl"
          >
            Comida boa, <span className="text-brand">na hora certa</span>
          </motion.h1>

          <motion.p variants={item} className="section-subtitle !max-w-xl">
            Descubra os melhores restaurantes da sua região, peça com poucos toques e acompanhe
            cada etapa até a entrega.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#download" className="btn-primary">
              Baixar agora
            </a>
            <a href="#features" className="btn-secondary">
              Ver recursos
            </a>
          </motion.div>
        </motion.div>

        <div className="mt-16 flex flex-wrap justify-center gap-4 md:gap-6">
          {mockups.map((mockup) => (
            <motion.div
              key={mockup.label}
              className="relative flex h-[280px] w-[140px] animate-float items-center justify-center rounded-[32px] border-[3px] border-surface-border bg-white text-5xl shadow-xl shadow-ink/5 dark:border-[#2A2A3A] dark:bg-[#1E1E2A] dark:shadow-black/20 md:h-[400px] md:w-[200px] md:text-7xl"
              style={{ animationDelay: `${mockup.delay}s` }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: mockup.delay, ease: 'easeOut' }}
            >
              {mockup.emoji}
              <span className="absolute bottom-6 font-heading text-xs font-bold text-brand md:text-sm">
                {mockup.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
