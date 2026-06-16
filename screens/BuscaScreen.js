import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, FlatList, Platform, Keyboard, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '../components/Icon';
import { formatarPreco } from '../services/dados';
import { useRestaurantes } from '../hooks/useRestaurantes';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { F, TYPE, S, R, SHADOW } from '../constants/theme';
import RestauranteCard from '../components/RestauranteCard';
import BottomSheet from '../components/BottomSheet';
import PrimaryButton from '../components/PrimaryButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const AS_KEY = '@foome_buscas';
const MAX_TERMOS = 8;

const CATEGORIAS = [
  { id: 'hamburgueres', label: 'Hambúrgueres', icon: 'fast-food', cor: '#E8452C' },
  { id: 'pizzas',       label: 'Pizzas',       icon: 'pizza',      cor: '#D97706' },
  { id: 'japones',      label: 'Japonês',      icon: 'fish',       cor: '#0891B2' },
  { id: 'mexicano',     label: 'Mexicano',     icon: 'flame',      cor: '#16A34A' },
  { id: 'saudavel',     label: 'Saudável',     icon: 'leaf',       cor: '#059669' },
  { id: 'massas',       label: 'Massas',       icon: 'restaurant', cor: '#7C3AED' },
  { id: 'churrasco',    label: 'Churrasco',    icon: 'bonfire',    cor: '#B45309' },
  { id: 'acai',         label: 'Açaí',         icon: 'cafe',       cor: '#9333EA' },
];

const CAT_MAP = {
  hamburgueres: 'Hambúrgueres', pizzas: 'Pizzas', japones: 'Japonês',
  mexicano: 'Mexicano', saudavel: 'Saudável', massas: 'Massas',
  churrasco: 'Churrasco', acai: 'Açaí',
};

