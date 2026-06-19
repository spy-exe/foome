// Mapeia o shape da API (snake_case, em inglês) para o shape que o app usa.
// A identidade visual por categoria é só a COR (o ícone vem de CategoriaIcone,
// por categoria — sem emojis).

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
  return CATEGORIA_COR[categoria] || '#FF2E4D';
}

function formatarEntrega(fee) {
  const v = Number(fee) || 0;
  return v === 0 ? 'Grátis' : `R$ ${v.toFixed(2).replace('.', ',')}`;
}

export function mapProduto(p, categoria) {
  return {
    id: String(p.id),
    menuItemId: String(p.id),
    nome: p.name,
    descricao: p.description || '',
    preco: Number(p.price),
    precoBase: Number(p.price),
    imageUrl: p.image_url || null,
    categoria,
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
    tempo: `${min}-${min + 10} min`,
    entrega: formatarEntrega(r.delivery_fee),
    taxaEntrega: Number(r.delivery_fee) || 0,
    pedidoMinimo: Number(r.min_order) || 0,
    aberto: r.is_open !== false,
    cor: corDe(r.category),
    imageUrl: r.image_url || null,
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
    desconto: Number(o.discount_total || 0),
    total: Number(o.total),
    cupom: o.coupon_code || null,
    pagamento: o.payment_method,
    endereco: o.delivery_address,
    codigoEntrega: o.delivery_code,
    // Campos achatados (as telas usam como texto/estilo).
    restauranteId: String(o.restaurant_id),
    restaurante: nome,
    restauranteNome: nome,
    restauranteCategoria: categoria,
    restauranteCor: corDe(categoria),
    restauranteImageUrl: o.restaurant_image_url || null,
    // Objeto pronto para o carrinho (pedir de novo).
    restauranteRef: {
      id: String(o.restaurant_id),
      nome,
      categoria,
      cor: corDe(categoria),
    },
    itens: (o.items || []).map((i) => ({
      id: String(i.menu_item_id),
      menuItemId: String(i.menu_item_id),
      nome: i.name,
      preco: Number(i.unit_price),
      qtd: i.quantity,
      categoria,
      tamanho: i.size || extrairTamanho(i.notes),
      imageUrl: i.image_url || null,
      observacao: limparObservacaoTamanho(i.notes),
    })),
    historico: (o.history || []).map((h) => ({
      status: STATUS_API_TO_APP[h.status] || 'confirmado',
      statusApi: h.status,
      timestamp: h.timestamp,
    })),
  };
}

function extrairTamanho(notes) {
  const match = String(notes || '').match(/^Tamanho:\s*([PMG])/i);
  return match ? match[1].toUpperCase() : null;
}

function limparObservacaoTamanho(notes) {
  return String(notes || '')
    .replace(/^Tamanho:\s*[PMG]\s*\n?/i, '')
    .trim();
}
