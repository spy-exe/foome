import { listarPedidos } from './pedidos';

/**
 * Retorna os 3 itens mais pedidos pelo usuário (por quantidade total),
 * já com o restaurante de origem para permitir "pedir de novo".
 */
export async function getItensFavoritos() {
  let pedidos = [];
  try {
    pedidos = await listarPedidos();
  } catch {
    return [];
  }
  if (!pedidos.length) return [];

  const contagem = {};
  for (const pedido of pedidos) {
    for (const item of pedido.itens ?? []) {
      if (!item.id) continue;
      if (!contagem[item.id]) {
        contagem[item.id] = {
          ...item,
          qtdTotal: 0,
          vezesPedido: 0,
          restauranteId: pedido.restauranteId,
          restauranteNome: pedido.restauranteNome,
        };
      }
      contagem[item.id].qtdTotal += item.qtd ?? 1;
      contagem[item.id].vezesPedido += 1;
    }
  }

  return Object.values(contagem)
    .sort((a, b) => b.qtdTotal - a.qtdTotal)
    .slice(0, 3);
}

/** Retorna o último pedido feito pelo usuário (a API já devolve do mais novo ao mais antigo). */
export async function getUltimoPedido() {
  try {
    const pedidos = await listarPedidos();
    return pedidos[0] ?? null;
  } catch {
    return null;
  }
}
