import React, { createContext, useContext, useReducer } from 'react';

const CarrinhoContext = createContext(null);

const initialState = {
  itens: [],
  restaurante: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADICIONAR': {
      const existe = state.itens.find(item => item.id === action.payload.id);
      if (existe) {
        return {
          ...state,
          itens: state.itens.map(item =>
            item.id === action.payload.id
              ? { ...item, qtd: item.qtd + 1 }
              : item
          ),
        };
      }

      return {
        ...state,
        itens: [...state.itens, { ...action.payload, qtd: 1 }],
      };
    }
    case 'REMOVER': {
      const item = state.itens.find(i => i.id === action.payload);
      if (!item) return state;
      if (item.qtd === 1) {
        return { ...state, itens: state.itens.filter(i => i.id !== action.payload) };
      }

      return {
        ...state,
        itens: state.itens.map(i =>
          i.id === action.payload ? { ...i, qtd: i.qtd - 1 } : i
        ),
      };
    }
    case 'SET_RESTAURANTE':
      return { ...state, restaurante: action.payload };
    case 'LIMPAR':
      return initialState;
    default:
      return state;
  }
}

export function CarrinhoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const adicionar = (produto) => dispatch({ type: 'ADICIONAR', payload: produto });
  const remover = (id) => dispatch({ type: 'REMOVER', payload: id });
  const setRestaurante = (restaurante) => {
    dispatch({ type: 'SET_RESTAURANTE', payload: restaurante });
  };
  const limpar = () => dispatch({ type: 'LIMPAR' });
  const totalItens = state.itens.reduce((soma, item) => soma + item.qtd, 0);
  const totalPreco = state.itens.reduce(
    (soma, item) => soma + item.preco * item.qtd,
    0,
  );

  return (
    <CarrinhoContext.Provider
      value={{
        ...state,
        adicionar,
        remover,
        setRestaurante,
        limpar,
        totalItens,
        totalPreco,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider');
  return ctx;
}
