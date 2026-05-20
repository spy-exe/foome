import * as LocalAuthentication from 'expo-local-authentication';
import { verificarBiometria } from '../../services/biometria';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('biometria', () => {
  it('retorna sucesso true quando biometria autentica', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
    LocalAuthentication.authenticateAsync.mockResolvedValue({ success: true, error: null });

    const result = await verificarBiometria();

    expect(result).toEqual({ sucesso: true, erro: null });
  });

  it('retorna erro quando hardware não suporta biometria', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(false);

    const result = await verificarBiometria();

    expect(result.sucesso).toBe(false);
    expect(result.erro).toContain('não suporta');
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
  });

  it('retorna erro quando nenhuma biometria está cadastrada', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(false);

    const result = await verificarBiometria();

    expect(result.sucesso).toBe(false);
    expect(result.erro).toContain('Nenhuma biometria');
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
  });

  it('retorna erro quando autenticação falha', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
    LocalAuthentication.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'user_cancel',
    });

    const result = await verificarBiometria();

    expect(result).toEqual({ sucesso: false, erro: 'user_cancel' });
  });
});
