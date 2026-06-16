import { useCallback, useEffect, useState } from 'react';
import { listarRestaurantes } from '../services/restaurantes';
import { normalizarErro } from '../services/api';

/**
 * Carrega a lista de restaurantes da API com estados honestos de
 * loading / erro / vazio. `filtros` aceita { categoria, busca }.
 */
export function useRestaurantes(filtros) {
  const chave = JSON.stringify(filtros || {});
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      setRestaurantes(await listarRestaurantes(filtros));
    } catch (e) {
      setErro(normalizarErro(e).mensagem);
      setRestaurantes([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { restaurantes, loading, erro, recarregar: carregar };
}
