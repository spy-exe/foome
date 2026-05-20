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
