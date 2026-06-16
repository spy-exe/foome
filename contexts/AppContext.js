import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { listarPedidos } from '../services/pedidos';
import { logout as authLogout, validarSessao, atualizarPerfil } from '../services/auth';

const AppContext = createContext(null);

const initialState = {
  usuario: null,
  carregando: true,
  pedidosCount: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, usuario: action.payload, carregando: false };
    case 'LOGOUT':
      return { ...state, usuario: null, carregando: false, pedidosCount: 0 };
    case 'CARREGADO':
      return { ...state, usuario: action.payload, carregando: false };
    case 'ATUALIZAR_USUARIO':
      return { ...state, usuario: action.payload, carregando: false };
    case 'SET_PEDIDOS_COUNT':
      return { ...state, pedidosCount: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      let usuario = null;
      let pedidos = [];

      try {
        usuario = await validarSessao();
      } catch {
        usuario = null;
      }

      if (usuario) {
        try {
          pedidos = await listarPedidos();
        } catch {
          pedidos = [];
        }
      }

      if (!ativo) return;
      dispatch({ type: 'CARREGADO', payload: usuario });
      dispatch({ type: 'SET_PEDIDOS_COUNT', payload: pedidos.length });
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const login = useCallback(async (usuario) => {
    dispatch({ type: 'LOGIN', payload: usuario });
    try {
      const pedidos = await listarPedidos();
      dispatch({ type: 'SET_PEDIDOS_COUNT', payload: pedidos.length });
    } catch {
      // sem rede: mantém contagem atual
    }
  }, []);

  const atualizarPedidosCount = useCallback(async (pedidosCarregados) => {
    let pedidos = pedidosCarregados;
    if (!Array.isArray(pedidos)) {
      try {
        pedidos = await listarPedidos();
      } catch {
        pedidos = [];
      }
    }
    dispatch({ type: 'SET_PEDIDOS_COUNT', payload: pedidos.length });
    return pedidos.length;
  }, []);

  const atualizarUsuario = useCallback(async (usuarioAtualizado) => {
    const atualizado = await atualizarPerfil({
      nome: usuarioAtualizado.nome,
      telefone: usuarioAtualizado.telefone,
      fotoUri: usuarioAtualizado.fotoUri,
    });
    dispatch({ type: 'ATUALIZAR_USUARIO', payload: atualizado });
    return atualizado;
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AppContext.Provider
      value={{ ...state, atualizarPedidosCount, atualizarUsuario, login, logout }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}

export function usePedidosCount() {
  return useApp().pedidosCount;
}
