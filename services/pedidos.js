import { api } from './api';
import { mapPedido } from './adapters';

export async function criarPedido({ restauranteId, itens, endereco, pagamento }) {
  const payload = {
    restaurant_id: Number(restauranteId),
    items: itens.map((i) => ({
      menu_item_id: Number(i.id),
      quantity: i.qtd ?? 1,
      notes: i.observacao || null,
    })),
    delivery_address: endereco || null,
    payment_method: pagamento || null,
  };
  const { data } = await api.post('/orders', payload);
  return mapPedido(data);
}

export async function listarPedidos() {
  const { data } = await api.get('/orders');
  return data.map(mapPedido);
}

export async function obterPedido(id) {
  const { data } = await api.get(`/orders/${id}`);
  return mapPedido(data);
}

export async function avancarStatus(id) {
  const { data } = await api.patch(`/orders/${id}/status`);
  return mapPedido(data);
}

export async function confirmarEntrega(id, codigo) {
  const { data } = await api.post(`/orders/${id}/confirm-delivery`, { delivery_code: codigo });
  return mapPedido(data);
}
