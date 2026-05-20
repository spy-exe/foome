import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  salvarUsuario,
  getUsuario,
  removerUsuario,
  salvarPedidos,
  getPedidos,
} from '../../services/storage';

beforeEach(() => {
  jest.clearAllMocks();
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
});
