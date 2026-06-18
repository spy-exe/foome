import { formatarPreco } from './dados';
import { NIVEIS } from './clube';

// Motor de cupons do Foome. Validação real (regras de mínimo, tipo de desconto e
// exclusividade do clube). Sem backend de cupons ainda — o catálogo vive aqui e
// é a fonte única tanto do checkout quanto da vitrine de ofertas da Home.

function rank(nivel) {
  const i = NIVEIS.indexOf(nivel);
  return i < 0 ? 0 : i;
}

// tipo: 'percent' | 'fixed' | 'free_delivery'
export const CUPONS = [
  {
    codigo: 'FOOME10',
    tipo: 'percent',
    valor: 10,
    minimo: 0,
    teto: null,
    titulo: '10% OFF',
    descricao: '10% de desconto no seu pedido',
    cor: '#FF2E4D',
    clubeMin: null,
  },
  {
    codigo: 'FRETEGRATIS',
    tipo: 'free_delivery',
    valor: 0,
    minimo: 25,
    teto: null,
    titulo: 'Frete grátis',
    descricao: 'Frete grátis em pedidos acima de R$ 25',
    cor: '#16A34A',
    clubeMin: null,
  },
  {
    codigo: 'FOME20',
    tipo: 'fixed',
    valor: 20,
    minimo: 80,
    teto: null,
    titulo: 'R$ 20 OFF',
    descricao: 'R$ 20 de desconto acima de R$ 80',
    cor: '#D97706',
    clubeMin: null,
  },
  {
    codigo: 'CLUBE15',
    tipo: 'percent',
    valor: 15,
    minimo: 0,
    teto: 40,
    titulo: 'Clube 15%',
    descricao: 'Exclusivo Foome Club · 15% off (até R$ 40)',
    cor: '#0891B2',
    clubeMin: 'Prata',
  },
];

export function buscarCupom(codigo) {
  if (!codigo) return null;
  const c = String(codigo).trim().toUpperCase();
  return CUPONS.find((x) => x.codigo === c) || null;
}

function calcular(cupom, subtotal) {
  if (cupom.tipo === 'percent') {
    let d = subtotal * (cupom.valor / 100);
    if (cupom.teto) d = Math.min(d, cupom.teto);
    return { desconto: Math.round(d * 100) / 100, freteGratis: false };
  }
  if (cupom.tipo === 'fixed') {
    return { desconto: Math.min(cupom.valor, subtotal), freteGratis: false };
  }
  if (cupom.tipo === 'free_delivery') {
    return { desconto: 0, freteGratis: true };
  }
  return { desconto: 0, freteGratis: false };
}

function mensagemSucesso(cupom) {
  if (cupom.tipo === 'percent') return `${cupom.valor}% de desconto aplicado!`;
  if (cupom.tipo === 'fixed') return `${formatarPreco(cupom.valor)} de desconto aplicado!`;
  if (cupom.tipo === 'free_delivery') return 'Frete grátis aplicado!';
  return 'Cupom aplicado!';
}

/**
 * Valida um cupom no contexto do carrinho.
 * ctx: { subtotal, taxaEntrega, clubeNivel }
 * Retorna { ok, cupom, desconto, freteGratis, erro, mensagem }.
 */
export function validarCupom(codigo, ctx = {}) {
  const { subtotal = 0, clubeNivel = 'Bronze' } = ctx;
  const cupom = buscarCupom(codigo);

  if (!cupom) {
    return { ok: false, cupom: null, desconto: 0, freteGratis: false, erro: 'inexistente', mensagem: 'Cupom inválido. Confira o código.' };
  }
  if (cupom.clubeMin && rank(clubeNivel) < rank(cupom.clubeMin)) {
    return { ok: false, cupom, desconto: 0, freteGratis: false, erro: 'clube', mensagem: `Exclusivo para membros ${cupom.clubeMin}+ do Foome Club.` };
  }
  if (subtotal < cupom.minimo) {
    return { ok: false, cupom, desconto: 0, freteGratis: false, erro: 'minimo', mensagem: `Válido em pedidos acima de ${formatarPreco(cupom.minimo)}.` };
  }

  const { desconto, freteGratis } = calcular(cupom, subtotal);
  return { ok: true, cupom, desconto, freteGratis, erro: null, mensagem: mensagemSucesso(cupom) };
}

/** Cupons que o usuário pode usar/ver na vitrine (filtra exclusivos do clube). */
export function listarCuponsPublicos({ clubeNivel = 'Bronze' } = {}) {
  return CUPONS.filter((c) => !c.clubeMin || rank(clubeNivel) >= rank(c.clubeMin));
}
