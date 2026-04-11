import * as LocalAuthentication from 'expo-local-authentication';

export async function verificarBiometria() {
  const compativel = await LocalAuthentication.hasHardwareAsync();
  if (!compativel) return { sucesso: false, erro: 'Dispositivo não suporta biometria.' };

  const cadastrado = await LocalAuthentication.isEnrolledAsync();
  if (!cadastrado) return { sucesso: false, erro: 'Nenhuma biometria cadastrada no dispositivo.' };

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirme sua identidade',
    subtitleMessage: 'Use digital ou Face ID para continuar',
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar senha',
  });

  return { sucesso: resultado.success, erro: resultado.error || null };
}
