import AsyncStorage from '@react-native-async-storage/async-storage';

export async function salvarUsuario(usuario) {
  await AsyncStorage.setItem('@foome_usuario', JSON.stringify(usuario));
}

export async function getUsuario() {
  const json = await AsyncStorage.getItem('@foome_usuario');
  return json ? JSON.parse(json) : null;
}

export async function removerUsuario() {
  await AsyncStorage.removeItem('@foome_usuario');
}

export async function salvarPedidos(pedidos) {
  await AsyncStorage.setItem('@foome_pedidos', JSON.stringify(pedidos));
}

export async function getPedidos() {
  const json = await AsyncStorage.getItem('@foome_pedidos');
  return json ? JSON.parse(json) : [];
}

export const atualizarStatusPedido = async (id, novoStatus) => {
  const pedidos = await getPedidos();
  const atualizados = pedidos.map(p =>
    p.id === id ? { ...p, status: novoStatus } : p
  );
  await AsyncStorage.setItem('@foome_pedidos', JSON.stringify(atualizados));
};

// Chaves persistidas pelo Foome no AsyncStorage.
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
  '@foome_enderecos',
  '@foome_pagamentos',
];

export async function limparTodosDadosFoome() {
  await AsyncStorage.multiRemove(CHAVES_FOOME);
}
