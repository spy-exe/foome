import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { hashSenha, autenticar, cadastrar, logout } from '../../services/auth';

beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.getItem.mockReset();
  AsyncStorage.setItem.mockReset();
  AsyncStorage.removeItem.mockReset();
});

describe('auth', () => {
  describe('hashSenha', () => {
    it('gera hash SHA-256 da senha', async () => {
      const hash = await hashSenha('minha-senha');

      expect(hash).toBe('hash-minha-senha');
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
        Crypto.CryptoDigestAlgorithm.SHA256,
        'minha-senha',
      );
    });
  });

  describe('cadastrar', () => {
    it('cadastra novo usuário com senha hasheada', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await cadastrar({
        nome: 'Joao',
        email: 'JOAO@teste.com',
        senha: '123456',
        fotoUri: null,
      });

      expect(result.sucesso).toBe(true);
      expect(result.erro).toBeNull();
      expect(result.usuario).toEqual(
        expect.objectContaining({
          nome: 'Joao',
          email: 'joao@teste.com',
          senhaHash: 'hash-123456',
          fotoUri: null,
        }),
      );
      expect(result.usuario.senhaHash).not.toBe('123456');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@foome_usuario',
        expect.stringContaining('"senhaHash":"hash-123456"'),
      );
    });

    it('rejeita email duplicado', async () => {
      const existente = { nome: 'Joao', email: 'joao@teste.com', senhaHash: 'abc' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existente));

      const result = await cadastrar({
        nome: 'Joao 2',
        email: 'JOAO@teste.com',
        senha: '654321',
        fotoUri: null,
      });

      expect(result).toEqual({ sucesso: false, erro: 'email_duplicado' });
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('autenticar', () => {
    it('autentica com credenciais corretas', async () => {
      const usuario = { nome: 'Joao', email: 'joao@teste.com', senhaHash: 'hash-123456' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(usuario));

      const result = await autenticar('JOAO@teste.com', '123456');

      expect(result).toEqual({ sucesso: true, erro: null, usuario });
    });

    it('retorna erro para email não cadastrado', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await autenticar('inexistente@teste.com', '123456');

      expect(result).toEqual({
        sucesso: false,
        erro: 'email_nao_encontrado',
        usuario: null,
      });
    });

    it('retorna erro para email diferente do cadastrado', async () => {
      const usuario = { nome: 'Joao', email: 'joao@teste.com', senhaHash: 'hash-123456' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(usuario));

      const result = await autenticar('outro@teste.com', '123456');

      expect(result).toEqual({
        sucesso: false,
        erro: 'email_nao_encontrado',
        usuario: null,
      });
    });

    it('retorna erro para senha incorreta', async () => {
      const usuario = { nome: 'Joao', email: 'joao@teste.com', senhaHash: 'hash-123456' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(usuario));

      const result = await autenticar('joao@teste.com', 'wrong');

      expect(result).toEqual({
        sucesso: false,
        erro: 'senha_incorreta',
        usuario: null,
      });
    });
  });

  describe('logout', () => {
    it('remove usuário do AsyncStorage', async () => {
      await logout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@foome_usuario');
    });
  });
});
