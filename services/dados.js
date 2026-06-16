// Os dados de restaurantes/cardápios agora vêm da API (services/restaurantes.js).
// Este módulo mantém apenas helpers de formatação compartilhados.

export function formatarPreco(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
}
