import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';
import { Feather, Ionicons } from '../components/Icon';
import { getFavoritos, removerFavorito } from '../services/storage';
import { listarRestaurantes } from '../services/restaurantes';
import CategoriaIcone from '../components/CategoriaIcone';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, R, S, SHADOW } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

export default function FavoritosScreen({ navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [restaurantes, setRestaurantes] = useState([]);

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function carregar() {
    const ids = await getFavoritos();
    if (!ids.length) {
      setRestaurantes([]);
      return;
    }
    try {
      const todos = await listarRestaurantes();
      setRestaurantes(todos.filter(r => ids.includes(r.id)));
    } catch {
      setRestaurantes([]);
    }
  }

  async function handleRemover(r) {
    Alert.alert('Remover dos favoritos', `Deseja remover ${r.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => { await removerFavorito(r.id); setRestaurantes(prev => prev.filter(x => x.id !== r.id)); } },
    ]);
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity style={[s.card, { backgroundColor: C.surface }]} onPress={() => navigation.navigate('HomeTab', { screen: 'Restaurante', params: { restaurante: item } })} onLongPress={() => handleRemover(item)} activeOpacity={0.85}>
        <View style={[s.cardTopo, { backgroundColor: item.cor + '1A' }]}>
          <CategoriaIcone categoria={item.categoria} size={30} color={item.cor} />
          <View style={[s.ratingPill, { backgroundColor: C.warningLight }]}>
            <Ionicons name="star" size={11} color={C.warning} />
            <Text style={s.ratingTxt}> {item.avaliacao}</Text>
          </View>
        </View>
        <View style={s.cardBody}>
          <Text style={s.cardNome} numberOfLines={1}>{item.nome}</Text>
          <Text style={s.cardCategoria}>{item.categoria}</Text>
          <View style={s.cardMeta}>
            <Feather name="clock" size={10} color={C.inkLight} />
            <Text style={s.cardMetaTxt}>{item.tempo}</Text>
            <View style={s.dot} />
            <Text style={[s.cardMetaTxt, item.entrega === 'Grátis' && { color: C.success }]}>{item.entrega === 'Grátis' ? 'Grátis' : item.entrega}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.offWhite }]}>
      <View style={[s.header, { backgroundColor: C.surface, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={16}><Feather name="x" size={22} color={C.ink} /></TouchableOpacity>
        <Text style={s.headerTitle}>Favoritos</Text>
        <Heart size={22} color={C.brand} fill={C.brand} />
      </View>

      {restaurantes.length === 0 ? (
        <View style={s.empty}>
          <Heart size={56} color={C.inkLight} strokeWidth={1.5} />
          <Text style={s.emptyTitulo}>Nenhum favorito ainda</Text>
          <Text style={s.emptySub}>Toque no coração de qualquer restaurante para salvar</Text>
          <TouchableOpacity style={s.emptyCta} onPress={() => navigation.navigate('HomeTab')} activeOpacity={0.85}>
            <Text style={s.emptyCtaTxt}>Explorar restaurantes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={restaurantes} keyExtractor={item => item.id} numColumns={2} contentContainerStyle={s.grid} columnWrapperStyle={s.gridRow} renderItem={renderItem} />
      )}
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingBottom: S.md, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontFamily: F.uiBold, fontSize: 18, color: C.ink },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: S.xl },
  emptyTitulo: { fontFamily: F.uiSemi, fontSize: 17, color: C.ink, marginTop: S.lg },
  emptySub: { fontFamily: F.body, fontSize: 14, color: C.inkLight, textAlign: 'center', marginTop: S.sm, lineHeight: 20 },
  emptyCta: { backgroundColor: C.brand, borderRadius: R.md, paddingHorizontal: S.xl, paddingVertical: S.md, marginTop: S.xl },
  emptyCtaTxt: { fontFamily: F.uiSemi, fontSize: 15, color: C.white },
  grid: { padding: S.lg },
  gridRow: { gap: S.md },
  card: { flex: 1, borderRadius: R.lg, overflow: 'hidden', marginBottom: S.md, ...SHADOW.card, height: 170 },
  cardTopo: { height: 80, justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 32 },
  ratingPill: { position: 'absolute', top: 6, right: 6, flexDirection: 'row', alignItems: 'center', borderRadius: R.sm, paddingHorizontal: 6, paddingVertical: 2 },
  ratingTxt: { fontFamily: F.monoBold, fontSize: 10, color: C.warning },
  cardBody: { padding: S.sm, flex: 1, justifyContent: 'space-between' },
  cardNome: { fontFamily: F.uiSemi, fontSize: 13, color: C.ink },
  cardCategoria: { fontFamily: F.body, fontSize: 11, color: C.inkLight, marginTop: 1 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaTxt: { fontFamily: F.mono, fontSize: 10, color: C.inkMid },
  dot: { width: 2, height: 2, borderRadius: 1, backgroundColor: C.inkLight, marginHorizontal: 2 },
});
