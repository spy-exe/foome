import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Image, Platform, TextInput,
  Animated, Alert, Dimensions, RefreshControl,
} from 'react-native';
import Reanimated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Feather, Ionicons } from '../components/Icon';
import { useFocusEffect } from '@react-navigation/native';
import { formatarPreco } from '../services/dados';
import { listarCuponsPublicos } from '../services/cupons';
import { listarPedidos } from '../services/pedidos';
import { getItensFavoritos, getUltimoPedido } from '../services/recomendacao';
import { useRestaurantes } from '../hooks/useRestaurantes';
import { useLocalizacao, distanciaKm } from '../hooks/useLocalizacao';
import { useApp } from '../contexts/AppContext';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { F, SHADOW } from '../constants/theme';
import RestauranteCard from '../components/RestauranteCard';
import SkeletonShimmer from '../components/SkeletonShimmer';
import Logo from '../components/Logo';
import CategoriaIcone from '../components/CategoriaIcone';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

const CATEGORIAS = [
  { key: 'Hambúrgueres', label: 'Burgers',    icon: 'fast-food-outline'  },
  { key: 'Pizzas',       label: 'Pizza',     icon: 'pizza-outline'      },
  { key: 'Japonês',      label: 'Sushi',     icon: 'fish-outline'       },
  { key: 'Mexicano',     label: 'Mexicano',  icon: 'flame-outline'      },
  { key: 'Saudável',     label: 'Saudável',  icon: 'leaf-outline'       },
  { key: 'Massas',       label: 'Massas',    icon: 'restaurant-outline' },
  { key: 'Churrasco',    label: 'Churrasco', icon: 'bonfire-outline'    },
  { key: 'Açaí',         label: 'Açaí',      icon: 'cafe-outline'       },
];

const makeBanners = (C) => {
  const cupons = listarCuponsPublicos({}).slice(0, 3).map((c) => ({
    id: c.codigo,
    titulo: c.titulo,
    subtitulo: `${c.descricao} — cupom ${c.codigo}`,
    cor: c.cor,
    icone: 'tag',
    tag: 'CUPOM',
  }));
  return [
    { id: 'clube', titulo: 'Foome Club', subtitulo: 'Junte pontos e ganhe cupons exclusivos', cor: C.midnight, icone: 'star', tag: 'NOVO' },
    ...cupons,
  ];
};

function FoomeRefreshControl({ refreshing }) {
  const s = useThemedStyles(makeStyles);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      rotate.value = withRepeat(withTiming(360, { duration: 780 }), -1, false);
    } else {
      rotate.value = withTiming(0, { duration: 180 });
    }
    return () => cancelAnimation(rotate);
  }, [refreshing]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  if (!refreshing) return null;

  return (
    <View style={s.refreshBox}>
      <Reanimated.View style={iconStyle}>
        <Logo variant="symbol" size={28} />
      </Reanimated.View>
      <Text style={s.refreshTxt}>Buscando restaurantes...</Text>
    </View>
  );
}

function HomeSkeletonList() {
  const s = useThemedStyles(makeStyles);
  return (
    <View style={s.skeletonWrap}>
      {[0, 1, 2].map(i => (
        <View key={i} style={s.skeletonCard}>
          <SkeletonShimmer style={s.skeletonHero} />
          <View style={s.skeletonBody}>
            <View style={s.skeletonRow}>
              <SkeletonShimmer style={s.skeletonTitle} />
              <SkeletonShimmer style={s.skeletonPill} />
            </View>
            <SkeletonShimmer style={s.skeletonLine} />
            <SkeletonShimmer style={s.skeletonMeta} />
          </View>
        </View>
      ))}
    </View>
  );
}

function HomeSkeleton() {
  const s = useThemedStyles(makeStyles);
  return (
    <View style={s.skeletonScreen}>
      <SkeletonShimmer style={s.skeletonBanner} />
      <View style={s.skeletonChipRow}>
        {[0, 1, 2, 3, 4].map(i => (
          <SkeletonShimmer key={i} style={s.skeletonChip} />
        ))}
      </View>
      <HomeSkeletonList />
    </View>
  );
}

