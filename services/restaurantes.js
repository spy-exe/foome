import { api } from './api';
import { mapRestaurante } from './adapters';

export async function listarRestaurantes({ categoria, busca } = {}) {
  const params = {};
  if (categoria) params.category = categoria;
  if (busca) params.search = busca;
  const { data } = await api.get('/restaurants', { params });
  return data.map(mapRestaurante);
}

export async function obterRestaurante(id) {
  const { data } = await api.get(`/restaurants/${id}`);
  return mapRestaurante(data);
}
