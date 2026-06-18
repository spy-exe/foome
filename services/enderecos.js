import { api } from './api';

// Endereços agora são REAIS: persistem no backend (/addresses) por usuário.
// Este módulo traduz entre o shape do app (pt-BR) e o da API (en, snake/flat).

function mapToApp(a) {
  return {
    id: String(a.id),
    apelido: a.label || '',
    rua: a.street || '',
    numero: a.number || '',
    complemento: a.complement || '',
    bairro: a.neighborhood || '',
    cep: a.cep || '',
    referencia: a.reference || '',
    lat: a.lat ?? null,
    lng: a.lng ?? null,
    default: Boolean(a.is_default),
  };
}

function mapToApi(e) {
  return {
    label: e.apelido?.trim() || null,
    street: e.rua?.trim(),
    number: e.numero?.trim(),
    complement: e.complemento?.trim() || null,
    neighborhood: e.bairro?.trim() || null,
    cep: e.cep?.trim() || null,
    reference: e.referencia?.trim() || null,
    lat: e.lat ?? null,
    lng: e.lng ?? null,
    is_default: Boolean(e.default),
  };
}

/** Linha de endereço pronta para exibir/enviar no pedido. */
export function formatarEndereco(e) {
  if (!e) return '';
  const linha1 = [e.rua, e.numero].filter(Boolean).join(', ');
  const extra = [e.complemento, e.bairro].filter(Boolean).join(' — ');
  return [linha1, extra].filter(Boolean).join(' · ');
}

export async function listarEnderecos() {
  const { data } = await api.get('/addresses');
  return data.map(mapToApp);
}

export async function adicionarEndereco(endereco) {
  const { data } = await api.post('/addresses', mapToApi(endereco));
  return mapToApp(data);
}

export async function atualizarEndereco(id, patch) {
  const { data } = await api.patch(`/addresses/${id}`, mapToApi(patch));
  return mapToApp(data);
}

export async function removerEndereco(id) {
  await api.delete(`/addresses/${id}`);
}

export async function definirEnderecoPadrao(id) {
  const { data } = await api.patch(`/addresses/${id}`, { is_default: true });
  return mapToApp(data);
}

/** O endereço padrão (ou o primeiro, ou null). Usado no checkout. */
export async function getEnderecoPadrao() {
  try {
    const lista = await listarEnderecos();
    return lista.find((e) => e.default) || lista[0] || null;
  } catch {
    return null;
  }
}
