import { cadastrar, autenticar } from '../../services/auth';
import { api } from '../../services/api';

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
  id: 7, name: 'Maria', email: 'maria@teste.com', phone: null,
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => jest.clearAllMocks());

describe('Fluxo de Login (API)', () => {
  it('cadastra e autentica com sucesso', async () => {
    api.post.mockResolvedValue({ data: { access_token: 'a', refresh_token: 'r' } });
    api.get.mockResolvedValue({ data: USER_API });

    const cadastro = await cadastrar({ nome: 'Maria', email: 'maria@teste.com', senha: 'senha123' });
    expect(cadastro.sucesso).toBe(true);

    const auth = await autenticar('maria@teste.com', 'senha123');
    expect(auth.sucesso).toBe(true);
    expect(auth.usuario.nome).toBe('Maria');
  });

  it('bloqueia cadastro com email já existente (409)', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 409, data: { detail: 'E-mail já cadastrado' } } });

    const result = await cadastrar({ nome: 'Joao Clone', email: 'JOAO@teste.com', senha: 'outrasenha' });

    expect(result.sucesso).toBe(false);
    expect(result.erro).toBe('email_duplicado');
  });

  it('rejeita credenciais inválidas (401)', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 401, data: { detail: 'inválidos' } } });

    const result = await autenticar('maria@teste.com', 'errada');
    expect(result.sucesso).toBe(false);
    expect(result.erro).toBe('credenciais');
  });
});
