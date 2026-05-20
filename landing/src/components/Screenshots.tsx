'use client';

import { motion, type PanInfo } from 'framer-motion';
import { useRef, useState } from 'react';

const screenshots = [
  { emoji: '🏠', label: 'Home', desc: 'Explore restaurantes por categoria' },
  { emoji: '🍔', label: 'Cardápio', desc: 'Adicione itens com um toque' },
  { emoji: '🛒', label: 'Carrinho', desc: 'Revise e confirme com biometria' },
  { emoji: '🗺️', label: 'Mapa', desc: 'Encontre os mais próximos' },
  { emoji: '📋', label: 'Pedidos', desc: 'Acompanhe status em tempo real' },
  { emoji: '👤', label: 'Perfil', desc: 'Dark mode e configurações' },
];

const slideWidth = 296;

export function Screenshots() {
  const [activeIdx, setActiveIdx] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const threshold = 50;

    if (info.offset.x < -threshold && activeIdx < screenshots.length - 1) {
      setActiveIdx((prev) => prev + 1);
    } else if (info.offset.x > threshold && activeIdx > 0) {
      setActiveIdx((prev) => prev - 1);
    }
  }

  return (
    <section className="section-padding overflow-hidden bg-white dark:bg-[#12121A]">
      <div className="container-page">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Screenshots</span>
          <h2 className="section-title">Conheça o app</h2>
          <p className="section-subtitle">Interface intuitiva pensada para o seu dia a dia.</p>
        </motion.div>

        <div
          ref={constraintsRef}
          className="relative mx-auto max-w-[300px] overflow-hidden md:max-w-[500px]"
        >
          <motion.div
            className="flex gap-4"
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            animate={{ x: -activeIdx * slideWidth }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.label}
                className="flex h-[480px] min-w-[280px] select-none flex-col items-center justify-center rounded-[32px] border border-surface-border bg-[#F5F5FA] shadow-lg shadow-ink/5 dark:border-[#2A2A3A] dark:bg-[#1E1E2A] dark:shadow-black/20"
              >
                <span className="mb-6 text-6xl">{screenshot.emoji}</span>
                <span className="font-heading text-lg font-bold text-ink dark:text-[#F0F0F7]">
                  {screenshot.label}
                </span>
                <span className="mt-2 px-6 text-center text-sm text-ink-3 dark:text-[#9494B2]">
                  {screenshot.desc}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {screenshots.map((screenshot, index) => (
            <button
              key={screenshot.label}
              type="button"
              onClick={() => setActiveIdx(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeIdx ? 'w-7 bg-brand' : 'w-2.5 bg-surface-border dark:bg-[#2A2A3A]'
              }`}
              aria-label={`Slide ${index + 1}`}
              aria-current={index === activeIdx ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