/* ── Radio / Toggle helpers ── */
function RadioGroup({ opcoes, valor, onChange }) {
  const s = useThemedStyles(makeStyles);
  return (
    <View style={s.radioGroup}>
      {opcoes.map(op => {
        const ativo = valor === op.value;
        return (
          <TouchableOpacity
            key={op.value}
            style={s.radioRow}
            onPress={() => { haptic.select(); onChange(op.value); }}
            activeOpacity={0.7}
          >
            <View style={[s.radio, ativo && s.radioAtivo]}>
              {ativo && <View style={s.radioInner} />}
            </View>
            <Text style={[s.radioLabel, ativo && s.radioLabelAtivo]}>{op.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function BuscaScreen({ navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { setRestaurante } = useCarrinho();
  const { restaurantes } = useRestaurantes();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [recentes, setRecentes] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtros
  const [filtroCategorias, setFiltroCategorias] = useState([]);
  const [filtroTempo, setFiltroTempo] = useState('qualquer');
  const [filtroAvaliacao, setFiltroAvaliacao] = useState('qualquer');
  const [filtroGratis, setFiltroGratis] = useState(false);
  const [filtroOrdenar, setFiltroOrdenar] = useState('relevancia');

  /* ── Carregar recentes ── */
  useEffect(() => {
    AsyncStorage.getItem(AS_KEY).then(json => {
      if (json) setRecentes(JSON.parse(json));
    }).catch(() => {});
  }, []);

  /* ── Debounce 300ms ── */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  /* ── Auto focus ── */
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  /* ── Salvar termo buscado ── */
  const salvarTermo = useCallback(async (termo) => {
    if (!termo.trim()) return;
    const nova = [termo.trim(), ...recentes.filter(t => t !== termo.trim())].slice(0, MAX_TERMOS);
    setRecentes(nova);
    await AsyncStorage.setItem(AS_KEY, JSON.stringify(nova)).catch(() => {});
  }, [recentes]);

  const removerTermo = useCallback(async (termo) => {
    const nova = recentes.filter(t => t !== termo);
    setRecentes(nova);
    await AsyncStorage.setItem(AS_KEY, JSON.stringify(nova)).catch(() => {});
  }, [recentes]);

  /* ── Resultados filtrados ── */
  const resultados = useMemo(() => {
    let lista = restaurantes;

    // Busca textual
    if (debounced) {
      const q = debounced.toLowerCase();
      lista = lista.filter(r =>
        r.nome.toLowerCase().includes(q) ||
        r.categoria.toLowerCase().includes(q) ||
        r.produtos.some(p => p.nome.toLowerCase().includes(q))
      );
    }

    // Filtro de categorias
    if (filtroCategorias.length > 0) {
      lista = lista.filter(r =>
        filtroCategorias.some(c => r.categoria === CAT_MAP[c])
      );
    }

    // Filtro de tempo
    if (filtroTempo === '30') {
      lista = lista.filter(r => {
        const min = parseInt(r.tempo.split('–')[0], 10);
        return min <= 30;
      });
    } else if (filtroTempo === '60') {
      lista = lista.filter(r => {
        const min = parseInt(r.tempo.split('–')[0], 10);
        return min <= 60;
      });
    }

    // Avaliação mínima
    if (filtroAvaliacao === '4') {
      lista = lista.filter(r => r.avaliacao >= 4.0);
    } else if (filtroAvaliacao === '4.5') {
      lista = lista.filter(r => r.avaliacao >= 4.5);
    }

    // Entrega grátis
    if (filtroGratis) {
      lista = lista.filter(r => r.entrega === 'Grátis');
    }

    // Ordenação
    switch (filtroOrdenar) {
      case 'tempo':
        lista = [...lista].sort((a, b) => {
          const ta = parseInt(a.tempo.split('–')[0], 10);
          const tb = parseInt(b.tempo.split('–')[0], 10);
          return ta - tb;
        });
        break;
      case 'avaliacao':
        lista = [...lista].sort((a, b) => b.avaliacao - a.avaliacao);
        break;
      case 'taxa':
        lista = [...lista].sort((a, b) => {
          const fa = a.entrega === 'Grátis' ? 0 : parseFloat(a.entrega.replace('R$ ', '').replace(',', '.'));
          const fb = b.entrega === 'Grátis' ? 0 : parseFloat(b.entrega.replace('R$ ', '').replace(',', '.'));
          return fa - fb;
        });
        break;
      default: break;
    }

    return lista;
  }, [restaurantes, debounced, filtroCategorias, filtroTempo, filtroAvaliacao, filtroGratis, filtroOrdenar]);

  const temQuery = debounced.length > 0;
  const filtrosAtivos = filtroCategorias.length
    + (filtroTempo !== 'qualquer' ? 1 : 0)
    + (filtroAvaliacao !== 'qualquer' ? 1 : 0)
    + (filtroGratis ? 1 : 0);

  function toggleCategoriaFiltro(id) {
    setFiltroCategorias(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function limparFiltros() {
    setFiltroCategorias([]);
    setFiltroTempo('qualquer');
    setFiltroAvaliacao('qualquer');
    setFiltroGratis(false);
    setFiltroOrdenar('relevancia');
    haptic.light();
  }

  const qtdFiltros = filtrosAtivos;

  function pressionarRestaurante(rest) {
    haptic.select();
    if (debounced) salvarTermo(debounced);
    setRestaurante(rest);
    navigation.navigate('Restaurante', { restaurante: rest });
  }

  const hasBusca = query.trim().length > 0;

  return (
    <View style={s.root}>
      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <View style={s.headerRow}>
          <TouchableOpacity
            onPress={() => { haptic.select(); Keyboard.dismiss(); navigation.goBack(); }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={22} color={C.ink} />
          </TouchableOpacity>

          <View style={s.searchInputWrap}>
            <Feather name="search" size={16} color={C.inkLight} />
            <TextInput
              testID="input-busca"
              ref={inputRef}
              style={s.searchInput}
              placeholder="Buscar restaurante ou prato..."
              placeholderTextColor={C.inkLight}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && Platform.OS === 'android' && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Feather name="x" size={16} color={C.inkLight} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => { haptic.select(); navigation.goBack(); }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={s.cancelarTxt}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Botão filtros */}
        <TouchableOpacity
          style={[s.filtroBtn, qtdFiltros > 0 && s.filtroBtnAtivo]}
          onPress={() => { haptic.select(); setMostrarFiltros(true); }}
          activeOpacity={0.8}
        >
          <Feather
            name="sliders"
            size={16}
            color={qtdFiltros > 0 ? C.brand : C.inkMid}
          />
          <Text style={[s.filtroBtnTxt, qtdFiltros > 0 && s.filtroBtnTxtAtivo]}>
            Filtros
          </Text>
          {qtdFiltros > 0 && (
            <View style={s.filtroBadge}>
              <Text style={s.filtroBadgeTxt}>{qtdFiltros}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Conteúdo ── */}
      {hasBusca ? (
        <>
          <Text style={s.resultCount}>
            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
          </Text>
          <FlatList
            data={resultados}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <RestauranteCard
                restaurante={item}
                onPress={() => pressionarRestaurante(item)}
              />
            )}
            ListEmptyComponent={
              <View style={s.emptyState}>
                <Feather name="search" size={48} color={C.ink4} />
                <Text style={s.emptyTitle}>Nenhum resultado para "{debounced}"</Text>
                <Text style={s.emptySub}>Tente outro termo</Text>
              </View>
            }
            contentContainerStyle={s.listaGap}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {/* ── Buscas recentes ── */}
              {recentes.length > 0 && (
                <View style={s.secao}>
                  <View style={s.secaoHeader}>
                    <Feather name="clock" size={16} color={C.inkMid} />
                    <Text style={s.secaoTitle}>  Buscas recentes</Text>
                  </View>
                  {recentes.map(termo => (
                    <TouchableOpacity
                      key={termo}
                      style={s.recenteRow}
                      onPress={() => {
                        setQuery(termo);
                        setDebounced(termo);
                      }}
                      activeOpacity={0.7}
                    >
                      <Feather name="clock" size={14} color={C.inkLight} />
                      <Text style={s.recenteTxt} numberOfLines={1}>{termo}</Text>
                      <TouchableOpacity
                        onPress={() => removerTermo(termo)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={s.recenteRemove}
                      >
                        <Feather name="x" size={14} color={C.inkLight} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* ── Categorias ── */}
              <View style={s.secao}>
                <View style={s.secaoHeader}>
                  <Feather name="grid" size={16} color={C.inkMid} />
                  <Text style={s.secaoTitle}>  Categorias</Text>
                </View>
                <View style={s.catGrid}>
                  {CATEGORIAS.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[s.catCard, { backgroundColor: cat.cor + '15' }]}
                      onPress={() => {
                        haptic.select();
                        navigation.navigate('Categorias', { categoria: cat.id, label: cat.label });
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name={cat.icon} size={24} color={cat.cor} />
                      <Text style={[s.catCardLabel, { color: cat.cor }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── BottomSheet de filtros ── */}
      <BottomSheet visivel={mostrarFiltros} onClose={() => setMostrarFiltros(false)} altura={520}>
        <View style={s.sheetContent}>
          <View style={s.sheetTopo}>
            <Text style={s.sheetTitulo}>Filtrar</Text>
            <TouchableOpacity onPress={limparFiltros}>
              <Text style={s.sheetLimpar}>Limpar tudo</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={
              <>
                {/* Categoria */}
                <Text style={s.sheetLabel}>Categoria</Text>
                <View style={s.sheetChipRow}>
                  {CATEGORIAS.map(cat => {
                    const ativa = filtroCategorias.includes(cat.id);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[s.sheetChip, ativa && { backgroundColor: cat.cor + '20', borderColor: cat.cor }]}
                        onPress={() => toggleCategoriaFiltro(cat.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.sheetChipTxt, ativa && { color: cat.cor }]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Tempo de entrega */}
                <Text style={s.sheetLabel}>Tempo de entrega</Text>
                <RadioGroup
                  opcoes={[
                    { label: 'Até 30 min', value: '30' },
                    { label: 'Até 60 min', value: '60' },
                    { label: 'Qualquer', value: 'qualquer' },
                  ]}
                  valor={filtroTempo}
                  onChange={setFiltroTempo}
                />

                {/* Avaliação mínima */}
                <Text style={s.sheetLabel}>Avaliação mínima</Text>
                <RadioGroup
                  opcoes={[
                    { label: '4.0+', value: '4' },
                    { label: '4.5+', value: '4.5' },
                    { label: 'Qualquer', value: 'qualquer' },
                  ]}
                  valor={filtroAvaliacao}
                  onChange={setFiltroAvaliacao}
                />

                {/* Entrega grátis */}
                <View style={s.sheetToggleRow}>
                  <Text style={s.sheetLabel}>Entrega grátis</Text>
                  <TouchableOpacity
                    style={[s.toggle, filtroGratis && s.toggleAtivo]}
                    onPress={() => setFiltroGratis(prev => !prev)}
                  >
                    {filtroGratis && (
                      <Feather name="check" size={14} color={C.white} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Ordenar por */}
                <Text style={s.sheetLabel}>Ordenar por</Text>
                <RadioGroup
                  opcoes={[
                    { label: 'Relevância', value: 'relevancia' },
                    { label: 'Menor tempo', value: 'tempo' },
                    { label: 'Melhor avaliação', value: 'avaliacao' },
                    { label: 'Menor taxa', value: 'taxa' },
                  ]}
                  valor={filtroOrdenar}
                  onChange={setFiltroOrdenar}
                />
              </>
            }
            showsVerticalScrollIndicator={false}
          />

          <PrimaryButton
            label="Ver resultados"
            onPress={() => {
              haptic.medium();
              setMostrarFiltros(false);
            }}
            style={s.sheetCta}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.offWhite },

  header: {
    backgroundColor: C.offWhite,
    paddingHorizontal: S.lg,
    paddingBottom: S.md,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.xl,
    paddingHorizontal: 12, height: 44, gap: 8,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: F.ui,
    fontSize: 15, color: C.ink,
    paddingVertical: 0,
  },
  cancelarTxt: {
    fontFamily: F.uiMedium,
    fontSize: 15, color: C.inkMid,
  },

  filtroBtn: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6, marginTop: S.sm,
    backgroundColor: C.surface,
    borderRadius: R.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: C.border,
  },
  filtroBtnAtivo: {
    borderColor: C.brand,
    backgroundColor: C.brandLight,
  },
  filtroBtnTxt: { fontFamily: F.uiMedium, fontSize: 13, color: C.inkMid },
  filtroBtnTxtAtivo: { color: C.brand },
  filtroBadge: {
    backgroundColor: C.brand,
    borderRadius: R.full,
    minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 5,
  },
  filtroBadgeTxt: { fontFamily: F.monoBold, fontSize: 10, color: C.white },

  resultCount: {
    fontFamily: F.mono, fontSize: 12, color: C.inkLight,
    paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm,
  },

  listaGap: { paddingBottom: 32 },

  emptyState: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyTitle: { fontFamily: F.uiBold, fontSize: 16, color: C.inkMid, textAlign: 'center' },
  emptySub:   { fontFamily: F.body, fontSize: 14, color: C.inkLight },

  /* Recentes & Categorias */
  secao: { paddingHorizontal: S.lg, marginTop: S.xl },
  secaoHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: S.md,
  },
  secaoTitle: { fontFamily: F.uiSemi, fontSize: 16, color: C.ink },

  recenteRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  recenteTxt: {
    flex: 1,
    fontFamily: F.body, fontSize: 14, color: C.inkMid,
  },
  recenteRemove: {
    padding: 4,
  },

  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10,
  },
  catCard: {
    width: (width - 32 - 10) / 2 - 5,
    flexDirection: 'row', alignItems: 'center',
    gap: 10,
    borderRadius: R.md,
    paddingHorizontal: 14, paddingVertical: 16,
  },
  catCardLabel: { fontFamily: F.uiSemi, fontSize: 14 },

  /* BottomSheet */
  sheetContent: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  sheetTopo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: S.xl,
  },
  sheetTitulo: { fontFamily: F.uiBold, fontSize: 19, color: C.ink },
  sheetLimpar: { fontFamily: F.uiMedium, fontSize: 14, color: C.brand },
  sheetLabel: {
    fontFamily: F.uiSemi, fontSize: 14, color: C.ink,
    marginTop: S.lg, marginBottom: S.sm,
  },
  sheetChipRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8,
  },
  sheetChip: {
    borderRadius: R.full,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surfaceAlt,
  },
  sheetChipTxt: { fontFamily: F.uiMedium, fontSize: 13, color: C.inkMid },
  sheetCta: { marginTop: S.xl },

  /* Radio */
  radioGroup: { gap: 6 },
  radioRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8,
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: C.ink4,
    justifyContent: 'center', alignItems: 'center',
  },
  radioAtivo: { borderColor: C.brand },
  radioInner: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: C.brand,
  },
  radioLabel: { fontFamily: F.body, fontSize: 14, color: C.inkMid },
  radioLabelAtivo: { color: C.ink },

  /* Toggle */
  sheetToggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: S.lg, marginBottom: S.sm,
  },
  toggle: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: C.ink4,
    justifyContent: 'center', alignItems: 'center',
  },
  toggleAtivo: { backgroundColor: C.brand },
});
