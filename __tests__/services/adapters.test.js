import { mapRestaurante, mapPedido, STATUS_API_TO_APP } from '../../services/adapters';

describe('adapters', () => {
  describe('mapRestaurante', () => {
    it('mapeia o shape da API para o do app, com emoji/cor por categoria', () => {
      const api = {
        id: 1, name: 'Burger Supreme', category: 'Hambúrgueres', description: 'x',
        rating: 4.8, delivery_time_min: 25, delivery_fee: 0, min_order: 0,
        is_open: true, lat: -22.4, lng: -43.6,
        menu_items: [{ id: 10, name: 'Smash', description: 'd', price: 32.9, is_available: true }],
      };
      const r = mapRestaurante(api);
      expect(r).toEqual(expect.objectContaining({
        id: '1', nome: 'Burger Supreme', categoria: 'Hambúrgueres',
        avaliacao: 4.8, tempo: '25-35 min', entrega: 'Grátis',
        cor: '#E8452C',
      }));
      expect(r.produtos[0]).toEqual(expect.objectContaining({ id: '10', nome: 'Smash', preco: 32.9 }));
    });

    it('formata taxa de entrega não-zero', () => {
      const r = mapRestaurante({ id: 2, name: 'P', category: 'Pizzas', delivery_fee: 5, rating: 4 });
      expect(r.entrega).toBe('R$ 5,00');
    });
  });

  describe('mapPedido', () => {
    it('achata restaurante/itens/histórico e converte status', () => {
      const api = {
        id: 7, restaurant_id: 3, restaurant_name: 'Sushi Zen', restaurant_category: 'Japonês',
        status: 'IN_DELIVERY', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T01:00:00Z',
        subtotal: 80, delivery_fee: 8, total: 88, payment_method: 'pix',
        delivery_address: 'Rua X', delivery_code: '1234',
        items: [{ id: 42, menu_item_id: 9, name: 'Combo', unit_price: 68.9, quantity: 1 }],
        history: [
          { status: 'PENDING', timestamp: '2026-01-01T00:00:00Z' },
          { status: 'IN_DELIVERY', timestamp: '2026-01-01T00:30:00Z' },
        ],
      };
      const p = mapPedido(api);
      expect(p.numero).toBe('#F000007');
      expect(p.restaurante).toBe('Sushi Zen');
      expect(p.restauranteCategoria).toBe('Japonês');
      expect(p.restauranteRef).toEqual(expect.objectContaining({ id: '3', nome: 'Sushi Zen' }));
      expect(p.status).toBe('a_caminho');
      expect(p.codigoEntrega).toBe('1234');
      expect(p.itens[0]).toEqual(expect.objectContaining({ id: '42', menuItemId: '9', nome: 'Combo', qtd: 1 }));
      expect(p.historico.map(h => h.status)).toEqual(['confirmado', 'a_caminho']);
    });
  });

  it('STATUS_API_TO_APP cobre todos os estados', () => {
    ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED'].forEach(st => {
      expect(STATUS_API_TO_APP[st]).toBeDefined();
    });
  });
});
