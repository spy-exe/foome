import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  salvarUsuario,
  getUsuario,
  removerUsuario,
  salvarPedidos,
  getPedidos,
  atualizarStatusPedido,
  getFavoritos,
  isFavorito,
  toggleFavorito,
  removerFavorito,
  getPagamentos,
  adicionarPagamento,
  removerPagamento,
  definirPagamentoPadrao,
  getNotificacoes,
  salvarNotificacoes,
  addNotificacao,
  marcarNotificacaoLida,
  marcarTodasLidas,
  limparTodosDadosFoome,
  CHAVES_FOOME,
} from '../../services/storage';

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('storage', () => {
  describe('salvarUsuario', () => {
    it('salva usuário no AsyncStorage como JSON', async () => {
      const usuario = { nome: 'Joao', email: 'joao@teste.com' };

      await salvarUsuario(usuario);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@foome_usuario',
        JSON.stringify(usuario),
      );
    });
  });

  describe('getUsuario', () => {
    it('retorna usuário parseado quando existe', async () => {
      const usuario = { nome: 'Joao', email: 'joao@teste.com' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(usuario));

      await expect(getUsuario()).resolves.toEqual(usuario);
    });

    it('retorna null quando não existe usuário', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      await expect(getUsuario()).resolves.toBeNull();
    });
  });

  describe('removerUsuario', () => {
    it('remove a chave do AsyncStorage', async () => {
      await removerUsuario();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@foome_usuario');
    });
  });

  describe('salvarPedidos', () => {
    it('salva array de pedidos como JSON', async () => {
      const pedidos = [{ id: '1', total: 50 }];

      await salvarPedidos(pedidos);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@foome_pedidos',
        JSON.stringify(pedidos),
      );
    });
  });

  describe('getPedidos', () => {
    it('retorna array vazio quando não há pedidos', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      await expect(getPedidos()).resolves.toEqual([]);
    });

    it('retorna pedidos parseados', async () => {
      const pedidos = [{ id: '1', total: 50 }];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(pedidos));

      await expect(getPedidos()).resolves.toEqual(pedidos);
    });
  });

  describe('atualizarStatusPedido', () => {
    it('atualiza apenas o pedido informado', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([
        { id: '1', status: 'confirmado' },
        { id: '2', status: 'preparando' },
      ]));

      await atualizarStatusPedido('2', 'entregue');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@foome_pedidos',
        JSON.stringify([
          { id: '1', status: 'confirmado' },
          { id: '2', status: 'entregue' },
        ]),
      );
    });
  });

  describe('favoritos', () => {
    it('retorna favoritos e verifica item favorito', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(['10', '20']));

      await expect(getFavoritos()).resolves.toEqual(['10', '20']);
      await expect(isFavorito(20)).resolves.toBe(true);
    });

    it('alterna favorito adicionando e removendo', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['10']));
      await expect(toggleFavorito(20)).resolves.toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith('@foome_favoritos', JSON.stringify(['10', '20']));

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['10', '20']));
      await expect(toggleFavorito(10)).resolves.toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith('@foome_favoritos', JSON.stringify(['20']));
    });

    it('remove favorito por id', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(['10', '20']));

      await removerFavorito(10);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@foome_favoritos', JSON.stringify(['20']));
    });
  });

  describe('pagamentos', () => {
    it('retorna lista vazia quando não há pagamentos', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      await expect(getPagamentos()).resolves.toEqual([]);
    });

    it('adiciona primeiro pagamento como padrão', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      await expect(adicionarPagamento({ tipo: 'pix' })).resolves.toEqual([
        { id: '1700000000000', default: true, tipo: 'pix' },
      ]);
    });

    it('ao adicionar pagamento padrão, remove padrão dos anteriores', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([
        { id: '1', default: true, tipo: 'pix' },
      ]));

      await adicionarPagamento({ tipo: 'credito', default: true });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@foome_pagamentos',
        JSON.stringify([
          { id: '1', default: false, tipo: 'pix' },
          { id: '1700000000000', default: true, tipo: 'credito' },
        ]),
      );
    });

    it('remove pagamento e promove o primeiro restante quando necessário', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([
        { id: '1', default: true },
        { id: '2', default: false },
      ]));

      await expect(removerPagamento('1')).resolves.toEqual([{ id: '2', default: true }]);
    });

    it('define pagamento padrão', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([
        { id: '1', default: true },
        { id: '2', default: false },
      ]));

      await definirPagamentoPadrao('2');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@foome_pagamentos',
        JSON.stringify([
          { id: '1', default: false },
          { id: '2', default: true },
        ]),
      );
    });
  });

  describe('notificações', () => {
    it('salva e retorna notificações', async () => {
      const lista = [{ id: 'n1', lida: false }];

      await salvarNotificacoes(lista);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@foome_notificacoes', JSON.stringify(lista));

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(lista));
      await expect(getNotificacoes()).resolves.toEqual(lista);
    });

    it('adiciona notificação no topo', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: 'old' }]));

      await expect(addNotificacao({ titulo: 'Pedido saiu' })).resolves.toEqual([
        { id: '1700000000000', lida: false, ts: 1700000000000, titulo: 'Pedido saiu' },
        { id: 'old' },
      ]);
    });

    it('marca uma ou todas notificações como lidas', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([
        { id: '1', lida: false },
        { id: '2', lida: false },
      ]));
      await expect(marcarNotificacaoLida('2')).resolves.toEqual([
        { id: '1', lida: false },
        { id: '2', lida: true },
      ]);

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([
        { id: '1', lida: false },
        { id: '2', lida: false },
      ]));
      await expect(marcarTodasLidas()).resolves.toEqual([
        { id: '1', lida: true },
        { id: '2', lida: true },
      ]);
    });
  });

  describe('limparTodosDadosFoome', () => {
    it('remove todas as chaves persistidas do Foome', async () => {
      await limparTodosDadosFoome();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(CHAVES_FOOME);
    });
  });
});
