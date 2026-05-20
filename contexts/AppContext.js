import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { getUsuario, removerUsuario } from '../services/storage';

const AppContext = createContext(null);

const initialState = {
  usuario: null,
  carregando: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, usuario: action.payload, carregando: false };
    case 'LOGOUT':
      return { ...state, usuario: null, carregando: false };
    case 'CARREGADO':
      return { ...state, usuario: action.payload, carregando: false };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getUsuario().then(usuario => {
      dispatch({ type: 'CARREGADO', payload: usuario });
    });
  }, []);

  const login = (usuario) => dispatch({ type: 'LOGIN', payload: usuario });

  const logout = async () => {
    await removerUsuario();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AppContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
