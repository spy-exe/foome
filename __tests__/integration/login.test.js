import AsyncStorage from '@react-native-async-storage/async-storage';
import { autenticar, cadastrar } from '../../services/auth';

beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.getItem.mockReset();
  AsyncStorage.setItem.mockReset();
});

describe('Fluxo de Login', () => {
  it('cadastra e autentica com sucesso no fluxo completo', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const cadastro = await cadastrar({
      nome: 'Maria',
      email: 'maria@teste.com',
      senha: 'senha123',
      fotoUri: null,
    });

    expect(cadastro.sucesso).toBe(true);
    expect(cadastro.usuario.senhaHash).toBe('hash-senha123');

    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cadastro.usuario));

    const authCorreto = await autenticar('maria@teste.com', 'senha123');
    expect(authCorreto.sucesso).toBe(true);

    const authErrado = await autenticar('maria@teste.com', 'errada');
    expect(authErrado.sucesso).toBe(false);
    expect(authErrado.erro).toBe('senha_incorreta');
  });

  it('bloqueia cadastro com email já existente', async () => {
    const existente = {
      nome: 'Joao',
      email: 'joao@teste.com',
      senhaHash: 'hash-senha123',
    };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existente));

    const result = await cadastrar({
      nome: 'Joao Clone',
      email: 'JOAO@teste.com',
      senha: 'outrasenha',
      fotoUri: null,
    });

    expect(result.sucesso).toBe(false);
    expect(result.erro).toBe('email_duplicado');
  });
});