function HighlightText({ texto, termo }) {
  const s = useThemedStyles(makeStyles);
  if (!termo) return <Text>{texto}</Text>;

  const idx = texto.toLowerCase().indexOf(termo.toLowerCase());
  if (idx === -1) return <Text>{texto}</Text>;

  return (
    <Text>
      {texto.slice(0, idx)}
      <Text style={s.highlightTxt}>{texto.slice(idx, idx + termo.length)}</Text>
      {texto.slice(idx + termo.length)}
    </Text>
  );
}

function CategoriaChip({ cat, ativa, onPress }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, {
      toValue: 0.92,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }

  function pressOut() {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[s.catChip, ativa && s.catChipOn]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        <Ionicons name={cat.icon} size={16} color={ativa ? C.brand : C.ink3} />
        <Text style={[s.catTxt, ativa && s.catTxtOn]}>{cat.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function restaurantesMaisPedidos(pedidos, restaurantes) {
  const contagem = {};

  for (const pedido of pedidos) {
    const id = pedido.restauranteId;
    if (!id) continue;
    contagem[id] = (contagem[id] || 0) + 1;
  }

  return Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => restaurantes.find(r => r.id === id))
    .filter(Boolean)
    .slice(0, 3);
}

export default function HomeScreen({ navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const BANNERS = makeBanners(C);
  const { usuario } = useApp();
  const { adicionar, limpar, setRestaurante } = useCarrinho();
  const { restaurantes, loading, erro, recarregar } = useRestaurantes();
  const { coords } = useLocalizacao();
  const [busca, setBusca]     = useState('');
  const [termoDebounced, setTermoDebounced] = useState('');
  const [catAtiva, setCatAtiva] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [pedidosRaw, setPedidosRaw] = useState([]);
  const [ultimoPedido, setUltimoPedido] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const maisPedidos = useMemo(
    () => restaurantesMaisPedidos(pedidosRaw, restaurantes),
    [pedidosRaw, restaurantes],
  );
  const [bannerIdx, setBannerIdx] = useState(0);
  const fabPulse = useRef(new Animated.Value(1)).current;
  const fabPress = useRef(new Animated.Value(1)).current;
  const bannerScrollRef = useRef(null);
  const refreshTimer = useRef(null);

  useEffect(() => () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  useEffect(() => {
    const texto = busca.trim();
    if (!texto) {
      setTermoDebounced('');
      return undefined;
    }

    const timer = setTimeout(() => setTermoDebounced(texto), 300);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    if (busca.trim()) return undefined;

    const timer = setInterval(() => {
      setBannerIdx(prev => {
        const next = (prev + 1) % BANNERS.length;
        bannerScrollRef.current?.scrollTo({ x: next * BANNER_WIDTH, animated: true });
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [busca]);

  const carregarHistorico = useCallback(async () => {
    const [favoritosDoUsuario, ultimo, pedidos] = await Promise.all([
      getItensFavoritos(),
      getUltimoPedido(),
      listarPedidos().catch(() => []),
    ]);
    return { favoritosDoUsuario, ultimo, pedidos };
  }, []);

  const onRefresh = useCallback(async () => {
    haptic.medium();
    setRefreshing(true);
    try {
      const [{ favoritosDoUsuario, ultimo, pedidos }] = await Promise.all([
        carregarHistorico(),
        recarregar(),
      ]);
      setFavoritos(favoritosDoUsuario);
      setUltimoPedido(ultimo);
      setPedidosRaw(pedidos);
    } finally {
      setRefreshing(false);
    }
  }, [carregarHistorico, recarregar]);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    carregarHistorico().then(({ favoritosDoUsuario, ultimo, pedidos }) => {
      if (!ativo) return;
      setFavoritos(favoritosDoUsuario);
      setUltimoPedido(ultimo);
      setPedidosRaw(pedidos);
    });
    return () => { ativo = false; };
  }, [carregarHistorico]));

  useEffect(() => {
    if (!ultimoPedido || busca) return undefined;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.08,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [busca, fabPulse, ultimoPedido]);

  const fabScale = Animated.multiply(fabPulse, fabPress);

  function repetirUltimoPedido() {
    if (!ultimoPedido) {
      haptic.error();
      Alert.alert('Sem pedidos', 'Faça seu primeiro pedido primeiro!');
      return;
    }

    haptic.heavy();
    limpar();
    setRestaurante(ultimoPedido.restauranteRef);

    for (const item of ultimoPedido.itens ?? []) {
      for (let i = 0; i < (item.qtd ?? 1); i += 1) {
        adicionar(item);
      }
    }

    navigation.navigate('Carrinho');
  }

  const hasBusca = busca.trim().length > 0;
  const termoBusca = termoDebounced || busca.trim();
  const lista = useMemo(() => {
    const filtrados = restaurantes.filter(r => {
      if (catAtiva && r.categoria !== catAtiva) return false;
      if (!termoDebounced) return true;
      const q = termoDebounced.toLowerCase();
      return r.nome.toLowerCase().includes(q) || r.categoria.toLowerCase().includes(q);
    });
    if (!coords) return filtrados;
    // Localização disponível: ordena por proximidade.
    return [...filtrados].sort((a, b) => {
      const da = distanciaKm(coords, { lat: a.lat, lng: a.lng }) ?? 9999;
      const db = distanciaKm(coords, { lat: b.lat, lng: b.lng }) ?? 9999;
      return da - db;
    });
  }, [restaurantes, catAtiva, termoDebounced, coords]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={{ marginBottom: 12 }}>
          <Logo variant="full" size={24} />
        </View>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>
              Olá, {usuario?.nome?.split(' ')[0] || 'visitante'}
            </Text>
            <View style={s.locRow}>
              <Feather name="map-pin" size={11} color={C.ink3} />
              <Text style={s.loc}>Vassouras, RJ</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              haptic.select();
              navigation.navigate('PerfilTab');
            }}
            activeOpacity={0.85}
          >
            {usuario?.fotoUri
              ? <Image source={{ uri: usuario.fotoUri }} style={s.avatar} />
              : (
                <View style={[s.avatar, s.avatarFallback]}>
                  <Feather name="user" size={18} color={C.ink3} />
                </View>
              )
            }
          </TouchableOpacity>
        </View>

        <View style={s.searchRow}>
          <View style={s.searchBar}>
            <Feather name="search" size={16} color={C.ink3} />
            <TextInput
              style={s.searchInput}
              placeholder="Restaurantes ou pratos..."
              placeholderTextColor={C.ink4}
              value={busca}
              onChangeText={setBusca}
              returnKeyType="search"
            />
            {busca.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  haptic.select();
                  setBusca('');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={15} color={C.ink3} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={s.mapaBtn}
            onPress={() => {
              haptic.select();
              navigation.navigate('MapaTab');
            }}
          >
            <Feather name="map" size={18} color={C.brand} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.brand}
            colors={[C.brand, C.amber, C.teal]}
            progressBackgroundColor={C.surface}
          />
        }
      >
        <FoomeRefreshControl refreshing={refreshing} />

        {loading ? (
          <HomeSkeleton />
        ) : erro ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32, gap: 10 }}>
            <Feather name="alert-circle" size={44} color={C.error} />
            <Text style={{ fontFamily: F.heading, fontSize: 17, color: C.ink, marginTop: 6 }}>Não foi possível carregar</Text>
            <Text style={{ fontFamily: F.body, fontSize: 14, color: C.inkLight, textAlign: 'center' }}>{erro}</Text>
            <TouchableOpacity onPress={recarregar} activeOpacity={0.85} style={{ marginTop: 12, backgroundColor: C.brand, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}>
              <Text style={{ fontFamily: F.uiBold, color: '#fff', fontSize: 14 }}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>

        {/* ── Banner promo ── */}
        {!hasBusca && (
          <View style={s.bannerWrap}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
                setBannerIdx(Math.max(0, Math.min(idx, BANNERS.length - 1)));
              }}
              scrollEventThrottle={16}
            >
              {BANNERS.map(banner => (
                <View
                  key={banner.id}
                  style={[s.banner, { backgroundColor: banner.cor, width: BANNER_WIDTH }]}
                >
                  <View>
                    <Text style={s.bannerTag}>{banner.tag}</Text>
                    <Text style={s.bannerTitle}>{banner.titulo}</Text>
                    <Text style={s.bannerSub}>{banner.subtitulo}</Text>
                  </View>
                  <Feather name={banner.icone} size={48} color="rgba(255,255,255,0.25)" />
                </View>
              ))}
            </ScrollView>
            <View style={s.dots}>
              {BANNERS.map((banner, i) => (
                <View key={banner.id} style={[s.dotBanner, i === bannerIdx && s.dotBannerAtivo]} />
              ))}
            </View>
          </View>
        )}

        {/* ── Categorias ── */}
        {!hasBusca && (
          <>
            <Text style={s.sectionLabel}>O que você quer?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.catRow}
            >
              {CATEGORIAS.map(cat => {
                const ativa = catAtiva === cat.key;
                return (
                  <CategoriaChip
                    key={cat.key}
                    cat={cat}
                    ativa={ativa}
                    onPress={() => {
                      haptic.select();
                      setCatAtiva(ativa ? null : cat.key);
                    }}
                  />
                );
              })}
            </ScrollView>
          </>
        )}

        {!hasBusca && !catAtiva && favoritos.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Para você</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.favRow}
            >
              {favoritos.map(item => {
                const rest = restaurantes.find(r => r.id === item.restauranteId);
                if (!rest) return null;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={s.favCard}
                    onPress={() => {
                      haptic.select();
                      setRestaurante(rest);
                      navigation.navigate('Restaurante', { restaurante: rest });
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={[s.favEmoji, { backgroundColor: rest.cor + '18' }]}>
                      <CategoriaIcone categoria={item.categoria} size={30} color={rest.cor} />
                    </View>
                    <Text style={s.favNome} numberOfLines={1}>{item.nome}</Text>
                    <Text style={[s.favPreco, { color: rest.cor }]}>
                      {formatarPreco(item.preco)}
                    </Text>
                    <View style={s.favVezes}>
                      <Feather name="repeat" size={10} color={C.ink3} />
                      <Text style={s.favVezesTxt}>{item.vezesPedido}x pedido</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {!hasBusca && !catAtiva && maisPedidos.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Mais pedidos 🔥</Text>
            {maisPedidos.map(rest => (
              <RestauranteCard
                key={`mais-${rest.id}`}
                restaurante={rest}
                onPress={() => {
                  setRestaurante(rest);
                  navigation.navigate('Restaurante', { restaurante: rest });
                }}
              />
            ))}
          </>
        )}

        {/* ── Lista de restaurantes ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>
            {hasBusca
              ? `Resultados (${lista.length})`
              : catAtiva
                ? CATEGORIAS.find(c => c.key === catAtiva)?.label ?? catAtiva
                : 'Perto de você'}
          </Text>
          {!hasBusca && (
            <TouchableOpacity
              style={s.mapaLink}
              onPress={() => {
                haptic.select();
                navigation.navigate('MapaTab');
              }}
            >
              <Feather name="map-pin" size={12} color={C.brand} />
              <Text style={s.mapaLinkTxt}>Ver no mapa</Text>
            </TouchableOpacity>
          )}
        </View>

        {hasBusca && (
          <Text style={s.searchHint}>
            Buscando por <HighlightText texto={termoBusca} termo={termoBusca} />
          </Text>
        )}

        {refreshing ? (
          <HomeSkeletonList />
        ) : (
          <>
            {lista.length === 0 && (
              <View style={s.vazio}>
                <Feather name="search" size={40} color={C.ink4} />
                <Text style={s.vazioTitulo}>Nenhum resultado</Text>
                <Text style={s.vazioSub}>Tente outro nome ou categoria</Text>
              </View>
            )}

            {lista.map(rest => (
              <RestauranteCard
                key={rest.id}
                restaurante={rest}
                onPress={() => {
                  setRestaurante(rest);
                  navigation.navigate('Restaurante', { restaurante: rest });
                }}
              />
            ))}
          </>
        )}

        <View style={{ height: 36 }} />
          </>
        )}
      </ScrollView>

      {ultimoPedido && !hasBusca && !loading && (
        <Animated.View style={[s.fab, { transform: [{ scale: fabScale }] }]}>
          <TouchableOpacity
            style={s.fabBtn}
            onPress={repetirUltimoPedido}
            activeOpacity={0.85}
            onPressIn={() => {
              Animated.spring(fabPress, {
                toValue: 0.9,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(fabPress, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            }}
          >
            <Feather name="repeat" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    ...SHADOW.card,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greeting: { fontFamily: F.headingLg, fontSize: 20, color: C.ink, letterSpacing: -0.5 },
  locRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  loc:      { fontFamily: F.medium, fontSize: 12, color: C.ink3 },

  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: C.brand },
  avatarFallback: {
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: C.border,
    borderWidth: 1.5,
  },

  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: { flex: 1, fontFamily: F.regular, fontSize: 14, color: C.ink, paddingVertical: 0 },
  mapaBtn: {
    width: 46, height: 46,
    borderRadius: 14,
    backgroundColor: C.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.brandBorder,
  },

  refreshBox: {
    height: 66,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  refreshEmoji: { fontSize: 28 },
  refreshTxt: { fontFamily: F.medium, fontSize: 11, color: C.ink3 },

  bannerWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 112,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 22,
    overflow: 'hidden',
    ...SHADOW.float,
    shadowColor: C.brand,
    shadowOpacity: 0.35,
  },
  bannerTag:   { fontFamily: F.semibold, fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 1.4, marginBottom: 4 },
  bannerTitle: { fontFamily: F.headingLg, fontSize: 24, color: '#fff', letterSpacing: -0.5 },
  bannerSub:   { fontFamily: F.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dotBanner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.ink4,
  },
  dotBannerAtivo: {
    width: 18,
    backgroundColor: C.brand,
  },

  sectionLabel: {
    fontFamily: F.heading,
    fontSize: 17,
    color: C.ink,
    paddingHorizontal: 16,
    marginBottom: 10,
    letterSpacing: -0.2,
  },

  catRow: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surface,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: C.border,
  },
  catChipOn: { backgroundColor: C.brandLight, borderColor: C.brandBorder },
  catTxt:    { fontFamily: F.medium, fontSize: 13, color: C.ink2 },
  catTxtOn:  { color: C.brand },

  favRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 18 },
  favCard: {
    width: 140,
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.card,
  },
  favEmoji: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  favNome: { fontFamily: F.semibold, fontSize: 13, color: C.ink, marginBottom: 2 },
  favPreco: { fontFamily: F.bold, fontSize: 15 },
  favVezes: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  favVezesTxt: { fontFamily: F.medium, fontSize: 10, color: C.ink3 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    marginBottom: 4,
  },
  mapaLink:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapaLinkTxt: { fontFamily: F.semibold, fontSize: 13, color: C.brand },
  searchHint: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.ink3,
    paddingHorizontal: 16,
    marginTop: -4,
    marginBottom: 10,
  },
  highlightTxt: {
    backgroundColor: C.amberLight,
    color: C.ink,
    fontFamily: F.bold,
  },

  vazio: { alignItems: 'center', paddingTop: 64, gap: 10 },
  vazioTitulo: { fontFamily: F.heading,  fontSize: 17, color: C.ink2 },
  vazioSub:    { fontFamily: F.regular,  fontSize: 13, color: C.ink3 },

  skeletonScreen: { paddingTop: 16 },
  skeletonBanner: {
    width: BANNER_WIDTH,
    height: 112,
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 18,
  },
  skeletonChipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  skeletonChip: {
    width: 82,
    height: 38,
    borderRadius: 22,
  },
  skeletonWrap: { paddingHorizontal: 16 },
  skeletonCard: {
    backgroundColor: C.surface,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  skeletonHero: { height: 88, borderRadius: 0 },
  skeletonBody: { padding: 14 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  skeletonTitle: { flex: 1, height: 18, borderRadius: 6 },
  skeletonPill: { width: 54, height: 22, borderRadius: 8 },
  skeletonLine: { width: '48%', height: 12, borderRadius: 6, marginBottom: 12 },
  skeletonMeta: { width: '74%', height: 12, borderRadius: 6 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    zIndex: 100,
    ...SHADOW.float,
  },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
