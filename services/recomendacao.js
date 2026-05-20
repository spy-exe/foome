import { getPedidos } from './storage';

/**
 * Retorna os 3 itens mais pedidos pelo usuário,
 * ordenados por frequência (quantidade total pedida).
 */
export async function getItensFavoritos() {
  const pedidos = await getPedidos();
  if (!pedidos.length) return [];

  const contagem = {};
  for (const pedido of pedidos) {
    for (const item of pedido.itens ?? []) {
      if (!item.id) continue;

      if (!contagem[item.id]) {
        contagem[item.id] = { ...item, qtdTotal: 0, vezesPedido: 0 };
      }

      contagem[item.id].qtdTotal += item.qtd ?? 1;
      contagem[item.id].vezesPedido += 1;
    }
  }

  return Object.values(contagem)
    .sort((a, b) => b.qtdTotal - a.qtdTotal)
    .slice(0, 3);
}

/**
 * Retorna o último pedido feito pelo usuário.
 */
export async function getUltimoPedido() {
  const pedidos = await getPedidos();
  if (!pedidos.length) return null;

  return [...pedidos].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0];
}
