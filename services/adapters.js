// Mapeia o shape da API (snake_case, em inglês) para o shape que o app já usa.
// Também devolve identidade visual (emoji/cor) por categoria, mantendo continuidade
// enquanto a Fase 4 (marca) não redesenha os cards.

export const CATEGORIA_EMOJI = {
  'Hambúrgueres': '🍔',
  'Pizzas': '🍕',
  'Japonês': '🍣',
  'Mexicano': '🌮',
  'Saudável': '🥗',
  'Massas': '🍝',
  'Churrasco': '🥩',
  'Açaí': '🫐',
};

export const CATEGORIA_COR = {
  'Hambúrgueres': '#E8452C',
  'Pizzas': '#D97706',
  'Japonês': '#0891B2',
  'Mexicano': '#16A34A',
  'Saudável': '#059669',
  'Massas': '#7C3AED',
  'Churrasco': '#B45309',
  'Açaí': '#9333EA',
};

function corDe(categoria) {
  return CATEGORIA_COR[categoria] || '#E8452C';
}
function emojiDe(categoria) {
  return CATEGORIA_EMOJI[categoria] || '🍽️';
}

function formatarEntrega(fee) {
  const v = Number(fee) || 0;
  return v === 0 ? 'Grátis' : `R$ ${v.toFixed(2).replace('.', ',')}`;
}

export function mapProduto(p, categoria) {
  return {
    id: String(p.id),
    nome: p.name,
    descricao: p.description || '',
    preco: Number(p.price),
    emoji: emojiDe(categoria),
    disponivel: p.is_available !== false,
  };
}

export function mapRestaurante(r) {
  const min = r.delivery_time_min ?? 30;
  return {
    id: String(r.id),
    nome: r.name,
    categoria: r.category,
    descricao: r.description || '',
    avaliacao: Number(r.rating) || 0,
    tempo: `${min}–${min + 10} min`,
    entrega: formatarEntrega(r.delivery_fee),
    taxaEntrega: Number(r.delivery_fee) || 0,
    pedidoMinimo: Number(r.min_order) || 0,
    aberto: r.is_open !== false,
    cor: corDe(r.category),
    emoji: emojiDe(r.category),
    lat: r.lat,
    lng: r.lng,
    produtos: (r.menu_items || []).map((p) => mapProduto(p, r.category)),
  };
}

// API status -> status interno usado pelas telas (4 etapas).
export const STATUS_API_TO_APP = {
  PENDING: 'confirmado',
  ACCEPTED: 'confirmado',
  PREPARING: 'preparando',
  READY: 'preparando',
  IN_DELIVERY: 'a_caminho',
  DELIVERED: 'entregue',
  CANCELLED: 'cancelado',
};

export function mapPedido(o) {
  const categoria = o.restaurant_category;
  const nome = o.restaurant_name;
  return {
    id: String(o.id),
    numero: `#F${String(o.id).padStart(6, '0')}`,
    status: STATUS_API_TO_APP[o.status] || 'confirmado',
    statusApi: o.status,
    timestamp: o.created_at,
    atualizadoEm: o.updated_at,
    subtotal: Number(o.subtotal),
    taxaEntrega: Number(o.delivery_fee),
    total: Number(o.total),
    pagamento: o.payment_method,
    endereco: o.delivery_address,
    codigoEntrega: o.delivery_code,
    // Campos achatados (as telas usam como texto/estilo).
    restauranteId: String(o.restaurant_id),
    restaurante: nome,
    restauranteNome: nome,
    restauranteCategoria: categoria,
    restauranteEmoji: emojiDe(categoria),
    restauranteCor: corDe(categoria),
    // Objeto pronto para o carrinho (pedir de novo).
    restauranteRef: {
      id: String(o.restaurant_id),
      nome,
      categoria,
      emoji: emojiDe(categoria),
      cor: corDe(categoria),
    },
    itens: (o.items || []).map((i) => ({
      id: String(i.menu_item_id),
      nome: i.name,
      preco: Number(i.unit_price),
      qtd: i.quantity,
      emoji: emojiDe(categoria),
      observacao: i.notes || '',
    })),
    historico: (o.history || []).map((h) => ({
      status: STATUS_API_TO_APP[h.status] || 'confirmado',
      statusApi: h.status,
      timestamp: h.timestamp,
    })),
  };
}
