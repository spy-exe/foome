import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@foome_token';
const REFRESH_KEY = '@foome_refresh';

// Configurável por ambiente. No device físico use o IP da máquina (ver docs/DEMO.md).
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({ baseURL: BASE_URL, timeout: 12000 });

// ── Tokens (única coisa de auth que mora no AsyncStorage) ──
export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}
export async function setTokens({ access_token, refresh_token }) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, access_token],
    [REFRESH_KEY, refresh_token],
  ]);
}
export async function clearTokens() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
}

// ── Interceptor de request: injeta o JWT ──
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Refresh automático no 401 ──
let refreshPromise = null;

async function tentarRefresh() {
  const refresh = await AsyncStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;
  try {
    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh });
    await setTokens(data);
    return true;
  } catch {
    await clearTokens();
    return false;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = original.url || '';
    // login/register/refresh não devem disparar refresh; /auth/me sim.
    const semRefresh = ['/auth/login', '/auth/register', '/auth/refresh'].some((p) => url.includes(p));

    if (status === 401 && !original._retry && !semRefresh) {
      original._retry = true;
      if (!refreshPromise) refreshPromise = tentarRefresh();
      const ok = await refreshPromise.finally(() => { refreshPromise = null; });
      if (ok) {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      }
    }
    return Promise.reject(normalizarErro(error));
  },
);

// Erro normalizado e consistente para a UI consumir.
export function normalizarErro(error) {
  if (error && error.tipo) return error; // já normalizado
  if (error.response) {
    const detail = error.response.data?.detail;
    return {
      tipo: 'api',
      status: error.response.status,
      mensagem: typeof detail === 'string' ? detail : 'Não foi possível completar a ação.',
    };
  }
  if (error.request) {
    return { tipo: 'rede', status: 0, mensagem: 'Sem conexão com o servidor. Verifique sua internet e tente de novo.' };
  }
  return { tipo: 'desconhecido', status: 0, mensagem: error.message || 'Algo deu errado.' };
}
