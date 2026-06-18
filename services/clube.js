import { listarPedidos } from './pedidos';

// Foome Club — programa de fidelidade calculado a partir do histórico REAL de
// pedidos do usuário. 1 ponto por R$ 1 gasto. Quatro níveis com benefícios
// crescentes; ao chegar em Prata o usuário desbloqueia o cupom do clube.

export const NIVEIS = ['Bronze', 'Prata', 'Ouro', 'Diamante'];

// Pontos necessários para entrar em cada nível.
export const LIMIARES = { Bronze: 0, Prata: 300, Ouro: 800, Diamante: 2000 };

export const CUPOM_CLUBE = 'CLUBE15';

const BENEFICIOS = {
  Bronze: [
    'Acúmulo de 1 ponto por R$ 1 gasto',
    'Ofertas da semana no app',
  ],
  Prata: [
    'Cupom exclusivo CLUBE15 (15% off)',
    'Suporte prioritário no chat',
    'Acúmulo de 1 ponto por R$ 1 gasto',
  ],
  Ouro: [
    'Cupom exclusivo CLUBE15 (15% off)',
    'Frete grátis 1x por semana',
    'Acesso antecipado a novidades',
  ],
  Diamante: [
    'Cupom exclusivo CLUBE15 (15% off)',
    'Frete grátis ilimitado',
    'Brindes surpresa em pedidos selecionados',
    'Gerente de conta Foome',
  ],
};

export const COR_NIVEL = {
  Bronze: '#B45309',
  Prata: '#71717A',
  Ouro: '#D97706',
  Diamante: '#0891B2',
};

export function rankNivel(nivel) {
  const i = NIVEIS.indexOf(nivel);
  return i < 0 ? 0 : i;
}

/** Calcula o status do clube a partir de uma lista de pedidos (puro/testável). */
export function calcularStatus(pedidos = []) {
  const totalGasto = pedidos.reduce((soma, p) => soma + (Number(p.total) || 0), 0);
  const pontos = Math.floor(totalGasto);

  let nivel = 'Bronze';
  for (const n of NIVEIS) {
    if (pontos >= LIMIARES[n]) nivel = n;
  }

  const idx = NIVEIS.indexOf(nivel);
  const proximoNivel = NIVEIS[idx + 1] || null;
  const faltamPontos = proximoNivel ? Math.max(LIMIARES[proximoNivel] - pontos, 0) : 0;

  const base = LIMIARES[nivel];
  const teto = proximoNivel ? LIMIARES[proximoNivel] : base;
  const progresso = proximoNivel ? Math.min((pontos - base) / (teto - base), 1) : 1;

  const temCupomClube = rankNivel(nivel) >= rankNivel('Prata');

  return {
    pontos,
    nivel,
    proximoNivel,
    faltamPontos,
    progresso,
    totalGasto,
    totalPedidos: pedidos.length,
    beneficios: BENEFICIOS[nivel],
    cor: COR_NIVEL[nivel],
    cupomClube: temCupomClube ? CUPOM_CLUBE : null,
  };
}

/** Status do clube do usuário logado. Nunca quebra: sem rede → Bronze zerado. */
export async function getStatusClube() {
  try {
    return calcularStatus(await listarPedidos());
  } catch {
    return calcularStatus([]);
  }
}
