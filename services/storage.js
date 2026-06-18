import AsyncStorage from '@react-native-async-storage/async-storage';

// Armazenamento local (no aparelho) para dados que o backend ainda não guarda:
// favoritos, métodos de pagamento e notificações. Endereços são REAIS e moram
// no backend (ver services/enderecos.js).

// ── Helpers genéricos ──
async function getJSON(key, fallback) {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ── Usuário ──
export async function salvarUsuario(usuario) {
  await setJSON('@foome_usuario', usuario);
}

export async function getUsuario() {
  return getJSON('@foome_usuario', null);
}

export async function removerUsuario() {
  await AsyncStorage.removeItem('@foome_usuario');
}

// ── Pedidos (cache local opcional) ──
export async function salvarPedidos(pedidos) {
  await setJSON('@foome_pedidos', pedidos);
}

export async function getPedidos() {
  return getJSON('@foome_pedidos', []);
}

export const atualizarStatusPedido = async (id, novoStatus) => {
  const pedidos = await getPedidos();
  const atualizados = pedidos.map((p) =>
    p.id === id ? { ...p, status: novoStatus } : p,
  );
  await setJSON('@foome_pedidos', atualizados);
};

// ── Favoritos (lista de IDs de restaurante) ──
const FAV_KEY = '@foome_favoritos';

export async function getFavoritos() {
  return getJSON(FAV_KEY, []);
}

export async function isFavorito(id) {
  const favs = await getFavoritos();
  return favs.includes(String(id));
}

/** Alterna o favorito e devolve o novo estado (true = agora é favorito). */
export async function toggleFavorito(id) {
  const sid = String(id);
  const favs = await getFavoritos();
  const existe = favs.includes(sid);
  const novos = existe ? favs.filter((f) => f !== sid) : [...favs, sid];
  await setJSON(FAV_KEY, novos);
  return !existe;
}

export async function removerFavorito(id) {
  const sid = String(id);
  const favs = await getFavoritos();
  await setJSON(FAV_KEY, favs.filter((f) => f !== sid));
}

// ── Métodos de pagamento (locais, no aparelho) ──
const PAG_KEY = '@foome_pagamentos';

export async function getPagamentos() {
  return getJSON(PAG_KEY, []);
}

export async function adicionarPagamento(pagamento) {
  const lista = await getPagamentos();
  const novo = { id: String(Date.now()), default: lista.length === 0, ...pagamento };
  const base = novo.default ? lista.map((p) => ({ ...p, default: false })) : lista;
  const atualizada = [...base, novo];
  await setJSON(PAG_KEY, atualizada);
  return atualizada;
}

export async function removerPagamento(id) {
  const lista = await getPagamentos();
  let atualizada = lista.filter((p) => p.id !== id);
  // Se removeu o padrão, promove o primeiro restante.
  if (atualizada.length && !atualizada.some((p) => p.default)) {
    atualizada = atualizada.map((p, i) => ({ ...p, default: i === 0 }));
  }
  await setJSON(PAG_KEY, atualizada);
  return atualizada;
}

export async function definirPagamentoPadrao(id) {
  const lista = await getPagamentos();
  const atualizada = lista.map((p) => ({ ...p, default: p.id === id }));
  await setJSON(PAG_KEY, atualizada);
  return atualizada;
}

// ── Notificações (locais) ──
const NOTIF_KEY = '@foome_notificacoes';

export async function getNotificacoes() {
  return getJSON(NOTIF_KEY, []);
}

export async function salvarNotificacoes(lista) {
  await setJSON(NOTIF_KEY, lista);
}

export async function addNotificacao(notificacao) {
  const lista = await getNotificacoes();
  const nova = { id: String(Date.now()), lida: false, ts: Date.now(), ...notificacao };
  const atualizada = [nova, ...lista];
  await setJSON(NOTIF_KEY, atualizada);
  return atualizada;
}

export async function marcarNotificacaoLida(id) {
  const lista = await getNotificacoes();
  const atualizada = lista.map((n) => (n.id === id ? { ...n, lida: true } : n));
  await setJSON(NOTIF_KEY, atualizada);
  return atualizada;
}

export async function marcarTodasLidas() {
  const lista = await getNotificacoes();
  const atualizada = lista.map((n) => ({ ...n, lida: true }));
  await setJSON(NOTIF_KEY, atualizada);
  return atualizada;
}

// ── Limpeza geral (usada em "excluir conta" / logout completo) ──
export const CHAVES_FOOME = [
  '@foome_usuario',
  '@foome_pedidos',
  '@foome_avaliacoes',
  '@foome_tema',
  '@foome_onboarding_done',
  '@foome_token',
  '@foome_refresh',
  '@foome_biometria',
  '@foome_foto',
  '@foome_favoritos',
  '@foome_pagamentos',
  '@foome_notificacoes',
];

export async function limparTodosDadosFoome() {
  await AsyncStorage.multiRemove(CHAVES_FOOME);
}
