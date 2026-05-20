import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RESTAURANTES } from '../services/dados';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { C, F, TYPE, S, R, SHADOW } from '../constants/theme';
import RestauranteCard from '../components/RestauranteCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptic } from '../utils/haptics';

const CATEGORIA_ICONES = {
  hamburgueres: 'fast-food',
  pizzas: 'pizza',
  japones: 'fish',
  mexicano: 'flame',
  saudavel: 'leaf',
  massas: 'restaurant',
  churrasco: 'bonfire',
  acai: 'cafe',
};

const CAT_MAP = {
  hamburgueres: 'Hambúrgueres', pizzas: 'Pizzas', japones: 'Japonês',
  mexicano: 'Mexicano', saudavel: 'Saudável', massas: 'Massas',
  churrasco: 'Churrasco', acai: 'Açaí',
};

export default function CategoriasScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { categoria, label } = route.params || {};
  const { setRestaurante } = useCarrinho();

  const restaurantes = useMemo(() => {
    const cat = CAT_MAP[categoria];
    if (!cat) return [];
    return RESTAURANTES.filter(r => r.categoria === cat);
  }, [categoria]);

  const iconName = CATEGORIA_ICONES[categoria] || 'grid';

  return (
    <View style={s.root}>
      {/* ── Header midnight ── */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <View style={s.headerRow}>
          <TouchableOpacity
            onPress={() => { haptic.select(); navigation.goBack(); }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={22} color={C.offWhite} />
          </TouchableOpacity>
          <Ionicons name={iconName} size={20} color={C.brand} />
          <Text style={s.headerTitle}>{label || categoria}</Text>
        </View>
        <Text style={s.resultCount}>
          {restaurantes.length} restaurante{restaurantes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* ── Lista ── */}
      {restaurantes.length === 0 ? (
        <View style={s.emptyState}>
          <Feather name="search" size={48} color={C.ink4} />
          <Text style={s.emptyTitle}>Nenhum restaurante</Text>
          <Text style={s.emptySub}>Nenhum restaurante encontrado nesta categoria</Text>
        </View>
      ) : (
        <FlatList
          data={restaurantes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <RestauranteCard
              restaurante={item}
              onPress={() => {
                haptic.select();
                setRestaurante(item);
                navigation.navigate('Restaurante', { restaurante: item });
              }}
            />
          )}
          contentContainerStyle={s.listaGap}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.midnight,
    paddingHorizontal: S.lg,
    paddingBottom: S.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: F.uiBold,
    fontSize: 19,
    color: C.offWhite,
    letterSpacing: -0.3,
    flex: 1,
  },
  resultCount: {
    fontFamily: F.mono,
    fontSize: 12,
    color: C.ink4,
    marginLeft: 36,
  },

  listaGap: {
    paddingTop: S.md,
    paddingBottom: 32,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: S.xl,
  },
  emptyTitle: { fontFamily: F.uiBold, fontSize: 17, color: C.inkMid },
  emptySub:   { fontFamily: F.body, fontSize: 14, color: C.inkLight, textAlign: 'center' },
});
