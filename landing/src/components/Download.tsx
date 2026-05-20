'use client';

import { motion } from 'framer-motion';

export function Download() {
  return (
    <section id="download" className="section-padding bg-brand">
      <div className="container-page text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-3 font-heading text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Pronto para pedir?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-base text-white/70 md:text-lg">
            Baixe o Foome agora e experimente o delivery como ele deveria ser.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 rounded-lg bg-white px-7 py-3.5 font-heading text-sm font-bold text-ink shadow-lg shadow-black/15"
            >
              <span className="text-xl">🍎</span>
              <span className="text-left">
                <span className="block font-sans text-[10px] font-medium leading-none text-ink-3">
                  Baixar na
                </span>
                <span className="block text-base leading-tight">App Store</span>
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 rounded-lg bg-ink px-7 py-3.5 font-heading text-sm font-bold text-white shadow-lg shadow-black/20 dark:bg-black"
            >
              <span className="text-xl">🤖</span>
              <span className="text-left">
                <span className="block font-sans text-[10px] font-medium leading-none text-white/50">
                  Disponível no
                </span>
                <span className="block text-base leading-tight">Google Play</span>
              </span>
            </motion.button>
          </div>

          <p className="mt-6 text-xs text-white/40">
            * Disponível em breve. Inscreva-se para ser notificado.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
