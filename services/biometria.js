import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIO_KEY = '@foome_biometria';

/** O dispositivo tem hardware e biometria cadastrada? */
export async function biometriaDisponivel() {
  try {
    const compativel = await LocalAuthentication.hasHardwareAsync();
    const cadastrado = await LocalAuthentication.isEnrolledAsync();
    return Boolean(compativel && cadastrado);
  } catch {
    return false;
  }
}

/** O usuário ativou login por biometria? */
export async function biometriaAtiva() {
  return (await AsyncStorage.getItem(BIO_KEY)) === 'true';
}

export async function setBiometriaAtiva(ativa) {
  if (ativa) await AsyncStorage.setItem(BIO_KEY, 'true');
  else await AsyncStorage.removeItem(BIO_KEY);
}

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
