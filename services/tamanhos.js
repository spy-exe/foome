export const TAMANHOS_PRODUTO = [
  { key: 'P', label: 'P', descricao: 'Pequeno', fator: 1 },
  { key: 'M', label: 'M', descricao: 'Medio', fator: 1.2 },
  { key: 'G', label: 'G', descricao: 'Grande', fator: 1.4 },
];

export function fatorTamanho(tamanho) {
  return TAMANHOS_PRODUTO.find(t => t.key === tamanho)?.fator ?? 1;
}

export function precoPorTamanho(precoBase, tamanho) {
  const preco = Number(precoBase) || 0;
  return Math.round(preco * fatorTamanho(tamanho) * 100) / 100;
}

export function produtoComTamanho(produto, tamanho = 'P', observacao = '') {
  const menuItemId = String(produto.menuItemId || produto.id);
  const precoBase = Number(produto.precoBase ?? produto.preco) || 0;
  const obsKey = observacao.trim().toLowerCase().slice(0, 32);

  return {
    ...produto,
    id: `${menuItemId}:${tamanho}${obsKey ? `:${obsKey}` : ''}`,
    menuItemId,
    precoBase,
    preco: precoPorTamanho(precoBase, tamanho),
    tamanho,
    observacao: observacao.trim(),
  };
}
