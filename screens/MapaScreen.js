import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Platform, ActivityIndicator, ScrollView,
  ImageBackground,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Feather, Ionicons } from '../components/Icon';
import * as Location from 'expo-location';
import { useRestaurantes } from '../hooks/useRestaurantes';
import CategoriaIcone from '../components/CategoriaIcone';
import Glass from '../components/Glass';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { F, SHADOW } from '../constants/theme';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const CARD_H   = 320;
const VASSOURAS = { latitude: -22.4033, longitude: -43.6617, latitudeDelta: 0.04, longitudeDelta: 0.04 };

const CATEGORIAS_MAPA = [
  { id: null, label: 'Todos' },
  { id: 'Hambúrgueres', label: 'Hambúrgueres' },
  { id: 'Pizzas', label: 'Pizzas' },
  { id: 'Japonês', label: 'Japonês' },
  { id: 'Mexicano', label: 'Mexicano' },
  { id: 'Saudável', label: 'Saudável' },
  { id: 'Massas', label: 'Massas' },
  { id: 'Churrasco', label: 'Churrasco' },
  { id: 'Açaí', label: 'Açaí' },
];

const CORES_CATEGORIA = {
  'Hambúrgueres': '#E8452C',
  'Pizzas':       '#F59E0B',
  'Japonês':      '#8B5CF6',
  'Mexicano':     '#10B981',
  'Saudável':     '#06B6D4',
  'Massas':       '#F97316',
  'Churrasco':    '#EF4444',
  'Açaí':         '#6D28D9',
};

function useMarkerTracking(layoutReady, delay = 450) {
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    if (!layoutReady) {
      setTracks(true);
      return undefined;
    }

    const t = setTimeout(() => setTracks(false), delay);
    return () => clearTimeout(t);
  }, [delay, layoutReady]);
  return tracks;
}

function RestauranteMarker({ rest, onPress }) {
  const cor = CORES_CATEGORIA[rest.categoria] ?? '#E8452C';
  return (
    <Marker
      coordinate={{ latitude: rest.lat, longitude: rest.lng }}
      onPress={onPress}
      pinColor={cor}
      title={rest.nome}
      description={rest.categoria}
    />
  );
}

function UserMarker({ coordinate }) {
  const tracks = useMarkerTracking(true);
  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={tracks}>
      <View style={markerStyles.userWrap}>
        <View style={markerStyles.userDot} />
      </View>
    </Marker>
  );
}

