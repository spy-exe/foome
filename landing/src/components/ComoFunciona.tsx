'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    step: 1,
    title: 'Escolha seu restaurante',
    description:
      'Navegue por categorias, busque por nome ou explore pelo mapa. Encontre o que quiser em segundos.',
  },
  {
    step: 2,
    title: 'Monte seu pedido',
    description:
      'Adicione itens ao carrinho, escolha quantidade, tamanho e adicione observações especiais.',
  },
  {
    step: 3,
    title: 'Acompanhe a entrega',
    description:
      'Confirme com biometria e acompanhe seu pedido em tempo real até a entrega. Depois, avalie!',
  },
];

export function ComoFunciona() {
  return (
    <section className="section-padding bg-[#F5F5FA] dark:bg-[#0E0E14]">
      <div className="container-page">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Como funciona</span>
          <h2 className="section-title">Em 3 passos simples</h2>
          <p className="section-subtitle">Do cardápio à sua porta em minutos.</p>
        </motion.div>

        <div className="mx-auto flex max-w-[620px] flex-col gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className="flex items-start gap-5"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="flex h-12 min-w-[48px] items-center justify-center rounded-md bg-brand font-heading text-xl font-bold text-white shadow-lg shadow-brand/30">
                {step.step}
              </div>
              <div>
                <h3 className="mb-1 font-heading text-lg font-semibold text-ink dark:text-[#F0F0F7]">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-3 dark:text-[#9494B2]">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
