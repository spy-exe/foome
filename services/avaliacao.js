import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@foome_avaliacoes';

/**
 * Salva uma avaliação associada ao pedido.
 * @param {string} pedidoId
 * @param {{ nota: number, comentario: string, restauranteNome: string }} avaliacao
 */
export async function salvarAvaliacao(pedidoId, avaliacao) {
  const json = await AsyncStorage.getItem(KEY);
  const avaliacoes = json ? JSON.parse(json) : [];
  const semDuplicarPedido = avaliacoes.filter(a => a.pedidoId !== pedidoId);

  semDuplicarPedido.push({
    pedidoId,
    ...avaliacao,
    timestamp: new Date().toISOString(),
  });

  await AsyncStorage.setItem(KEY, JSON.stringify(semDuplicarPedido));
}

/**
 * Retorna todas as avaliações.
 */
export async function getAvaliacoes() {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
}

/**
 * Retorna a avaliação salva para um pedido, se existir.
 * @param {string} pedidoId
 */
export async function getAvaliacaoPedido(pedidoId) {
  const avaliacoes = await getAvaliacoes();
  return avaliacoes.find(a => a.pedidoId === pedidoId) ?? null;
}

/**
 * Calcula a nota média de um restaurante baseado nas avaliações.
 * @param {string} restauranteNome
 */
export async function getNotaMediaRestaurante(restauranteNome) {
  const avaliacoes = await getAvaliacoes();
  const doRestaurante = avaliacoes.filter(a => a.restauranteNome === restauranteNome);
  if (!doRestaurante.length) return null;

  const media = doRestaurante.reduce((soma, avaliacao) => soma + avaliacao.nota, 0)
    / doRestaurante.length;
  return Math.round(media * 10) / 10;
}
