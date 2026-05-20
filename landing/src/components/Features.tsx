'use client';

import { motion } from 'framer-motion';

const features = [
  {
    emoji: '🔐',
    title: 'Login com Biometria',
    description:
      'Autenticação rápida e segura com sua digital ou Face ID. Sem precisar digitar senha toda vez.',
  },
  {
    emoji: '🗺️',
    title: 'Mapa Interativo',
    description:
      'Encontre restaurantes próximos com geolocalização real e navegação intuitiva pelo mapa.',
  },
  {
    emoji: '📋',
    title: 'Histórico de Pedidos',
    description:
      'Acompanhe todos os seus pedidos com status em tempo real e timeline animada de cada etapa.',
  },
  {
    emoji: '🌙',
    title: 'Dark Mode',
    description:
      'Interface adaptável ao tema do seu dispositivo. Conforto visual a qualquer hora do dia.',
  },
];

export function Features() {
  return (
    <section id="features" className="section-padding bg-white dark:bg-[#12121A]">
      <div className="container-page">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Recursos</span>
          <h2 className="section-title">Tudo que você precisa</h2>
          <p className="section-subtitle">
            Funcionalidades pensadas para tornar seu pedido rápido, seguro e prazeroso.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="card group text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-surface-border bg-white text-3xl transition-transform duration-300 group-hover:scale-110 dark:border-[#2A2A3A] dark:bg-[#12121A]">
                {feature.emoji}
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-ink dark:text-[#F0F0F7]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-3 dark:text-[#9494B2]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
