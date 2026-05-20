import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { getPedidos, salvarUsuario } from '../services/storage';
import { logout as authLogout, validarSessao } from '../services/auth';

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

      try {
        pedidos = await getPedidos();
      } catch {
        pedidos = [];
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

  const login = (usuario) => dispatch({ type: 'LOGIN', payload: usuario });

  const atualizarPedidosCount = useCallback(async (pedidosCarregados) => {
    const pedidos = Array.isArray(pedidosCarregados)
      ? pedidosCarregados
      : await getPedidos();
    dispatch({ type: 'SET_PEDIDOS_COUNT', payload: pedidos.length });
    return pedidos.length;
  }, []);

  const atualizarUsuario = async (usuarioAtualizado) => {
    await salvarUsuario(usuarioAtualizado);
    dispatch({ type: 'ATUALIZAR_USUARIO', payload: usuarioAtualizado });
    return usuarioAtualizado;
  };

  const logout = async () => {
    await authLogout();
    dispatch({ type: 'LOGOUT' });
  };

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