export default function MapaScreen({ navigation }) {
  const { C, isDark } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { setRestaurante } = useCarrinho();
  const [selecionado, setSelecionado] = useState(null);
  const [filtroCat, setFiltroCat] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [locStatus, setLocStatus] = useState('loading');
  const [showFiltro, setShowFiltro] = useState(false);
  const slideY = useRef(new Animated.Value(CARD_H + 60)).current;
  const mapRef = useRef(null);
  const { restaurantes } = useRestaurantes();
  const markersFiltrados = filtroCat
    ? restaurantes.filter(r => r.categoria === filtroCat)
    : restaurantes;
  const regiaoInicial = userLoc || VASSOURAS;

  useEffect(() => {
    obterLocalizacao();
  }, []);

  async function obterLocalizacao() {
    setLocStatus('loading');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLoc(null);
        setLocStatus('denied');
        mapRef.current?.animateToRegion(VASSOURAS, 500);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };

      setUserLoc(region);
      setLocStatus('granted');
      mapRef.current?.animateToRegion(region, 500);
    } catch (e) {
      setUserLoc(null);
      setLocStatus('denied');
      mapRef.current?.animateToRegion(VASSOURAS, 500);
    }
  }

  function centralizarNoUsuario() {
    if (userLoc) {
      mapRef.current?.animateToRegion(userLoc, 600);
      return;
    }
    obterLocalizacao();
  }

  function onPin(rest) {
    haptic.select();
    setSelecionado(rest);
    Animated.spring(slideY, {
      toValue: 0,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
    mapRef.current?.animateToRegion(
      { latitude: rest.lat - 0.009, longitude: rest.lng, latitudeDelta: 0.022, longitudeDelta: 0.022 },
      450,
    );
  }

  function fechar() {
    if (!selecionado) return;
    haptic.select();
    Animated.timing(slideY, {
      toValue: CARD_H + 60,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setSelecionado(null));
  }

  function escolherFiltro(catKey) {
    setFiltroCat(catKey);
    if (catKey && selecionado?.categoria !== catKey) fechar();
  }

  function abrirCardapio() {
    if (!selecionado) return;
    setRestaurante(selecionado);
    const routeNames = navigation.getState?.()?.routeNames || [];
    if (routeNames.includes('HomeTab')) {
      navigation.navigate('HomeTab', {
        screen: 'Restaurante',
        params: { restaurante: selecionado },
      });
      return;
    }
    navigation.navigate('Restaurante', { restaurante: selecionado });
  }

  return (
    <View style={s.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={regiaoInicial}
        showsMyLocationButton={false}
        onPress={fechar}
      >
        {markersFiltrados.map(rest => (
          <RestauranteMarker key={rest.id} rest={rest} onPress={() => onPin(rest)} />
        ))}

        {userLoc && locStatus === 'granted' && (
          <UserMarker coordinate={{ latitude: userLoc.latitude, longitude: userLoc.longitude }} />
        )}
      </MapView>

      {/* ── Header flutuante (glass) ── */}
      <Glass style={s.header} radius={22} intensity={0.9}>
        <TouchableOpacity
          onPress={() => {
            haptic.select();
            navigation.navigate('HomeTab');
          }}
          style={s.backBtn}
        >
          <Feather name="arrow-left" size={20} color={C.ink} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>Perto de você</Text>
          <View style={s.headerSubRow}>
            <Feather name="map-pin" size={11} color={C.ink3} />
            <Text style={s.headerSub}>
              Vassouras, RJ · {markersFiltrados.length} locais
            </Text>
          </View>
        </View>
        {locStatus === 'loading' && <ActivityIndicator size="small" color={C.brand} />}
      </Glass>

      {locStatus === 'denied' && (
        <View style={s.permBanner}>
          <Feather name="map-pin" size={14} color={C.amber} />
          <Text style={s.permTxt}>
            Localização desativada. Mostrando restaurantes em Vassouras/RJ.
          </Text>
          <TouchableOpacity onPress={obterLocalizacao} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.permBtn}>Ativar</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[s.myLocBtn, selecionado && s.myLocBtnRaised, !userLoc && s.myLocBtnOff]}
        onPress={centralizarNoUsuario}
        activeOpacity={0.85}
      >
        <Feather name="crosshair" size={18} color={C.brand} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.myLocBtn, s.filterBtn, selecionado && s.filterBtnRaised]}
        onPress={() => setShowFiltro(v => !v)}
        activeOpacity={0.85}
      >
        <Feather name="sliders" size={18} color={showFiltro ? C.brand : C.ink2} />
      </TouchableOpacity>

      {showFiltro && (
        <View style={[s.filtroRow, locStatus === 'denied' && s.filtroRowWithBanner]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filtroContent}
          >
            {CATEGORIAS_MAPA.map(cat => {
              const ativo = filtroCat === cat.id;
              return (
                <TouchableOpacity
                  key={String(cat.id ?? 'todos')}
                  style={[s.filtroChip, ativo && s.filtroChipOn]}
                  onPress={() => escolherFiltro(cat.id)}
                  activeOpacity={0.85}
                >
                  {cat.id
                    ? <CategoriaIcone categoria={cat.id} size={14} color={ativo ? '#fff' : C.ink2} />
                    : <Feather name="grid" size={14} color={ativo ? '#fff' : C.ink2} />}
                  <Text style={[s.filtroTxt, ativo && s.filtroTxtOn]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Bottom sheet animado (glass) ── */}
      <Animated.View
        style={[s.sheetWrap, { transform: [{ translateY: slideY }] }]}
        pointerEvents={selecionado ? 'auto' : 'none'}
      >
        {selecionado && (
          <Glass style={s.sheet} radius={28} intensity={0.94}>
            <View style={s.handle} />
            <View style={[s.sheetCover, { backgroundColor: `${selecionado.cor}18` }]}>
              {selecionado.imageUrl ? (
                <>
                  <ImageBackground source={{ uri: selecionado.imageUrl }} style={s.sheetCoverPhoto} />
                  <View style={s.sheetCoverShade} />
                </>
              ) : (
                <CategoriaIcone categoria={selecionado.categoria} size={46} color={selecionado.cor} />
              )}
              <View style={[s.sheetCoverBadge, { backgroundColor: selecionado.cor }]}>
                <Text style={s.sheetCoverBadgeTxt}>{selecionado.categoria}</Text>
              </View>
            </View>
            <View style={s.sheetRow}>
              <View style={[s.sheetIcon, { backgroundColor: selecionado.cor + '18' }]}>
                <CategoriaIcone categoria={selecionado.categoria} size={30} color={selecionado.cor} />
              </View>
              <View style={s.sheetInfo}>
                <Text style={s.sheetNome}>{selecionado.nome}</Text>
                <Text style={s.sheetCat}>{selecionado.categoria}</Text>
                <View style={s.sheetMeta}>
                  <Ionicons name="star" size={11} color={C.amber} />
                  <Text style={s.metaTxt}> {selecionado.avaliacao}</Text>
                  <View style={s.dot} />
                  <Feather name="clock" size={11} color={C.ink3} />
                  <Text style={s.metaTxt}> {selecionado.tempo}</Text>
                  <View style={s.dot} />
                  <Text style={[s.metaTxt, selecionado.entrega === 'Grátis' && s.gratis]}>
                    {selecionado.entrega}
                  </Text>
                </View>
                <View style={s.sheetAddress}>
                  <Feather name="map-pin" size={11} color={C.ink3} />
                  <Text style={s.metaTxt}>Vassouras/RJ</Text>
                  <View style={s.dot} />
                  <Text style={s.metaTxt}>{selecionado.produtos.length} itens</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[s.sheetBtn, { backgroundColor: selecionado.cor }]}
              onPress={() => {
                haptic.light();
                abrirCardapio();
              }}
              activeOpacity={0.85}
            >
              <Text style={s.sheetBtnTxt}>Ver cardápio</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          </Glass>
        )}
      </Animated.View>
    </View>
  );
}

const markerStyles = StyleSheet.create({
  userWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 6,
  },
});

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1 },

  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 40,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  backBtn: {
    width: 42, height: 42,
    borderRadius: 13,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  headerText:   { flex: 1 },
  headerTitle:  { fontFamily: F.heading,  fontSize: 17, color: C.ink, letterSpacing: -0.3 },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerSub:    { fontFamily: F.regular,  fontSize: 12, color: C.ink3 },

  permBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 122 : 110,
    left: 16,
    right: 16,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: '#FFD9A8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...SHADOW.float,
  },
  permTxt: { flex: 1, fontFamily: F.medium, fontSize: 12, color: C.ink2, lineHeight: 16 },
  permBtn: { fontFamily: F.heading, fontSize: 12, color: C.brand },

  myLocBtn: {
    position: 'absolute',
    bottom: 180,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.float,
  },
  myLocBtnOff: { opacity: 0.72 },
  myLocBtnRaised: { bottom: CARD_H + 20 },
  filterBtn: { bottom: 232 },
  filterBtnRaised: { bottom: CARD_H + 72 },

  filtroRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 122 : 110,
    left: 0,
    right: 0,
    paddingLeft: 16,
    paddingRight: 76,
  },
  filtroRowWithBanner: {
    top: Platform.OS === 'ios' ? 176 : 164,
  },
  filtroContent: { gap: 6, paddingRight: 16 },
  filtroChip: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.card,
  },
  filtroChipOn: { backgroundColor: C.brand, borderColor: C.brand },
  filtroTxt: { fontFamily: F.medium, fontSize: 12, color: C.ink2 },
  filtroTxtOn: { color: '#fff' },

  sheetWrap: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
  },
  sheet: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 42 : 26,
  },
  handle: {
    width: 44, height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetCover: {
    height: 76,
    borderRadius: 18,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheetCoverPhoto: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetCoverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,18,32,0.22)',
  },
  sheetCoverBadge: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sheetCoverBadgeTxt: { fontFamily: F.heading, fontSize: 11, color: '#fff' },
  sheetRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  sheetIcon: { width: 68, height: 68, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sheetInfo: { flex: 1 },
  sheetNome: { fontFamily: F.headingLg, fontSize: 18, color: C.ink, letterSpacing: -0.4 },
  sheetCat:  { fontFamily: F.regular,   fontSize: 13, color: C.ink3, marginTop: 2 },
  sheetMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  metaTxt:   { fontFamily: F.medium,    fontSize: 12, color: C.ink2 },
  dot:       { width: 3, height: 3, borderRadius: 2, backgroundColor: C.ink4, marginHorizontal: 6 },
  gratis:    { color: C.teal },
  sheetAddress: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },

  sheetBtn: {
    flexDirection: 'row',
    borderRadius: 18,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  sheetBtnTxt: { fontFamily: F.heading, fontSize: 16, color: '#fff' },
});
