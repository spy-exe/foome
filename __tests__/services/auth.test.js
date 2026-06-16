import { cadastrar, autenticar, logout, atualizarPerfil } from '../../services/auth';
import { api, setTokens, clearTokens } from '../../services/api';

jest.mock('../../services/api', () => {
  const real = jest.requireActual('../../services/api');
  return {
    __esModule: true,
    api: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
    setTokens: jest.fn(() => Promise.resolve()),
    clearTokens: jest.fn(() => Promise.resolve()),
    getToken: jest.fn(() => Promise.resolve(null)),
    normalizarErro: real.normalizarErro,
  };
});

const USER_API = {
  id: 1, name: 'Joao', email: 'joao@teste.com', phone: null,
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('auth (API)', () => {
  describe('cadastrar', () => {
    it('registra, guarda tokens e retorna o usuário', async () => {
      api.post.mockResolvedValueOnce({ data: { access_token: 'a', refresh_token: 'r' } });
      api.get.mockResolvedValueOnce({ data: USER_API });

      const result = await cadastrar({ nome: 'Joao', email: 'JOAO@teste.com', senha: '123456' });

      expect(api.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
        name: 'Joao', email: 'joao@teste.com', password: '123456',
      }));
      expect(setTokens).toHaveBeenCalledWith({ access_token: 'a', refresh_token: 'r' });
      expect(result.sucesso).toBe(true);
      expect(result.usuario).toEqual(expect.objectContaining({ nome: 'Joao', email: 'joao@teste.com' }));
    });

    it('mapeia 409 para email_duplicado', async () => {
      api.post.mockRejectedValueOnce({ response: { status: 409, data: { detail: 'E-mail já cadastrado' } } });

      const result = await cadastrar({ nome: 'Joao', email: 'joao@teste.com', senha: '123456' });

      expect(result.sucesso).toBe(false);
      expect(result.erro).toBe('email_duplicado');
      expect(setTokens).not.toHaveBeenCalled();
    });
  });

  describe('autenticar', () => {
    it('loga via form, guarda tokens e retorna o usuário', async () => {
      api.post.mockResolvedValueOnce({ data: { access_token: 'a', refresh_token: 'r' } });
      api.get.mockResolvedValueOnce({ data: USER_API });

      const result = await autenticar('JOAO@teste.com', '123456');

      const [url, body, config] = api.post.mock.calls[0];
      expect(url).toBe('/auth/login');
      expect(body).toContain('username=joao%40teste.com');
      expect(config.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
      expect(result.sucesso).toBe(true);
      expect(result.usuario.email).toBe('joao@teste.com');
    });

    it('mapeia 401 para credenciais', async () => {
      api.post.mockRejectedValueOnce({ response: { status: 401, data: { detail: 'inválidos' } } });

      const result = await autenticar('joao@teste.com', 'errada');

      expect(result.sucesso).toBe(false);
      expect(result.erro).toBe('credenciais');
      expect(result.usuario).toBeNull();
    });
  });

  describe('atualizarPerfil', () => {
    it('faz PATCH /users/me e retorna usuário mapeado', async () => {
      api.patch.mockResolvedValueOnce({ data: { ...USER_API, name: 'Joao Silva' } });

      const result = await atualizarPerfil({ nome: 'Joao Silva', telefone: '24999' });

      expect(api.patch).toHaveBeenCalledWith('/users/me', { name: 'Joao Silva', phone: '24999' });
      expect(result.nome).toBe('Joao Silva');
    });
  });

  describe('logout', () => {
    it('limpa os tokens', async () => {
      await logout();
      expect(clearTokens).toHaveBeenCalled();
    });
  });
});
