import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

/**
 * Pede permissão de localização (com fallback honesto) e devolve as coordenadas.
 * Nunca quebra o app: se negar/erro, coords fica null e o app segue normal.
 */
export function useLocalizacao() {
  const [coords, setCoords] = useState(null);
  const [permissao, setPermissao] = useState('indeterminado'); // granted | denied | indeterminado

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!ativo) return;
        setPermissao(status);
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (ativo) setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      } catch {
        if (ativo) setPermissao('denied');
      }
    })();
    return () => { ativo = false; };
  }, []);

  return { coords, permissao };
}

/** Distância em km (Haversine) entre dois pontos {lat,lng}. */
export function distanciaKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
