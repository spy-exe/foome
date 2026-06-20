import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setTokens, clearTokens, getToken, normalizarErro } from './api';

// A foto de perfil é tirada localmente (câmera) e o backend não a armazena,
// então fica no AsyncStorage e é reanexada ao usuário.
const FOTO_KEY = '@foome_foto';

function mapUsuario(u, fotoUri) {
  return {
    id: u.id,
    nome: u.name,
    email: u.email,
    telefone: u.phone || '',
    criadoEm: u.created_at,
    fotoUri: fotoUri ?? null,
  };
}

async function getFoto() {
  return AsyncStorage.getItem(FOTO_KEY);
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return mapUsuario(data, await getFoto());
}

export async function cadastrar({ nome, email, senha, telefone, fotoUri }) {
  try {
    const { data } = await api.post('/auth/register', {
      name: nome.trim(),
      email: email.trim().toLowerCase(),
      password: senha,
      phone: telefone || null,
    });
    await setTokens(data);
    if (fotoUri) await AsyncStorage.setItem(FOTO_KEY, fotoUri);
    return { sucesso: true, erro: null, usuario: await me() };
  } catch (e) {
    const err = normalizarErro(e);
    return {
      sucesso: false,
      erro: err.status === 409 ? 'email_duplicado' : 'erro',
      mensagem: err.mensagem,
      usuario: null,
    };
  }
}

export async function autenticar(email, senha) {
  try {
    // /auth/login espera form (OAuth2PasswordRequestForm), username = e-mail
    const form = new URLSearchParams();
    form.append('username', email.trim().toLowerCase());
    form.append('password', senha);
    const { data } = await api.post('/auth/login', form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    await setTokens(data);
    return { sucesso: true, erro: null, usuario: await me() };
  } catch (e) {
    const err = normalizarErro(e);
    return {
      sucesso: false,
      erro: err.status === 401 ? 'credenciais' : 'erro',
      mensagem: err.mensagem,
      usuario: null,
    };
  }
}

export async function atualizarPerfil({ nome, email, telefone, fotoUri }) {
  const body = {};
  if (nome !== undefined) body.name = nome;
  if (email !== undefined) body.email = email.trim().toLowerCase();
  if (telefone !== undefined) body.phone = telefone;
  const { data } = await api.patch('/users/me', body);
  if (fotoUri !== undefined) {
    if (fotoUri) await AsyncStorage.setItem(FOTO_KEY, fotoUri);
    else await AsyncStorage.removeItem(FOTO_KEY);
  }
  return mapUsuario(data, await getFoto());
}

export async function alterarSenha({ senhaAtual, novaSenha }) {
  await api.put('/users/me/password', {
    current_password: senhaAtual,
    new_password: novaSenha,
  });
}

export async function excluirConta() {
  await api.delete('/users/me');
  await clearTokens();
  await AsyncStorage.removeItem(FOTO_KEY);
}

export async function validarSessao() {
  const token = await getToken();
  if (!token) return null;
  try {
    return await me();
  } catch {
    return null;
  }
}

export async function logout() {
  await clearTokens();
  await AsyncStorage.removeItem(FOTO_KEY);
}
